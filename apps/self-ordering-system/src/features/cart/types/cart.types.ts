import {
  CustomizationOption,
  MenuItem,
} from '@/features/menu/types/menu.types';

/**
 * Represents an item within the shopping cart.
 * Based on CartItemResponseDto.
 * No changes needed here based on the service function corrections
 */
export interface CartItem {
  id: string;
  cartId: string;
  quantity: number;
  notes?: string | null;
  menuItem: MenuItem;
  selectedOptions: CustomizationOption[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the customer's shopping cart.
 * Based on CartResponseDto.
 * No changes needed here based on the service function corrections
 */
export interface Cart {
  id: string;
  activeTableSessionId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload for adding a new item to the cart.
 * Based on AddItemToCartDto.
 * No changes needed here based on the service function corrections
 */
export interface AddItemPayload {
  menuItemId: string;
  quantity: number;
  selectedOptionIds: string[];
  notes?: string | null;
}

/**
 * Payload for updating an existing cart item (quantity/notes).
 * Based on UpdateCartItemDto.
 * No changes needed here based on the service function corrections
 */
export interface UpdateItemPayload {
  quantity?: number;
  notes?: string | null;
}
