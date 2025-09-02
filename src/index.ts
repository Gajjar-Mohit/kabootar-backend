import express from "express";
import { createServer } from "http";
import WebSocket from "ws";
import { errorHandler } from "./utils/error-handler.ts";

import { connect } from "./db/db.ts";
import router from "./api/routes/index.ts";
import cors from "cors";

const app = express();
const server = createServer(app);

// Environment variables with defaults
const PORT = parseInt(process.env.PORT || "3000", 10);
const WS_URL = "wss://kabootar-ws-server.onrender.com/68b6d2e32f1210c31bf3ee12";

let wsClient: WebSocket | null = null;

// WebSocket connection function
const connectToWebSocket = () => {
  try {
    console.log(`Attempting to connect to WebSocket: ${WS_URL}`);
    wsClient = new WebSocket(WS_URL);

    wsClient.on("open", () => {
      console.log("✅ WebSocket connection established successfully");
    });

    wsClient.on("message", (data) => {
      try {
        const message = data.toString();
        console.log("📨 WebSocket message received:", message);

        // Handle incoming messages here
        // You can parse JSON if needed: JSON.parse(message)
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    wsClient.on("error", (error) => {
      console.error("❌ WebSocket error:", error.message);
    });

    wsClient.on("close", (code, reason) => {
      console.log(
        `🔌 WebSocket connection closed. Code: ${code}, Reason: ${reason.toString()}`
      );

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        console.log("🔄 Attempting to reconnect to WebSocket...");
        connectToWebSocket();
      }, 5000);
    });
  } catch (error) {
    console.error("Failed to establish WebSocket connection:", error);

    // Retry connection after 5 seconds
    setTimeout(() => {
      console.log("🔄 Retrying WebSocket connection...");
      connectToWebSocket();
    }, 5000);
  }
};

// Function to send message via WebSocket
export const sendWebSocketMessage = (message: any) => {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    const messageStr =
      typeof message === "string" ? message : JSON.stringify(message);
    wsClient.send(messageStr);
    console.log("📤 WebSocket message sent:", messageStr);
    return true;
  } else {
    console.warn("⚠️ WebSocket is not connected. Message not sent:", message);
    return false;
  }
};

// Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", router);

// Health check endpoint
app.get("/health", (req, res) => {
  const wsStatus = wsClient
    ? wsClient.readyState === WebSocket.OPEN
      ? "connected"
      : "disconnected"
    : "not_initialized";

  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    websocket_status: wsStatus,
  });
});

// WebSocket status endpoint
app.get("/ws-status", (req, res) => {
  const status = wsClient
    ? {
        readyState: wsClient.readyState,
        readyStateText: ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][
          wsClient.readyState
        ],
        url: wsClient.url,
      }
    : { status: "not_initialized" };

  res.json(status);
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Shutting down gracefully...");

  // Close WebSocket connection
  if (wsClient) {
    wsClient.close(1000, "Server shutting down");
  }

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    await connect();
    console.log("Database connected successfully");

    server.listen(PORT, () => {
      console.log(`HTTP Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

      // Connect to WebSocket after HTTP server starts
      connectToWebSocket();
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { app, server };
