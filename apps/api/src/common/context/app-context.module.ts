import { Global, Module } from '@nestjs/common';

import { AppContextService } from './app-context.service';

/**
 * Global module that provides app context detection throughout the application.
 *
 * This module exports AppContextService which can be used to detect
 * which frontend app (RMS, SOS, Admin) is making the request.
 *
 * Being a global module, AppContextService is available for injection
 * in any module without explicit imports.
 */
@Global()
@Module({
  providers: [AppContextService],
  exports: [AppContextService],
})
export class AppContextModule {}
