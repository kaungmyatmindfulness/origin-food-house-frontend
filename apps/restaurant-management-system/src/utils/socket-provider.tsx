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

const WS_URL =
  process.env['NEXT_PUBLIC_WS_URL'] ||
  process.env['NEXT_PUBLIC_API_URL'] ||
  'http://localhost:3000';

interface SocketProviderProps {
  children: ReactNode;
  namespace?: string;
}

/**
 * Page-level Socket Provider for RMS
 * Manages WebSocket connection for real-time features (Kitchen, Orders, Tables, Dashboard)
 *
 * @param namespace - Socket.IO namespace (default: '/' for main namespace)
 *
 * @example
 * // Kitchen page - main namespace
 * <SocketProvider>
 *   <KitchenContent />
 * </SocketProvider>
 *
 * @example
 * // Tables page - /table namespace
 * <SocketProvider namespace="/table">
 *   <TablesContent />
 * </SocketProvider>
 */
export const SocketProvider = ({
  children,
  namespace = '/',
}: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectionUrl = namespace === '/' ? WS_URL : `${WS_URL}${namespace}`;

    console.log(
      `[Socket] Connecting to WebSocket (${namespace || 'main'} namespace)...`,
      connectionUrl
    );

    const newSocket = io(connectionUrl, {
      withCredentials: true,
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log(
        `[Socket] Connected to ${namespace || 'main'} namespace:`,
        newSocket.id
      );
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected from ${namespace || 'main'}:`, reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error(
        `[Socket] Connection Error (${namespace || 'main'}):`,
        error.message
      );
      setIsConnected(false);
    });

    newSocket.on('error', (errorData: { message: string }) => {
      console.error(
        `[Socket] Error (${namespace || 'main'}):`,
        errorData.message
      );
    });

    setSocket(newSocket);

    return () => {
      console.log(`[Socket] Disconnecting from ${namespace || 'main'}...`);
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('error');
      newSocket.disconnect();
      setIsConnected(false);
      setSocket(null);
    };
  }, [namespace]);

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
