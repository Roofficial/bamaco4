import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Track connected users: userId -> socketId
  const connectedUsers = new Map<string, string>();

  // Real-time signaling and chat
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register-user", (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("initiate-call", (data) => {
      // data: { toUserId: string, fromUserName: string, fromUserId: string, roomId: string, callId?: string }
      const targetSocketId = connectedUsers.get(data.toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("incoming-call", {
          fromUserId: data.fromUserId,
          fromUserName: data.fromUserName,
          roomId: data.roomId,
          callId: data.callId
        });
      } else {
        // Patient's socket
        socket.emit("call-failed", { reason: "User is offline" });
      }
    });

    socket.on("respond-call", (data) => {
      // data: { toUserId: string, accepted: boolean, roomId: string, callId?: string }
      const targetSocketId = connectedUsers.get(data.toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-response", {
          accepted: data.accepted,
          roomId: data.roomId,
          callId: data.callId
        });
      }
    });

    socket.on("cancel-call", (data) => {
      // data: { toUserId: string }
      const targetSocketId = connectedUsers.get(data.toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-cancelled");
      }
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
      socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("signal", (data) => {
      io.to(data.to).emit("signal", {
        signal: data.signal,
        from: socket.id
      });
    });

    socket.on("message", (data) => {
      io.to(data.roomId).emit("message", {
        text: data.text,
        sender: data.sender,
        timestamp: new Date().toISOString(),
        encrypted: data.encrypted,
        type: data.type
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Remove user from connection map
      for (const [userId, sockId] of connectedUsers.entries()) {
        if (sockId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`User ${userId} deregistered`);
          break;
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
