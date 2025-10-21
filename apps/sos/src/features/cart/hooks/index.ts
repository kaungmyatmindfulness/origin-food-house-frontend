import { useEffect } from 'react';
import { useCartStore } from '@/features/cart/store/cart.store';

import { Cart } from '@/features/cart/types/cart.types';

import { useSocket } from '@/utils/socket-provider';

export const useCartSocketListener = () => {
  const { socket, isConnected } = useSocket();
  const { setCart, setError } = useCartStore((state) => ({
    setCart: state.setCart,
    setError: state.setError,
  }));
  const CART_UPDATED_EVENT = 'cart:updated';
  const CART_ERROR_EVENT = 'cart:error';

  useEffect(() => {
    if (socket && isConnected) {
      console.log('Setting up cart WebSocket listeners...');
      const handleCartUpdate = (updatedCart: Cart | null) => {
        console.log(`Received ${CART_UPDATED_EVENT}:`, updatedCart);
        setCart(updatedCart);
      };
      const handleCartError = (errorData: {
        message: string;
        details?: unknown;
        event?: string;
      }) => {
        console.error(
          `Received ${CART_ERROR_EVENT} (Originating Event: ${errorData.event || 'N/A'}):`,
          errorData.message,
          errorData.details
        );
        setError(`Cart Error: ${errorData.message}`);
      };
      socket.on(CART_UPDATED_EVENT, handleCartUpdate);
      socket.on(CART_ERROR_EVENT, handleCartError);
      return () => {
        console.log('Cleaning up cart WebSocket listeners...');
        socket.off(CART_UPDATED_EVENT, handleCartUpdate);
        socket.off(CART_ERROR_EVENT, handleCartError);
      };
    }
  }, [socket, isConnected, setCart, setError]);
};
