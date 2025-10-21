// src/features/cart/config/ws-events.ts

// Events the client listens for
export const CART_UPDATED_EVENT = 'cart:updated'; // Server sends the entire cart state
export const CART_ERROR_EVENT = 'cart:error'; // Server sends specific cart operation errors
// export const ERROR_EVENT = 'error';           // General WS error (can be in shared/config if needed globally)

// Events the client emits
export const ADD_ITEM_EVENT = 'cart:add';
export const UPDATE_ITEM_EVENT = 'cart:update';
export const REMOVE_ITEM_EVENT = 'cart:remove';
export const CLEAR_CART_EVENT = 'cart:clear';
