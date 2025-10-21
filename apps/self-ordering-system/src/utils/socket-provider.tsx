// src/shared/lib/providers/SocketProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Ensure WS_URL is defined in your environment variables or a config file
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'; // Default port often 3001 for WS

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('Attempting to connect WebSocket...');
    // Consider adding authentication tokens if required by your backend handshake
    const newSocket = io(WS_URL, {
      withCredentials: true, // Crucial for HttpOnly session cookies
      transports: ['websocket'], // Explicitly use WebSocket transport
    });

    newSocket.on('connect', () => {
      console.log('WebSocket Connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket Disconnected:', reason);
      setIsConnected(false);
      // Optionally notify user or trigger reconnection logic here
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket Connection Error:', error.message, error.cause);
      setIsConnected(false);
      // Maybe use a shared notification system instead of direct state update
    });

    // Generic error listener (can be handled by specific features if needed)
    newSocket.on('error', (errorData: { message: string }) => {
      console.error('General WebSocket Error Event:', errorData.message);
      // Use a shared notification system if applicable
      // alert(`Error: ${errorData.message}`);
    });

    setSocket(newSocket);

    return () => {
      console.log('Disconnecting WebSocket...');
      // Remove only the generic listeners owned by this provider
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('error');
      newSocket.disconnect();
      setIsConnected(false);
      setSocket(null);
    };
  }, []); // Empty dependency array: runs only once on mount/unmount

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
