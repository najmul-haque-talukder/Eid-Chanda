import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO } from "@/types/socket";

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        console.log("*First use, starting socket.io");

        const httpServer: NetServer = res.socket.server as unknown as NetServer;
        const io = new ServerIO(httpServer, {
            path: "/api/socket",
            addTrailingSlash: false,
        });

        res.socket.server.io = io;

        io.on("connection", (socket) => {
            console.log(`[SOCKET] New connection: ${socket.id}`);

            socket.on("join", (userId: string) => {
                socket.join(userId);
                console.log(`[SOCKET] User ${userId} joined room. Socket: ${socket.id}`);
            });

            socket.on("send_message", (message) => {
                console.log(`[SOCKET] Message from ${message.sender_id} to ${message.receiver_id}. Content: ${message.content.substring(0, 20)}...`);
                // Emit to the receiver's room
                io.to(message.receiver_id).emit("message", message);
                // Also emit back to sender (for confirmation/sync)
                io.to(message.sender_id).emit("message", message);
                console.log(`[SOCKET] Message emitted to rooms: ${message.receiver_id}, ${message.sender_id}`);
            });

            socket.on("typing", ({ sender_id, receiver_id }) => {
                console.log(`[SOCKET] Typing: ${sender_id} -> ${receiver_id}`);
                io.to(receiver_id).emit("user_typing", { sender_id });
            });

            socket.on("stop_typing", ({ sender_id, receiver_id }) => {
                console.log(`[SOCKET] Stop Typing: ${sender_id} -> ${receiver_id}`);
                io.to(receiver_id).emit("user_stop_typing", { sender_id });
            });

            socket.on("disconnect", (reason) => {
                console.log(`[SOCKET] Disconnected: ${socket.id}. Reason: ${reason}`);
            });
        });
    }
    res.end();
};

export default ioHandler;
