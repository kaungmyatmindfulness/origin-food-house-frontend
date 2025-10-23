'use client';

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// WebSocket URL from environment or default to API URL
const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

/**
 * Socket Provider for POS App
 * Manages WebSocket connection for real-time features (KDS, etc.)
 */
export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('[Socket] Attempting to connect WebSocket...', WS_URL);

    const newSocket = io(WS_URL, {
      withCredentials: true, // For httpOnly session cookies
      transports: ['websocket'], // Explicitly use WebSocket transport
    });

    newSocket.on('connect', () => {
      console.log('[Socket] WebSocket Connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] WebSocket Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection Error:', error.message, error.cause);
      setIsConnected(false);
    });

    newSocket.on('error', (errorData: { message: string }) => {
      console.error('[Socket] General Error Event:', errorData.message);
    });

    setSocket(newSocket);

    return () => {
      console.log('[Socket] Disconnecting WebSocket...');
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('error');
      newSocket.disconnect();
      setIsConnected(false);
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Custom hook to access the socket context
 * @throws {Error} If used outside SocketProvider
 */
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
