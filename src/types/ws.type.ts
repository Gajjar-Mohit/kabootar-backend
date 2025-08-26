import { WebSocket } from "ws";

export interface WebSocketConnection extends WebSocket {
  userId?: string;
  recipients?: Set<string>;
}

export type ConnectionsMap = Map<string, WebSocketConnection>;

export interface WebSocketMessage {
  sender: string;
  text: string;
  recipient: string;
  messageType: string;
  [key: string]: any;
}

export interface BroadcastMessagePayload {
  type: string;
  message: string;
  from: string;
  timestamp: string;
}

export interface PrivateMessagePayload {
  type: string;
  message: string;
  from: string;
  to: string;
  timestamp: string;
}

export interface RoomMessagePayload {
  type: string;
  message: string;
  from: string;
  room: string;
  timestamp: string;
}

export interface ErrorPayload {
  type: "error";
  message: string;
  timestamp: string;
}

export interface WelcomePayload {
  type: "welcome";
  message: string;
  userId: string;
  timestamp: string;
}
