/**
 * SOS (Self-Ordering System) DTOs.
 *
 * Customer-facing DTOs optimized for the self-ordering experience.
 * These DTOs contain only the fields needed for customers to browse menus,
 * manage their cart, and track orders.
 */

// Cart DTOs
export {
  SosCartResponseDto,
  SosCartItemResponseDto,
  SosCartItemCustomizationDto,
} from './sos-cart-response.dto';

// Category DTOs
export {
  SosCategoryResponseDto,
  SosMenuItemSimpleDto,
} from './sos-category-response.dto';

// Menu Item DTOs
export {
  SosMenuItemResponseDto,
  SosCustomizationGroupDto,
  SosCustomizationOptionDto,
} from './sos-menu-item-response.dto';

// Order DTOs
export {
  SosOrderResponseDto,
  SosOrderItemResponseDto,
} from './sos-order-response.dto';
