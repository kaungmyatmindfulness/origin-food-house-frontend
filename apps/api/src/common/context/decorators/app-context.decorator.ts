import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import {
  AppContext,
  isValidAppContext,
} from 'src/common/context/types/app-context.types';

/**
 * Extended request interface for context detection
 */
interface ContextRequest extends Request {
  user?: Record<string, unknown>;
  adminUser?: Record<string, unknown>;
}

/**
 * Parameter decorator to extract the app context from the request.
 *
 * This provides a simpler alternative to injecting AppContextService
 * when you only need to read the context value.
 *
 * Detection priority:
 * 1. X-App-Context header (explicit)
 * 2. x-session-token header -> 'sos'
 * 3. adminUser in request -> 'admin'
 * 4. user in request -> 'rms'
 * 5. Default -> 'public'
 *
 * @example
 * ```typescript
 * @Get()
 * async getData(@GetAppContext() context: AppContext) {
 *   if (context === 'sos') {
 *     // Handle SOS-specific logic
 *   }
 * }
 * ```
 */
export const GetAppContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AppContext => {
    const request = ctx.switchToHttp().getRequest<ContextRequest>();

    // Priority 1: Explicit X-App-Context header
    const headerValue = request.headers['x-app-context'];
    if (typeof headerValue === 'string' && isValidAppContext(headerValue)) {
      return headerValue;
    }

    // Priority 2: Detect from authentication type
    // Check for SOS session token
    const sessionToken = request.headers['x-session-token'];
    if (sessionToken) {
      return 'sos';
    }

    // Check for Admin user (set by PlatformAdminGuard)
    if (request.adminUser) {
      return 'admin';
    }

    // Check for regular user (set by JwtAuthGuard)
    if (request.user) {
      return 'rms';
    }

    // No authentication - public request
    return 'public';
  }
);
