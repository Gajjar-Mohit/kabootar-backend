import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";

import type { WebSocketConnection, ConnectionsMap } from "../types/ws.type";
import { handleWebSocketMessage } from "./handler";

export const initializeWebSocket = (port: number) => {
  // Store active connections by userId
  const connections: ConnectionsMap = new Map();

  const wss = new WebSocketServer({
    port,
    clientTracking: true,
  });

  wss.on("connection", (ws: WebSocketConnection, req: IncomingMessage) => {
    console.log(`New WebSocket connection from ${req.socket.remoteAddress}`);

    // Extract userId from URL path
    const url = new URL(req.url || "", `ws://localhost:${port}`);
    const userId = url.pathname.substring(1); // Remove leading '/'

    // Validate userId
    if (!userId || userId.trim() === "") {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "userId is required in the URL path",
          timestamp: new Date().toISOString(),
        })
      );
      ws.close(1008, "userId required");
      return;
    }

    // Check if user is already connected
    if (connections.has(userId)) {
      const existingConnection = connections.get(userId);
      if (
        existingConnection &&
        existingConnection.readyState === WebSocket.OPEN
      ) {
        // Close existing connection
        existingConnection.close(1000, "New connection established");
      }
    }

    // Store connection with userId
    ws.userId = userId;
    connections.set(userId, ws);

    console.log(`User ${userId} connected via WebSocket`);

    // Send welcome message with userId
    ws.send(
      JSON.stringify({
        type: "welcome",
        message: `Connected to WebSocket server as user ${userId}`,
        userId: userId,
        timestamp: new Date().toISOString(),
      })
    );

    // Handle incoming messages
    ws.on("message", (data) => {
      handleWebSocketMessage(ws, data, connections);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
    });

    // Handle disconnection
    ws.on("close", (code, reason) => {
      console.log(`User ${userId} disconnected: ${code} - ${reason}`);
      // Remove connection from the map
      if (ws.userId) {
        connections.delete(ws.userId);
      }
    });

    // Send heartbeat ping every 30 seconds
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(heartbeat);
      }
    }, 30000);

    // Handle pong responses
    ws.on("pong", () => {
      console.log(`Heartbeat pong received from user ${userId}`);
    });
  });

  wss.on("error", (error) => {
    console.error("WebSocket Server error:", error);
  });

  console.log(`WebSocket server initialized on port ${port}`);

  return { wss, connections };
};
