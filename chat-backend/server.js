import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 5002;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on("user-joined", (userData) => {
    const { userId, userName } = userData;
    onlineUsers.set(socket.id, {
      userId,
      userName,
      socketId: socket.id,
    });

    console.log(`${userName} joined the chat`);
    io.emit("online-users", Array.from(onlineUsers.values()));
    socket.broadcast.emit("user-notification", {
      message: `${userName} joined the chat`,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("send-message", (messageData) => {
    const { userId, userName, message, timestamp } = messageData;
    const fullMessage = {
      userId,
      userName,
      message,
      timestamp: timestamp || new Date().toISOString(),
    };

    io.emit("receive-message", fullMessage);

    console.log(`Message from ${userName}: ${message}`);
  });

  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      console.log(`${user.userName} disconnected`);

      onlineUsers.delete(socket.id);

      io.emit("online-users", Array.from(onlineUsers.values()));
      io.emit("user-notification", {
        message: `${user.userName} left the chat`,
        timestamp: new Date().toISOString(),
      });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
});
