import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

const WS_OPEN = WebSocket.OPEN;

@WebSocketGateway({ path: '/ws', transports: ['websocket'] })
export class RealtimeGateway {
  @WebSocketServer()
  server!: Server;

  private readonly lastSent = new Map<string, number>();
  private readonly minIntervalMs = 50;

  broadcastSensor(deviceId: string, payload: Record<string, unknown>): void {
    const now = Date.now();
    const last = this.lastSent.get(deviceId) ?? 0;
    if (now - last < this.minIntervalMs) return;
    this.lastSent.set(deviceId, now);
    const msg = JSON.stringify({ type: 'sensor', data: payload });
    this.server?.clients.forEach((c) => {
      if (c.readyState === WS_OPEN) c.send(msg);
    });
  }

  broadcastAlert(payload: Record<string, unknown>): void {
    const msg = JSON.stringify({ type: 'alert', data: payload });
    this.server?.clients.forEach((c) => {
      if (c.readyState === WS_OPEN) c.send(msg);
    });
  }
}
