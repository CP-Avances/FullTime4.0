import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { UrlService } from '../url/url.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string | null = null;
  private urlSubscription: Subscription | null = null;
  private socketConnected = false;

  constructor(private urlService: UrlService) {
    this.urlSubscription = this.urlService.getSocketUrl().subscribe(url => {
      console.log('URL del socket disponible.');
      if (url && url !== this.serverUrl) {
        this.serverUrl = url;
        this.initSocket();
      }
    });

    // Cargar desde localStorage si no hay aún URL recibida
    const storedUrl = localStorage.getItem('socketURL');
    if (storedUrl) {
      this.serverUrl = storedUrl;
      this.initSocket();
    }
  }

  private initSocket() {
    if (!this.serverUrl) {
      console.error('URL del socket no disponible.');
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket'], // opcional, fuerza websocket
    });

    this.socket.on('connect', () => {
      console.log('Conectado al servidor socket:', this.serverUrl);
      this.socketConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      this.socketConnected = false;
    });
  }

  getSocket(): Socket | null {
    if (!this.socketConnected && this.serverUrl) {
      this.initSocket();
    }
    return this.socket;
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.socketConnected = false;
      console.log('Socket desconectado manualmente.');
    }
  }
}
