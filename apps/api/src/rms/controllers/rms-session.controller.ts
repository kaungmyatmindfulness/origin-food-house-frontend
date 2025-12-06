import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { ActiveTableSessionService } from 'src/active-table-session/active-table-session.service';
import { CreateManualSessionDto } from 'src/active-table-session/dto/create-manual-session.dto';
import { SessionCreatedResponseDto } from 'src/active-table-session/dto/session-created-response.dto';
import { SessionResponseDto } from 'src/active-table-session/dto/session-response.dto';
import { UpdateSessionDto } from 'src/active-table-session/dto/update-session.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiAuth,
  ApiResourceErrors,
  ApiUuidParam,
} from 'src/common/decorators/api-crud.decorator';
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { StandardApiResponse } from 'src/common/dto/standard-api-response.dto';
import { ActiveTableSession } from 'src/generated/prisma/client';

/**
 * RMS Session Controller
 *
 * Handles all session-related operations for the Restaurant Management System (POS).
 * All endpoints require JWT authentication.
 */
@ApiTags('RMS / Sessions')
@Controller('rms/sessions')
@UseGuards(JwtAuthGuard)
export class RmsSessionController {
  constructor(private readonly sessionService: ActiveTableSessionService) {}

  /**
   * Helper: Maps session to response DTO WITHOUT session token (security)
   * SECURITY: Prevents session token exposure in API responses
   */
  private mapToSessionResponse(
    session: ActiveTableSession
  ): SessionResponseDto {
    const { sessionToken: _sessionToken, ...safeSession } = session;
    return safeSession;
  }

  /**
   * Create manual session (staff creates for walk-ins)
   * Used for counter, phone, or takeout orders
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create manual session',
    description:
      'Create a manual session for counter, phone, or takeout orders. ' +
      'Used when staff initiates an order without a table.',
  })
  @ApiAuth()
  @ApiQuery({ name: 'storeId', description: 'Store ID', required: true })
  @ApiSuccessResponse(SessionCreatedResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Manual session created successfully',
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createManualSession(
    @GetUser('sub') userId: string,
    @Query('storeId') storeId: string,
    @Body() dto: CreateManualSessionDto
  ): Promise<StandardApiResponse<SessionCreatedResponseDto>> {
    const session = await this.sessionService.createManualSession(
      userId,
      storeId,
      dto
    );
    return StandardApiResponse.success(session as SessionCreatedResponseDto);
  }

  /**
   * List active sessions for a store
   */
  @Get()
  @ApiOperation({
    summary: 'List active sessions',
    description:
      'Returns all active sessions for the specified store. ' +
      'Session tokens are excluded from responses for security.',
  })
  @ApiAuth()
  @ApiQuery({ name: 'storeId', description: 'Store ID', required: true })
  @ApiSuccessResponse(SessionResponseDto, {
    isArray: true,
    description: 'Active sessions retrieved (session tokens excluded)',
  })
  async findActiveByStore(
    @Query('storeId') storeId: string
  ): Promise<StandardApiResponse<SessionResponseDto[]>> {
    const sessions = await this.sessionService.findActiveByStore(storeId);
    return StandardApiResponse.success(
      sessions.map((s) => this.mapToSessionResponse(s))
    );
  }

  /**
   * Get session details by ID
   */
  @Get(':sessionId')
  @ApiOperation({
    summary: 'Get session by ID',
    description:
      'Returns session details including cart information. ' +
      'Session token is excluded from response for security.',
  })
  @ApiAuth()
  @ApiUuidParam('sessionId', 'Session ID')
  @ApiSuccessResponse(SessionResponseDto, {
    description: 'Session retrieved (session token excluded for security)',
  })
  @ApiResourceErrors()
  async findOne(
    @Param('sessionId') sessionId: string
  ): Promise<StandardApiResponse<SessionResponseDto>> {
    const session = await this.sessionService.findOne(sessionId);
    return StandardApiResponse.success(this.mapToSessionResponse(session));
  }

  /**
   * Update session
   */
  @Put(':sessionId')
  @ApiOperation({
    summary: 'Update session',
    description: 'Updates session status or other properties',
  })
  @ApiAuth()
  @ApiUuidParam('sessionId', 'Session ID')
  @ApiSuccessResponse(SessionResponseDto, {
    description: 'Session updated (session token excluded for security)',
  })
  @ApiResourceErrors()
  async update(
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateSessionDto,
    @GetUser('sub') userId: string
  ): Promise<StandardApiResponse<SessionResponseDto>> {
    const session = await this.sessionService.update(sessionId, dto, userId);
    return StandardApiResponse.success(this.mapToSessionResponse(session));
  }

  /**
   * Close session
   */
  @Post(':sessionId/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Close session',
    description:
      'Closes the session. Typically called after payment is completed.',
  })
  @ApiAuth()
  @ApiUuidParam('sessionId', 'Session ID')
  @ApiSuccessResponse(SessionResponseDto, {
    description: 'Session closed (session token excluded for security)',
  })
  @ApiResponse({ status: 400, description: 'Session already closed' })
  @ApiResourceErrors()
  async close(
    @Param('sessionId') sessionId: string,
    @GetUser('sub') userId: string
  ): Promise<StandardApiResponse<SessionResponseDto>> {
    const session = await this.sessionService.close(sessionId, userId);
    return StandardApiResponse.success(this.mapToSessionResponse(session));
  }
}
