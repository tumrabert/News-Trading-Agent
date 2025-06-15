// WebSocket handlers for the AI Agent
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Logger } from '../../utils/index.js';
import type { AgentManager } from '../types.js';
import { WebSocketEventType } from './events.js';

const logger = new Logger('WebSocket');

/**
 * Setup WebSocket handlers
 * @param io Socket.IO server
 * @param agentManager Agent manager instance
 */
export function setupWebSocketHandlers(io: SocketIOServer, agentManager: AgentManager): void {
  // Register the WebSocket server with the agent manager
  agentManager.registerWebSocketServer(io);

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const clientId = socket.id;
    logger.info(`Client connected: ${clientId}`);

    // Subscribe to agent events
    socket.on('subscribe:agent', (agentId: string) => {
      logger.info(`Client ${clientId} subscribed to agent ${agentId}`);
      socket.join(`agent:${agentId}`);
    });

    // Unsubscribe from agent events
    socket.on('unsubscribe:agent', (agentId: string) => {
      logger.info(`Client ${clientId} unsubscribed from agent ${agentId}`);
      socket.leave(`agent:${agentId}`);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${clientId}`);
    });

    // Error handler
    socket.on('error', (error) => {
      logger.error(`WebSocket error for client ${clientId}: ${error}`);
    });

    // Send initial connection acknowledgement
    socket.emit('connected', {
      clientId,
      timestamp: new Date().toISOString(),
      message: 'Connected to CryptoSentinel AI Agent'
    });
  });

  // Log when the WebSocket server is ready
  logger.info('WebSocket server initialized');
}

/**
 * Emit an event to all connected clients
 * @param io Socket.IO server
 * @param eventType Event type
 * @param data Event data
 */
export function emitToAll(io: SocketIOServer, eventType: WebSocketEventType, data: any): void {
  io.emit(eventType, {
    type: eventType,
    data,
    timestamp: new Date().toISOString()
  });
  logger.debug(`Emitted ${eventType} to all clients`);
}

/**
 * Emit an event to clients subscribed to a specific agent
 * @param io Socket.IO server
 * @param agentId Agent ID
 * @param eventType Event type
 * @param data Event data
 */
export function emitToAgent(io: SocketIOServer, agentId: string, eventType: WebSocketEventType, data: any): void {
  io.to(`agent:${agentId}`).emit(eventType, {
    type: eventType,
    data,
    timestamp: new Date().toISOString()
  });
  logger.debug(`Emitted ${eventType} to agent ${agentId} subscribers`);
}
