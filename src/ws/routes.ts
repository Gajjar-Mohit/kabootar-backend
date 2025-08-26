import type { Express, Request, Response } from "express";
import { WebSocket } from "ws";
import type { ConnectionsMap } from "../types/ws.type";

export const setupWebSocketRoutes = (
  app: Express,
  connections: ConnectionsMap
) => {
  // Get list of connected users
  app.get("/api/v1/websocket/users", (req: Request, res: Response) => {
    const connectedUsers = Array.from(connections.keys());
    const usersWithRooms = Array.from(connections.entries()).map(
      ([userId, connection]) => ({
        userId,
        rooms: connection.recipients ? Array.from(connection.recipients) : [],
        connected: connection.readyState === WebSocket.OPEN,
      })
    );

    res.json({
      users: connectedUsers,
      count: connectedUsers.length,
      details: usersWithRooms,
    });
  });

  // Send message to specific user
  app.post("/api/v1/websocket/send", (req: Request, res: Response) => {
    const { userId, message, type = "notification" } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        error: "userId and message are required",
      });
    }

    const connection = connections.get(userId);
    if (!connection || connection.readyState !== WebSocket.OPEN) {
      return res.status(404).json({
        error: "User not connected",
      });
    }

    connection.send(
      JSON.stringify({
        type,
        message,
        from: "server",
        timestamp: new Date().toISOString(),
      })
    );

    res.json({
      success: true,
      message: "Message sent",
      userId,
      timestamp: new Date().toISOString(),
    });
  });

  // Broadcast message to all connected users
  app.post("/api/v1/websocket/broadcast", (req: Request, res: Response) => {
    const { message, type = "broadcast", excludeUsers = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "message is required",
      });
    }

    let sentCount = 0;
    const failedUsers: string[] = [];

    connections.forEach((connection, userId) => {
      if (
        !excludeUsers.includes(userId) &&
        connection.readyState === WebSocket.OPEN
      ) {
        try {
          connection.send(
            JSON.stringify({
              type,
              message,
              from: "server",
              timestamp: new Date().toISOString(),
            })
          );
          sentCount++;
        } catch (error) {
          failedUsers.push(userId);
          console.error(`Failed to send message to ${userId}:`, error);
        }
      }
    });

    res.json({
      success: true,
      message: "Broadcast sent",
      sentCount,
      totalUsers: connections.size,
      failedUsers,
      timestamp: new Date().toISOString(),
    });
  });

  // Send message to users in a specific room
  app.post("/api/v1/websocket/room/send", (req: Request, res: Response) => {
    const {
      room,
      message,
      type = "room_notification",
      excludeUsers = [],
    } = req.body;

    if (!room || !message) {
      return res.status(400).json({
        error: "room and message are required",
      });
    }

    let sentCount = 0;
    const failedUsers: string[] = [];

    connections.forEach((connection, userId) => {
      if (
        !excludeUsers.includes(userId) &&
        connection.recipients &&
        connection.recipients.has(room) &&
        connection.readyState === WebSocket.OPEN
      ) {
        try {
          connection.send(
            JSON.stringify({
              type,
              room,
              message,
              from: "server",
              timestamp: new Date().toISOString(),
            })
          );
          sentCount++;
        } catch (error) {
          failedUsers.push(userId);
          console.error(`Failed to send room message to ${userId}:`, error);
        }
      }
    });

    res.json({
      success: true,
      message: "Room message sent",
      room,
      sentCount,
      failedUsers,
      timestamp: new Date().toISOString(),
    });
  });

  // Get users in a specific room
  app.get(
    "/api/v1/websocket/room/:roomId/users",
    (req: Request, res: Response) => {
      const { roomId } = req.params;

      const usersInRoom: string[] = [];
      connections.forEach((connection, userId) => {
        if (
          connection.recipients &&
          connection.recipients.has(roomId || "") &&
          connection.readyState === WebSocket.OPEN
        ) {
          usersInRoom.push(userId);
        }
      });

      res.json({
        room: roomId,
        users: usersInRoom,
        count: usersInRoom.length,
      });
    }
  );

  // Disconnect a specific user
  app.post("/api/v1/websocket/disconnect", (req: Request, res: Response) => {
    const { userId, reason = "Disconnected by server" } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required",
      });
    }

    const connection = connections.get(userId);
    if (!connection) {
      return res.status(404).json({
        error: "User not connected",
      });
    }

    connection.close(1000, reason);
    connections.delete(userId);

    res.json({
      success: true,
      message: "User disconnected",
      userId,
      reason,
      timestamp: new Date().toISOString(),
    });
  });

  // Health check for WebSocket server
  app.get("/api/v1/websocket/health", (req: Request, res: Response) => {
    res.json({
      status: "OK",
      connectedUsers: connections.size,
      timestamp: new Date().toISOString(),
    });
  });
};
