import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";

const SOCKET_SERVER = "http://localhost:5002";

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_SERVER, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("user-joined", {
        userId: user._id,
        userName: user.name,
      });
    });
    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });
    newSocket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    newSocket.on("chat-history", (history) => {
      setMessages(history);
    });

    newSocket.on("online-users", (users) => {
      setOnlineUsers(users);
    });
    newSocket.on("user-notification", (notification) => {
      setMessages((prev) => [...prev, { ...notification, isNotification: true }]);
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      userId: user._id,
      userName: user.name,
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    socket.emit("send-message", messageData);
    setInputMessage("");
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
            &larr; Back to Dashboard
          </button>
          <h1 style={styles.title}>Chat</h1>
        </div>
        <div style={styles.connectionStatus}>
          <span
            style={{
              ...styles.statusDot,
              background: isConnected ? "#28a745" : "#dc3545",
            }}
          />
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </header>

      <div style={styles.chatContainer}>
        <aside style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Online Users ({onlineUsers.length})</h3>
          <ul style={styles.userList}>
            {onlineUsers.map((u, index) => (
              <li key={index} style={styles.userItem}>
                <span style={styles.onlineDot} />
                {u.userName}
                {u.userId === user?._id && " (You)"}
              </li>
            ))}
          </ul>
        </aside>
        <main style={styles.mainChat}>
          <div style={styles.messagesContainer}>
            {messages.length === 0 ? (
              <p style={styles.noMessages}>
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg, index) => {
                if (msg.isNotification) {
                  return (
                    <div key={index} style={styles.notification}>
                      {msg.message}
                    </div>
                  );
                }

                const isOwn = msg.userId === user?._id;
                return (
                  <div
                    key={index}
                    style={{
                      ...styles.messageWrapper,
                      justifyContent: isOwn ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        ...styles.message,
                        background: isOwn ? "#007bff" : "#e9ecef",
                        color: isOwn ? "#fff" : "#000",
                      }}
                    >
                      {!isOwn && (
                        <span style={styles.senderName}>{msg.userName}</span>
                      )}
                      <p style={styles.messageText}>{msg.message}</p>
                      <span
                        style={{
                          ...styles.timestamp,
                          color: isOwn ? "rgba(255,255,255,0.7)" : "#666",
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} style={styles.inputForm}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              style={styles.input}
              disabled={!isConnected}
            />
            <button
              type="submit"
              style={styles.sendBtn}
              disabled={!isConnected || !inputMessage.trim()}
            >
              Send
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f5f5f5",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    background: "#fff",
    borderBottom: "1px solid #ddd",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  backBtn: {
    padding: "8px 16px",
    cursor: "pointer",
    border: "1px solid #333",
    background: "#fff",
    borderRadius: "4px",
    fontSize: "14px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
  },
  connectionStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#666",
  },
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  chatContainer: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
  sidebar: {
    width: "200px",
    background: "#fff",
    borderRight: "1px solid #ddd",
    padding: "15px",
    overflowY: "auto",
  },
  sidebarTitle: {
    margin: "0 0 15px 0",
    fontSize: "14px",
    color: "#666",
    textTransform: "uppercase",
  },
  userList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  userItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 0",
    fontSize: "14px",
    borderBottom: "1px solid #eee",
  },
  onlineDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#28a745",
  },
  mainChat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  noMessages: {
    textAlign: "center",
    color: "#666",
    marginTop: "50px",
  },
  notification: {
    textAlign: "center",
    color: "#666",
    fontSize: "12px",
    padding: "5px",
    fontStyle: "italic",
  },
  messageWrapper: {
    display: "flex",
    width: "100%",
  },
  message: {
    maxWidth: "60%",
    padding: "10px 15px",
    borderRadius: "12px",
    wordBreak: "break-word",
  },
  senderName: {
    display: "block",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "4px",
    color: "#007bff",
  },
  messageText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.4",
  },
  timestamp: {
    display: "block",
    fontSize: "10px",
    marginTop: "4px",
    textAlign: "right",
  },
  inputForm: {
    display: "flex",
    gap: "10px",
    padding: "15px 20px",
    background: "#fff",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: "12px 15px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "25px",
    outline: "none",
  },
  sendBtn: {
    padding: "12px 25px",
    cursor: "pointer",
    border: "none",
    background: "#007bff",
    color: "#fff",
    borderRadius: "25px",
    fontSize: "14px",
    fontWeight: "bold",
  },
};
