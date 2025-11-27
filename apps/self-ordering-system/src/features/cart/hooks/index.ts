import { useEffect } from 'react';
import { useCartStore } from '@/features/cart/store/cart.store';
import type { CartResponseDto } from '@repo/api/generated/types';
import { useSocket } from '@/utils/socket-provider';
import { debug } from '@/utils/debug';

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
      debug.log('Setting up cart WebSocket listeners...');
      const handleCartUpdate = (updatedCart: CartResponseDto | null) => {
        debug.log(`Received ${CART_UPDATED_EVENT}:`, updatedCart);
        setCart(updatedCart);
      };
      const handleCartError = (errorData: {
        message: string;
        details?: unknown;
        event?: string;
      }) => {
        debug.error(
          `Received ${CART_ERROR_EVENT} (Originating Event: ${errorData.event || 'N/A'}):`,
          errorData.message,
          errorData.details
        );
        setError(`Cart Error: ${errorData.message}`);
      };
      socket.on(CART_UPDATED_EVENT, handleCartUpdate);
      socket.on(CART_ERROR_EVENT, handleCartError);
      return () => {
        debug.log('Cleaning up cart WebSocket listeners...');
        socket.off(CART_UPDATED_EVENT, handleCartUpdate);
        socket.off(CART_ERROR_EVENT, handleCartError);
      };
    }
  }, [socket, isConnected, setCart, setError]);
};
