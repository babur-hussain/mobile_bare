import { io, Socket } from 'socket.io-client';
import { Config } from '../constants/config';
import { getAuth } from '@react-native-firebase/auth';

class SocketService {
  private socket: Socket | null = null;
  private connectedAccounts: Set<string> = new Set();
  
  connect() {
    if (this.socket?.connected) return;

    this.socket = io(Config.API_BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      // Re-register any accounts we care about upon reconnect
      this.connectedAccounts.forEach(accountId => {
        this.socket?.emit('registerAccount', accountId);
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectedAccounts.clear();
    }
  }

  registerAccount(accountId: string) {
    if (!accountId) return;
    this.connectedAccounts.add(accountId);
    if (this.socket?.connected) {
      this.socket.emit('registerAccount', accountId);
    }
  }

  unregisterAccount(accountId: string) {
    this.connectedAccounts.delete(accountId);
    // Optional: could tell server to leave room if implemented on backend
  }

  onNewMessage(callback: (message: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('newMessage', callback);
  }

  offNewMessage(callback?: (message: any) => void) {
    if (callback) {
      this.socket?.off('newMessage', callback);
    } else {
      this.socket?.off('newMessage');
    }
  }
}

export const socketService = new SocketService();
