import express from "express";
import { createServer } from "http";
import { errorHandler } from "./utils/error-handler.ts";

import { connect } from "./db/db.ts";
import router from "./api/routes/index.ts";
import { initializeWebSocket } from "./ws/index.ts";
import cors from "cors";

const app = express();
const server = createServer(app);

// Environment variables with defaults
const PORT = parseInt(process.env.PORT || "3000", 10);
const WS_PORT = parseInt(process.env.WS_PORT || "8080", 10);

// Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Initialize WebSocket server
const { wss, connections } = initializeWebSocket(WS_PORT);

// Routes
app.use("/api/v1", router);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Shutting down gracefully...");

  wss.close(() => {
    console.log("WebSocket server closed");
  });

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
      console.log(`WebSocket Server is running on port ${WS_PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { app, server, wss, connections };
