"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { createClient } from '@/lib/supabase/client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, userId }: { children: React.ReactNode, userId: string | null }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) {
            if (socket) {
                console.log("[SOCKET] No user ID, disconnecting...");
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        let socketInstance: Socket | null = null;

        const socketInitializer = async () => {
            try {
                console.log("[SOCKET] Initializing for user:", userId);
                await fetch("/api/socket");

                socketInstance = io({
                    path: "/api/socket",
                    addTrailingSlash: false,
                    reconnection: true,
                    reconnectionAttempts: 10,
                    reconnectionDelay: 1000,
                });

                socketInstance.on("connect", () => {
                    console.log("[SOCKET] Connected! ID:", socketInstance?.id);
                    setIsConnected(true);
                    if (userId) {
                        console.log("[SOCKET] Emitting join room:", userId);
                        socketInstance?.emit("join", userId);
                    }
                });

                socketInstance.on("connect_error", (err) => {
                    console.error("[SOCKET] Connection error:", err.message);
                });

                socketInstance.on("disconnect", (reason) => {
                    console.log("[SOCKET] Disconnected. Reason:", reason);
                    setIsConnected(false);
                });

                setSocket(socketInstance);
            } catch (error) {
                console.error("[SOCKET] Initialization failed:", error);
            }
        };

        socketInitializer();

        return () => {
            if (socketInstance) {
                console.log("[SOCKET] Cleanup: disconnecting...");
                socketInstance.disconnect();
            }
        };
    }, [userId]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
