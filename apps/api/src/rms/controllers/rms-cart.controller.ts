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
import { CartService } from 'src/cart/cart.service';
import { AddToCartDto } from 'src/cart/dto/add-to-cart.dto';
import { CartResponseDto } from 'src/cart/dto/cart-response.dto';
import { UpdateCartItemDto } from 'src/cart/dto/update-cart-item.dto';
import {
  ApiAuth,
  ApiResourceErrors,
  ApiUuidParam,
} from 'src/common/decorators/api-crud.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { StandardApiResponse } from 'src/common/dto/standard-api-response.dto';

/**
 * RMS Cart Controller
 *
 * Handles all cart-related operations for the Restaurant Management System (POS).
 * All endpoints require JWT authentication. Staff access is validated via user ID.
 */
@ApiTags('RMS / Cart')
@Controller('rms/cart')
@UseGuards(JwtAuthGuard)
export class RmsCartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get cart for a session (staff view)
   */
  @Get()
  @ApiOperation({
    summary: 'Get current cart for session',
    description:
      'Returns the cart for the specified session. Staff access is validated via JWT.',
  })
  @ApiAuth()
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiSuccessResponse(CartResponseDto, 'Cart retrieved successfully')
  @ApiResourceErrors()
  async getCart(
    @Query('sessionId') sessionId: string,
    @GetUser('sub') userId: string
  ): Promise<StandardApiResponse<CartResponseDto>> {
    // Pass userId for staff authentication (no session token needed for RMS)
    const cart = await this.cartService.getCart(sessionId, undefined, userId);
    return StandardApiResponse.success(cart);
  }

  /**
   * Add item to cart
   */
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add item to cart',
    description: 'Adds a menu item with optional customizations to the cart',
  })
  @ApiAuth()
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiSuccessResponse(CartResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Item added to cart successfully',
  })
  @ApiResourceErrors()
  async addItem(
    @Query('sessionId') sessionId: string,
    @Body() dto: AddToCartDto,
    @GetUser('sub') userId: string
  ): Promise<StandardApiResponse<CartResponseDto>> {
    const cart = await this.cartService.addItem(
      sessionId,
      dto,
      undefined,
      userId
    );
    return StandardApiResponse.success(cart);
  }

  /**
   * Update cart item
   */
  @Patch('items/:cartItemId')
  @ApiOperation({
    summary: 'Update cart item',
    description: 'Updates quantity or notes for a cart item',
  })
  @ApiAuth()
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiUuidParam('cartItemId', 'Cart item ID')
  @ApiSuccessResponse(CartResponseDto, 'Cart item updated successfully')
  @ApiResourceErrors()
  async updateItem(
    @Query('sessionId') sessionId: string,
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
    @GetUser('sub') userId: string
  ): Promise<StandardApiResponse<CartResponseDto>> {
    const cart = await this.cartService.updateItem(
      sessionId,
      cartItemId,
      dto,
      undefined,
      userId
    );
    return StandardApiResponse.success(cart);
  }

  /**
   * Remove item from cart
   */
  @Delete('items/:cartItemId')
  @ApiOperation({
    summary: 'Remove item from cart',
    description: 'Removes a single item from the cart',
  })
  @ApiAuth()
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiUuidParam('cartItemId', 'Cart item ID')
  @ApiSuccessResponse(CartResponseDto, 'Item removed from cart successfully')
  @ApiResourceErrors()
  async removeItem(
    @Query('sessionId') sessionId: string,
    @Param('cartItemId') cartItemId: string,
    @GetUser('sub') userId: string
  ): Promise<StandardApiResponse<CartResponseDto>> {
    const cart = await this.cartService.removeItem(
      sessionId,
      cartItemId,
      undefined,
      userId
    );
    return StandardApiResponse.success(cart);
  }

  /**
   * Clear all items from cart
   */
  @Delete()
  @ApiOperation({
    summary: 'Clear all items from cart',
    description: 'Removes all items from the cart and resets the subtotal',
  })
  @ApiAuth()
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiSuccessResponse(CartResponseDto, 'Cart cleared successfully')
  @ApiResourceErrors()
  async clearCart(
    @Query('sessionId') sessionId: string,
    @GetUser('sub') userId: string
  ): Promise<StandardApiResponse<CartResponseDto>> {
    const cart = await this.cartService.clearCart(sessionId, undefined, userId);
    return StandardApiResponse.success(cart);
  }
}
