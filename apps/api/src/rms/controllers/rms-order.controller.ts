import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiAuth,
  ApiResourceErrors,
  ApiUuidParam,
} from 'src/common/decorators/api-crud.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { StandardApiResponse } from 'src/common/dto/standard-api-response.dto';
import { AddOrderItemsDto } from 'src/order/dto/add-order-items.dto';
import { ApplyDiscountDto } from 'src/order/dto/apply-discount.dto';
import { OrderResponseDto } from 'src/order/dto/order-response.dto';
import { QuickSaleCheckoutDto } from 'src/order/dto/quick-sale-checkout.dto';
import { UpdateOrderStatusDto } from 'src/order/dto/update-order-status.dto';
import { OrderService } from 'src/order/order.service';

/**
 * RMS Order Controller
 *
 * Handles all order-related operations for the Restaurant Management System (POS).
 * All endpoints require JWT authentication.
 */
@ApiTags('RMS / Orders')
@Controller('rms/orders')
@UseGuards(JwtAuthGuard)
export class RmsOrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Quick sale checkout (POS mode)
   * Creates session, cart items, and order in a single atomic operation.
   * Optimized for quick sale (counter/phone/takeout) orders where speed is critical.
   */
  @Post('quick-checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Quick sale checkout (POS)',
    description:
      'Creates session, cart items, and order in a single atomic operation. ' +
      'Optimized for quick sale (counter/phone/takeout) orders where speed is critical. ' +
      'Bypasses the normal flow of creating session -> adding items -> checkout.',
  })
  @ApiAuth()
  @ApiSuccessResponse(OrderResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
  })
  @ApiResourceErrors()
  async quickCheckout(
    @GetUser('sub') userId: string,
    @Body() dto: QuickSaleCheckoutDto
  ): Promise<StandardApiResponse<OrderResponseDto>> {
    const order = await this.orderService.quickCheckout(dto, userId);
    return StandardApiResponse.success(order);
  }

  /**
   * Get paginated orders for a store
   */
  @Get()
  @ApiOperation({
    summary: 'Get all orders for a store with pagination',
    description: 'Returns paginated list of orders for a specific store',
  })
  @ApiAuth()
  @ApiQuery({ name: 'storeId', description: 'Store ID', required: true })
  @ApiQuery({
    name: 'page',
    description: 'Page number (1-indexed)',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page (max 100)',
    required: false,
    type: Number,
  })
  @ApiSuccessResponse(PaginatedResponseDto<OrderResponseDto>, {
    description: 'Orders retrieved successfully',
  })
  async findByStore(
    @Query('storeId') storeId: string,
    @Query() paginationDto: PaginationQueryDto
  ): Promise<StandardApiResponse<PaginatedResponseDto<OrderResponseDto>>> {
    const orders = await this.orderService.findByStore(storeId, paginationDto);
    return StandardApiResponse.success(orders);
  }

  /**
   * Get single order by ID
   */
  @Get(':orderId')
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Returns full order details including items and payment status',
  })
  @ApiAuth()
  @ApiUuidParam('orderId', 'Order ID')
  @ApiSuccessResponse(OrderResponseDto, {
    description: 'Order retrieved successfully',
  })
  @ApiResourceErrors()
  async findOne(
    @Param('orderId') orderId: string
  ): Promise<StandardApiResponse<OrderResponseDto>> {
    const order = await this.orderService.findOne(orderId);
    return StandardApiResponse.success(order);
  }

  /**
   * Add items to an existing order
   * Used when customers order additional items during their meal.
   */
  @Post(':orderId/items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add items to order',
    description:
      'Add additional items to an existing order. ' +
      'Only works for orders in PENDING or PREPARING status. ' +
      'Updates order totals and broadcasts to kitchen display.',
  })
  @ApiAuth()
  @ApiUuidParam('orderId', 'Order ID')
  @ApiSuccessResponse(OrderResponseDto, {
    description: 'Items added successfully',
  })
  @ApiResourceErrors()
  async addItems(
    @GetUser('sub') userId: string,
    @Param('orderId') orderId: string,
    @Body() dto: AddOrderItemsDto
  ): Promise<StandardApiResponse<OrderResponseDto>> {
    const order = await this.orderService.addItemsToOrder(orderId, dto, userId);
    return StandardApiResponse.success(order);
  }

  /**
   * Update order status
   */
  @Patch(':orderId/status')
  @ApiOperation({
    summary: 'Update order status',
    description: 'Update order status through kitchen workflow',
  })
  @ApiAuth()
  @ApiUuidParam('orderId', 'Order ID')
  @ApiSuccessResponse(OrderResponseDto, {
    description: 'Order status updated successfully',
  })
  @ApiResourceErrors()
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto
  ): Promise<StandardApiResponse<OrderResponseDto>> {
    const order = await this.orderService.updateStatus(orderId, dto);
    return StandardApiResponse.success(order);
  }

  /**
   * Apply discount to order
   * Implements 3-tier authorization:
   * - Small (<10%): CASHIER, ADMIN, OWNER
   * - Medium (10-50%): ADMIN, OWNER
   * - Large (>50%): OWNER only
   */
  @Post(':orderId/apply-discount')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Apply discount to order',
    description:
      'Apply percentage or fixed amount discount to an order. ' +
      'Implements 3-tier authorization: Small (<10%) = CASHIER, Medium (10-50%) = ADMIN, Large (>50%) = OWNER',
  })
  @ApiAuth()
  @ApiUuidParam('orderId', 'Order ID')
  @ApiQuery({ name: 'storeId', description: 'Store ID', required: true })
  @ApiSuccessResponse(OrderResponseDto, {
    description: 'Discount applied successfully',
  })
  @ApiResourceErrors()
  async applyDiscount(
    @GetUser('sub') userId: string,
    @Query('storeId') storeId: string,
    @Param('orderId') orderId: string,
    @Body() dto: ApplyDiscountDto
  ): Promise<StandardApiResponse<OrderResponseDto>> {
    const order = await this.orderService.applyDiscount(
      userId,
      storeId,
      orderId,
      dto
    );
    return StandardApiResponse.success(order);
  }

  /**
   * Remove discount from order
   * Requires ADMIN or OWNER role
   */
  @Delete(':orderId/discount')
  @ApiOperation({
    summary: 'Remove discount from order',
    description:
      'Remove previously applied discount. Requires ADMIN or OWNER role.',
  })
  @ApiAuth()
  @ApiUuidParam('orderId', 'Order ID')
  @ApiQuery({ name: 'storeId', description: 'Store ID', required: true })
  @ApiSuccessResponse(OrderResponseDto, {
    description: 'Discount removed successfully',
  })
  @ApiResourceErrors()
  async removeDiscount(
    @GetUser('sub') userId: string,
    @Query('storeId') storeId: string,
    @Param('orderId') orderId: string
  ): Promise<StandardApiResponse<OrderResponseDto>> {
    const order = await this.orderService.removeDiscount(
      userId,
      storeId,
      orderId
    );
    return StandardApiResponse.success(order);
  }
}
