import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiHeader } from '@nestjs/swagger';

import { CartService } from 'src/cart/cart.service';
import { AddToCartDto } from 'src/cart/dto/add-to-cart.dto';
import { CartResponseDto } from 'src/cart/dto/cart-response.dto';
import { UpdateCartItemDto } from 'src/cart/dto/update-cart-item.dto';
import {
  ApiResourceErrors,
  ApiUuidParam,
} from 'src/common/decorators/api-crud.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { StandardApiResponse } from 'src/common/dto/standard-api-response.dto';

const SESSION_HEADER = {
  name: 'x-session-token',
  description: 'Session token for customer authentication (SOS app)',
  required: false,
};

/**
 * SOS Cart Controller
 *
 * Handles cart operations for self-ordering customers.
 * Uses session token authentication via x-session-token header.
 * No JWT authentication required.
 */
@ApiTags('SOS / Cart')
@Controller('sos/cart')
export class SosCartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart for session' })
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiHeader(SESSION_HEADER)
  @ApiSuccessResponse(CartResponseDto, 'Cart retrieved successfully')
  @ApiResourceErrors()
  async getCart(
    @Query('sessionId') sessionId: string,
    @Headers('x-session-token') sessionToken?: string
  ): Promise<StandardApiResponse<CartResponseDto>> {
    const cart = await this.cartService.getCart(sessionId, sessionToken);
    return StandardApiResponse.success(cart);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiHeader(SESSION_HEADER)
  @ApiSuccessResponse(CartResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Item added to cart successfully',
  })
  @ApiResourceErrors()
  async addItem(
    @Query('sessionId') sessionId: string,
    @Body() dto: AddToCartDto,
    @Headers('x-session-token') sessionToken?: string
  ): Promise<StandardApiResponse<CartResponseDto>> {
    const cart = await this.cartService.addItem(sessionId, dto, sessionToken);
    return StandardApiResponse.success(cart);
  }

  @Patch('items/:cartItemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiUuidParam('cartItemId', 'Cart item ID')
  @ApiHeader(SESSION_HEADER)
  @ApiSuccessResponse(CartResponseDto, 'Cart item updated successfully')
  @ApiResourceErrors()
  async updateItem(
    @Query('sessionId') sessionId: string,
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
    @Headers('x-session-token') sessionToken?: string
  ): Promise<StandardApiResponse<CartResponseDto>> {
    const cart = await this.cartService.updateItem(
      sessionId,
      cartItemId,
      dto,
      sessionToken
    );
    return StandardApiResponse.success(cart);
  }

  @Delete('items/:cartItemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiUuidParam('cartItemId', 'Cart item ID')
  @ApiHeader(SESSION_HEADER)
  @ApiSuccessResponse(CartResponseDto, 'Item removed from cart successfully')
  @ApiResourceErrors()
  async removeItem(
    @Query('sessionId') sessionId: string,
    @Param('cartItemId') cartItemId: string,
    @Headers('x-session-token') sessionToken?: string
  ): Promise<StandardApiResponse<CartResponseDto>> {
    const cart = await this.cartService.removeItem(
      sessionId,
      cartItemId,
      sessionToken
    );
    return StandardApiResponse.success(cart);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiQuery({
    name: 'sessionId',
    description: 'Active table session ID',
    required: true,
  })
  @ApiHeader(SESSION_HEADER)
  @ApiSuccessResponse(CartResponseDto, 'Cart cleared successfully')
  @ApiResourceErrors()
  async clearCart(
    @Query('sessionId') sessionId: string,
    @Headers('x-session-token') sessionToken?: string
  ): Promise<StandardApiResponse<CartResponseDto>> {
    const cart = await this.cartService.clearCart(sessionId, sessionToken);
    return StandardApiResponse.success(cart);
  }
}
