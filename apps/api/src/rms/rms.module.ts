import { Module } from '@nestjs/common';

import { ActiveTableSessionModule } from 'src/active-table-session/active-table-session.module';
import { CartModule } from 'src/cart/cart.module';
import { OrderModule } from 'src/order/order.module';

import { RmsCartController } from './controllers/rms-cart.controller';
import { RmsOrderController } from './controllers/rms-order.controller';
import { RmsSessionController } from './controllers/rms-session.controller';

/**
 * RMS Module
 *
 * Restaurant Management System module providing app-namespaced controllers
 * for staff operations. All endpoints are under `/api/v1/rms/` prefix.
 *
 * This module delegates to existing services from:
 * - OrderModule: Order management and quick checkout
 * - CartModule: Cart operations for table sessions
 * - ActiveTableSessionModule: Session management
 *
 * All endpoints require JWT authentication (staff/user authentication).
 */
@Module({
  imports: [OrderModule, CartModule, ActiveTableSessionModule],
  controllers: [RmsOrderController, RmsCartController, RmsSessionController],
})
export class RmsModule {}
