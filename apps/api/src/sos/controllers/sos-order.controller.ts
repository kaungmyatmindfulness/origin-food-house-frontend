import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiHeader } from '@nestjs/swagger';

import {
  ApiResourceErrors,
  ApiUuidParam,
} from 'src/common/decorators/api-crud.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { StandardApiResponse } from 'src/common/dto/standard-api-response.dto';
import { CheckoutCartDto } from 'src/order/dto/checkout-cart.dto';
import { OrderResponseDto } from 'src/order/dto/order-response.dto';
import { OrderService } from 'src/order/order.service';

const SESSION_HEADER = {
  name: 'x-session-token',
  description: 'Session token for customer authentication (SOS app)',
  required: false,
};

/**
 * SOS Order Controller
 *
 * Handles order operations for self-ordering customers.
 * Uses session token authentication via x-session-token header.
 * No JWT authentication required.
 */
@ApiTags('SOS / Orders')
@Controller('sos/orders')
export class SosOrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Checkout cart and create order
   */
  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Checkout cart and create order',
    description:
      'Creates an order from the current cart items. ' +
      'Cart must have at least one item.',
  })
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiHeader(SESSION_HEADER)
  @ApiSuccessResponse(OrderResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
  })
  @ApiResourceErrors()
  async checkout(
    @Query('sessionId') sessionId: string,
    @Body() dto: CheckoutCartDto,
    @Headers('x-session-token') sessionToken?: string
  ): Promise<StandardApiResponse<OrderResponseDto>> {
    const order = await this.orderService.checkoutCart(
      sessionId,
      dto,
      sessionToken
    );
    return StandardApiResponse.success(order);
  }

  /**
   * Get orders for current session
   */
  @Get()
  @ApiOperation({
    summary: 'Get orders for current session',
    description: 'Returns all orders for the current table session',
  })
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiHeader(SESSION_HEADER)
  @ApiSuccessResponse(OrderResponseDto, {
    isArray: true,
    description: 'Orders retrieved successfully',
  })
  @ApiResourceErrors()
  async getSessionOrders(
    @Query('sessionId') sessionId: string,
    @Headers('x-session-token') _sessionToken?: string
  ): Promise<StandardApiResponse<OrderResponseDto[]>> {
    const orders = await this.orderService.findBySession(sessionId);
    return StandardApiResponse.success(orders);
  }

  /**
   * Get single order by ID
   */
  @Get(':orderId')
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Returns full order details including items',
  })
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiUuidParam('orderId', 'Order ID')
  @ApiHeader(SESSION_HEADER)
  @ApiSuccessResponse(OrderResponseDto, {
    description: 'Order retrieved successfully',
  })
  @ApiResourceErrors()
  async findOne(
    @Param('orderId') orderId: string,
    @Query('sessionId') _sessionId: string,
    @Headers('x-session-token') _sessionToken?: string
  ): Promise<StandardApiResponse<OrderResponseDto>> {
    const order = await this.orderService.findOne(orderId);
    return StandardApiResponse.success(order);
  }
}
