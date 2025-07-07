import React, { createContext, useContext, useEffect, useState } from 'react';
import { signalRService } from '../services/signalr';

interface SignalRContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

interface SignalRProviderProps {
  children: React.ReactNode;
}

export function SignalRProvider({ children }: SignalRProviderProps) {
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      await signalRService.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to SignalR:', error);
      setIsConnected(false);
    }
  };

  const disconnect = async () => {
    try {
      await signalRService.disconnect();
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to disconnect from SignalR:', error);
    }
  };

  useEffect(() => {
    // Auto-connect on mount
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  const value: SignalRContextType = {
    isConnected,
    connect,
    disconnect,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR() {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
}
