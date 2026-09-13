import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private readonly socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });
  }

  emit(evento: string, payload: unknown): void {
    this.socket.emit(evento, payload);
  }

  on(evento: string, callback: (payload: any) => void): void {
    this.socket.on(evento, callback);
  }
}
