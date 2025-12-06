import { Module } from '@nestjs/common';

import { ActiveTableSessionModule } from 'src/active-table-session/active-table-session.module';
import { CartModule } from 'src/cart/cart.module';
import { CategoryModule } from 'src/category/category.module';
import { MenuModule } from 'src/menu/menu.module';
import { OrderModule } from 'src/order/order.module';

import { SosCartController } from './controllers/sos-cart.controller';
import { SosMenuController } from './controllers/sos-menu.controller';
import { SosOrderController } from './controllers/sos-order.controller';
import { SosSessionController } from './controllers/sos-session.controller';

/**
 * SOS (Self-Ordering System) Module
 *
 * Customer-facing module for self-ordering via QR codes.
 * Uses session token authentication (x-session-token header) instead of JWT.
 *
 * Routes are prefixed with /sos/ under the /api/v1/ namespace.
 */
@Module({
  imports: [
    OrderModule,
    CartModule,
    ActiveTableSessionModule,
    CategoryModule,
    MenuModule,
  ],
  controllers: [
    SosSessionController,
    SosCartController,
    SosMenuController,
    SosOrderController,
  ],
})
export class SosModule {}
