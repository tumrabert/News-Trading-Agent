// WebSocket client for real-time updates from the AI Agent
import { io, Socket } from 'socket.io-client';
import { getApiConfig } from './config.js';
import { WebSocketEventType, WebSocketMessage } from './types.js';

type EventCallback<T = any> = (data: T) => void;
type ErrorCallback = (error: Error) => void;

/**
 * WebSocket client for real-time updates from the AI Agent
 */
class WebSocketClient {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, EventCallback[]> = new Map();
  private errorHandlers: ErrorCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private isConnecting = false;

  /**
   * Connect to the WebSocket server
   * @returns Promise that resolves when connected
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (this.socket?.connected) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Connection timeout'));
        }, 10000);
      });
    }

    this.isConnecting = true;
    const config = getApiConfig();

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(config.wsUrl, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        });

        this.socket.on('connect', () => {
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          if (config.debug) {
            console.log('WebSocket connected');
          }
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          this.reconnectAttempts++;
          if (config.debug) {
            console.error('WebSocket connection error:', error);
          }
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.isConnecting = false;
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
          }
        });

        this.socket.on('disconnect', (reason) => {
          if (config.debug) {
            console.log('WebSocket disconnected:', reason);
          }
        });

        this.socket.on('error', (error) => {
          if (config.debug) {
            console.error('WebSocket error:', error);
          }
          this.notifyErrorHandlers(new Error(error));
        });

        // Listen for all event types
        Object.values(WebSocketEventType).forEach((eventType) => {
          this.socket!.on(eventType, (data: any) => {
            const message: WebSocketMessage = {
              type: eventType as WebSocketEventType,
              data,
              timestamp: new Date().toISOString(),
            };
            this.notifyEventHandlers(eventType, message);
          });
        });

      } catch (error: any) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to an event
   * @param eventType Event type to subscribe to
   * @param callback Callback function to call when event is received
   */
  subscribe<T = any>(eventType: WebSocketEventType, callback: EventCallback<WebSocketMessage<T>>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(callback as EventCallback);
  }

  /**
   * Unsubscribe from an event
   * @param eventType Event type to unsubscribe from
   * @param callback Callback function to remove
   */
  unsubscribe<T = any>(eventType: WebSocketEventType, callback: EventCallback<WebSocketMessage<T>>): void {
    if (!this.eventHandlers.has(eventType)) {
      return;
    }
    const handlers = this.eventHandlers.get(eventType)!;
    const index = handlers.indexOf(callback as EventCallback);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Subscribe to all events
   * @param callback Callback function to call when any event is received
   */
  subscribeToAll<T = any>(callback: EventCallback<WebSocketMessage<T>>): void {
    Object.values(WebSocketEventType).forEach((eventType) => {
      this.subscribe(eventType as WebSocketEventType, callback);
    });
  }

  /**
   * Subscribe to error events
   * @param callback Callback function to call when an error occurs
   */
  onError(callback: ErrorCallback): void {
    this.errorHandlers.push(callback);
  }

  /**
   * Notify all event handlers for a specific event type
   * @param eventType Event type
   * @param data Event data
   */
  private notifyEventHandlers(eventType: string, data: any): void {
    if (!this.eventHandlers.has(eventType)) {
      return;
    }
    const handlers = this.eventHandlers.get(eventType)!;
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    });
  }

  /**
   * Notify all error handlers
   * @param error Error object
   */
  private notifyErrorHandlers(error: Error): void {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }

  /**
   * Check if the WebSocket is connected
   * @returns True if connected, false otherwise
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const wsClient = new WebSocketClient();

export { wsClient, WebSocketEventType };
