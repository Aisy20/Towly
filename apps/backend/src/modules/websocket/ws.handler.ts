import { WebSocket } from 'ws';
import { WsClientMessage, WsServerMessage } from '@townly/shared';

export interface WsConnection {
  ws: WebSocket;
  userId: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

// In-memory map of all live WebSocket connections
// Key: a unique connection ID (crypto.randomUUID)
export const connections = new Map<string, WsConnection>();

export function registerConnection(
  id: string,
  ws: WebSocket,
  userId: string,
): void {
  connections.set(id, { ws, userId, lat: 0, lng: 0, radiusMeters: 804 });
}

export function removeConnection(id: string): void {
  connections.delete(id);
}

export function handleClientMessage(id: string, raw: string): void {
  const conn = connections.get(id);
  if (!conn) return;

  let msg: WsClientMessage;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }

  if (msg.type === 'SET_BOUNDS') {
    conn.lat = msg.payload.lat;
    conn.lng = msg.payload.lng;
    conn.radiusMeters = msg.payload.radiusMeters;
  }
}

export function send(id: string, msg: WsServerMessage): void {
  const conn = connections.get(id);
  if (!conn || conn.ws.readyState !== WebSocket.OPEN) return;
  conn.ws.send(JSON.stringify(msg));
}
