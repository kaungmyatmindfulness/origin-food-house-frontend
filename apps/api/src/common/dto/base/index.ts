/**
 * Base DTOs for app-namespaced API responses.
 *
 * These base DTOs contain common fields shared across all apps (SOS, RMS, Admin).
 * App-specific DTOs should extend these bases to add app-specific fields.
 */

export { CartItemBaseResponseDto } from './cart-base.dto';
export { CategoryBaseResponseDto } from './category-base.dto';
export { MenuItemBaseResponseDto } from './menu-item-base.dto';
export { OrderBaseResponseDto } from './order-base.dto';
