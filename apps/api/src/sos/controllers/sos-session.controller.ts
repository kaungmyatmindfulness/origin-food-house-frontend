import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ActiveTableSessionService } from 'src/active-table-session/active-table-session.service';
import { JoinSessionDto } from 'src/active-table-session/dto/join-session.dto';
import { SessionCreatedResponseDto } from 'src/active-table-session/dto/session-created-response.dto';
import { SessionResponseDto } from 'src/active-table-session/dto/session-response.dto';
import { ApiUuidParam } from 'src/common/decorators/api-crud.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { StandardApiResponse } from 'src/common/dto/standard-api-response.dto';
import { ActiveTableSession } from 'src/generated/prisma/client';
import { OrderResponseDto } from 'src/order/dto/order-response.dto';
import { OrderService } from 'src/order/order.service';

/**
 * SOS Session Controller
 *
 * Handles customer session management for self-ordering.
 * All endpoints are PUBLIC (no authentication required).
 */
@ApiTags('SOS / Sessions')
@Controller('sos/sessions')
export class SosSessionController {
  constructor(
    private readonly sessionService: ActiveTableSessionService,
    private readonly orderService: OrderService
  ) {}

  /**
   * Helper: Maps session to response DTO WITHOUT session token (security)
   * SECURITY FIX: Prevents session token exposure in API responses
   */
  private mapToSessionResponse(
    session: ActiveTableSession
  ): SessionResponseDto {
    const { sessionToken: _sessionToken, ...safeSession } = session;
    return safeSession;
  }

  @Post('join/:tableId')
  @ApiOperation({
    summary: 'Join table via QR code',
    description:
      'Creates or joins an existing session for the table. Returns session token for cart operations.',
  })
  @ApiUuidParam('tableId', 'Table ID from QR code')
  @ApiSuccessResponse(SessionCreatedResponseDto, {
    status: 201,
    description: 'Session joined/created successfully (includes session token)',
  })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async joinByTable(
    @Param('tableId', new ParseUUIDPipe({ version: '7' })) tableId: string,
    @Body() dto: JoinSessionDto
  ): Promise<StandardApiResponse<SessionCreatedResponseDto>> {
    const session = await this.sessionService.joinByTable(tableId, dto);
    return StandardApiResponse.success(session as SessionCreatedResponseDto);
  }

  @Get(':sessionId')
  @ApiOperation({
    summary: 'Get session by ID',
    description: 'Returns session information. Session token is excluded.',
  })
  @ApiUuidParam('sessionId', 'Session ID')
  @ApiSuccessResponse(SessionResponseDto, {
    description: 'Session retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async findOne(
    @Param('sessionId', new ParseUUIDPipe({ version: '7' })) sessionId: string
  ): Promise<StandardApiResponse<SessionResponseDto>> {
    const session = await this.sessionService.findOne(sessionId);
    return StandardApiResponse.success(this.mapToSessionResponse(session));
  }

  @Get('token/:token')
  @ApiOperation({
    summary: 'Get session by token',
    description:
      'Validates session token and returns session info. Token is excluded from response.',
  })
  @ApiUuidParam('token', 'Session token')
  @ApiSuccessResponse(SessionResponseDto, {
    description: 'Session found (session token excluded)',
  })
  @ApiResponse({ status: 404, description: 'Invalid session token' })
  async findByToken(
    @Param('token') token: string
  ): Promise<StandardApiResponse<SessionResponseDto>> {
    const session = await this.sessionService.findByToken(token);
    return StandardApiResponse.success(this.mapToSessionResponse(session));
  }

  @Get(':sessionId/orders')
  @ApiOperation({
    summary: 'Get orders for session',
    description: 'Returns all orders placed during this session.',
  })
  @ApiUuidParam('sessionId', 'Active table session ID')
  @ApiSuccessResponse(OrderResponseDto, {
    isArray: true,
    description: 'Orders retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSessionOrders(
    @Param('sessionId', new ParseUUIDPipe({ version: '7' })) sessionId: string
  ): Promise<StandardApiResponse<OrderResponseDto[]>> {
    const orders = await this.orderService.findBySession(sessionId);
    return StandardApiResponse.success(orders);
  }
}
