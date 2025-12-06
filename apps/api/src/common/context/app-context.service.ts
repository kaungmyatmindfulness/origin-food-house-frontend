import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { AdminUser, User } from 'src/generated/prisma/client';

import { AppContext, isValidAppContext } from './types/app-context.types';

/**
 * Extended request interface that includes optional user data from auth guards
 */
interface AuthenticatedRequest extends Request {
  user?: User & { auth0Payload?: { adminId?: string } };
  adminUser?: AdminUser;
}

/**
 * Request-scoped service for detecting and providing app context.
 *
 * App context is determined by:
 * 1. X-App-Context header (explicit, highest priority)
 * 2. Authentication type (fallback detection):
 *    - x-session-token header present -> 'sos' (Self-Ordering System)
 *    - AdminUser in request -> 'admin' (Admin Platform)
 *    - JWT/User in request -> 'rms' (Restaurant Management System)
 *    - No auth -> 'public'
 */
@Injectable({ scope: Scope.REQUEST })
export class AppContextService {
  private readonly logger = new Logger(AppContextService.name);
  private cachedContext: AppContext | null = null;

  constructor(
    @Inject(REQUEST)
    private readonly request: AuthenticatedRequest
  ) {}

  /**
   * Get the current app context for the request.
   * The context is cached after first detection.
   * @returns The detected AppContext
   */
  getContext(): AppContext {
    if (this.cachedContext) {
      return this.cachedContext;
    }

    this.cachedContext = this.detectContext();
    return this.cachedContext;
  }

  /**
   * Check if the current request is from the RMS app
   */
  isRMS(): boolean {
    return this.getContext() === 'rms';
  }

  /**
   * Check if the current request is from the SOS app
   */
  isSOS(): boolean {
    return this.getContext() === 'sos';
  }

  /**
   * Check if the current request is from the Admin Platform
   */
  isAdmin(): boolean {
    return this.getContext() === 'admin';
  }

  /**
   * Check if the current request is public (unauthenticated)
   */
  isPublic(): boolean {
    return this.getContext() === 'public';
  }

  /**
   * Detect the app context from request headers and auth state
   */
  private detectContext(): AppContext {
    const method = this.detectContext.name;

    // Priority 1: Explicit X-App-Context header
    const headerContext = this.getHeaderContext();
    if (headerContext) {
      this.logger.debug(
        `[${method}] App context from header: ${headerContext}`
      );
      return headerContext;
    }

    // Priority 2: Detect from authentication type
    const authContext = this.detectFromAuth();
    this.logger.debug(`[${method}] App context from auth: ${authContext}`);
    return authContext;
  }

  /**
   * Get app context from X-App-Context header if valid
   */
  private getHeaderContext(): AppContext | null {
    const headerValue = this.request.headers['x-app-context'];

    if (typeof headerValue === 'string' && isValidAppContext(headerValue)) {
      return headerValue;
    }

    return null;
  }

  /**
   * Detect app context from authentication type in the request
   */
  private detectFromAuth(): AppContext {
    // Check for SOS session token
    const sessionToken = this.request.headers['x-session-token'];
    if (sessionToken) {
      return 'sos';
    }

    // Check for Admin user (set by PlatformAdminGuard)
    if (this.request.adminUser) {
      return 'admin';
    }

    // Check for regular user (set by JwtAuthGuard)
    if (this.request.user) {
      // Check if this is an admin user accessing via Auth0
      // Admin users have adminId in their auth0Payload
      if (this.request.user.auth0Payload?.adminId) {
        return 'admin';
      }
      return 'rms';
    }

    // No authentication - public request
    return 'public';
  }
}
