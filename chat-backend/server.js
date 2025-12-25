import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5002;

// ✅ Allow REST API
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://myblog-website-it3w.onrender.com"
    ],
    credentials: true
  })
);

app.get("/", (req, res) => {
  res.send("🚀 Chat backend is running successfully");
});

const httpServer = createServer(app);

// ✅ Socket.IO with correct CORS
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://myblog-website-it3w.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("user-joined", (userData) => {
    const { userId, userName } = userData;

    onlineUsers.set(socket.id, {
      userId,
      userName,
      socketId: socket.id
    });

    io.emit("online-users", Array.from(onlineUsers.values()));

    socket.broadcast.emit("user-notification", {
      message: `${userName} joined the chat`,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("send-message", (messageData) => {
    const { userId, userName, message, timestamp } = messageData;

    io.emit("receive-message", {
      userId,
      userName,
      message,
      timestamp: timestamp || new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);

    if (user) {
      onlineUsers.delete(socket.id);

      io.emit("online-users", Array.from(onlineUsers.values()));
      io.emit("user-notification", {
        message: `${user.userName} left the chat`,
        timestamp: new Date().toISOString()
      });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Chat server running on port ${PORT}`);
});
