import { WebSocket } from "ws";
import type {
  WebSocketConnection,
  ConnectionsMap,
  WebSocketMessage,
} from "../types/ws.type";
import { messageService } from "../services/chat.service";

export const handleWebSocketMessage = (
  ws: WebSocketConnection,
  data: any,
  connections: ConnectionsMap
) => {
  try {
    const message: WebSocketMessage = JSON.parse(data.toString());
    console.log(`Message from user ${ws.userId}:`, message);

    // Handle different message types
    switch (message.messageType) {
      case "broadcast":
        handleBroadcastMessage(ws, message, connections);
        break;

      case "text":
        handleMessage(ws, message, connections);
        break;

      case "ping":
        handlePing(ws);
        break;

      default:
        handleEchoMessage(ws, message);
    }
  } catch (error) {
    console.error("Error parsing message:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Invalid JSON format",
        timestamp: new Date().toISOString(),
      })
    );
  }
};

const handleBroadcastMessage = (
  ws: WebSocketConnection,
  message: WebSocketMessage,
  connections: ConnectionsMap
) => {
  connections.forEach((connection, connUserId) => {
    if (connUserId !== ws.userId && connection.readyState === WebSocket.OPEN) {
      connection.send(
        JSON.stringify({
          type: "broadcast",
          from: ws.userId,
          message: message.text,
          timestamp: new Date().toISOString(),
        })
      );
    }
  });

  // Send confirmation to sender
  ws.send(
    JSON.stringify({
      type: "broadcast_sent",
      message: "Broadcast message sent",
      timestamp: new Date().toISOString(),
    })
  );
};

const handleMessage = (
  ws: WebSocketConnection,
  message: WebSocketMessage,
  connections: ConnectionsMap
) => {
  console.log("Incoming message recipient: " + message.recipient);

  const senderId = message.sender;

  if (!senderId) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Sender ID is required",
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (!ws.recipients) {
    ws.recipients = new Set();
  }

  ws.recipients.add(senderId);

  // Notify other users in the room
  connections.forEach(async (connection, connUserId) => {
    if (
      message.recipient === connUserId &&
      connection.readyState === WebSocket.OPEN
    ) {
      const res = await messageService(
        message.text,
        message.sender,
        message.recipient,
        message.messageType
      );
      if (!res) {
        console.log("Unable to save the chat");
      }
      connection.send(
        JSON.stringify({
          data: {
            ...message,
            id: res._id,
          },
          timestamp: new Date().toISOString(),
        })
      );
    }
  });

//   ws.send(
//     JSON.stringify({
//       data: message,
//       timestamp: new Date().toISOString(),
//     })
//   );
};

const handlePing = (ws: WebSocketConnection) => {
  ws.send(
    JSON.stringify({
      type: "pong",
      timestamp: new Date().toISOString(),
    })
  );
};

const handleEchoMessage = (
  ws: WebSocketConnection,
  message: WebSocketMessage
) => {
  ws.send(
    JSON.stringify({
      type: "echo",
      originalMessage: message,
      userId: ws.userId,
      timestamp: new Date().toISOString(),
    })
  );
};
