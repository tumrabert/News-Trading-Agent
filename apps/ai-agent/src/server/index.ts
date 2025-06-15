// API Server for the AI Agent
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/index.js';

// Import routes
import agentRoutes from './routes/agents.js';
import signalRoutes from './routes/signals.js';
import executionRoutes from './routes/executions.js';
import riskRoutes from './routes/risk.js';
import newsRoutes from './routes/news.js';

// Import WebSocket handlers
import { setupWebSocketHandlers } from './websocket/index.js';

// Import types
import type { AgentManager } from './types.js';

const logger = new Logger('APIServer');

/**
 * Create and configure the API server
 * @param agentManager Agent manager instance
 * @param port Port to listen on
 * @returns HTTP server instance
 */
export function createServer(agentManager: AgentManager, port: number = 3001) {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(bodyParser.json());

  // Request logging
  app.use((req, res, next) => {
    const requestId = uuidv4();
    req.headers['x-request-id'] = requestId;
    logger.info(`${req.method} ${req.url} [${requestId}]`);
    next();
  });

  // API routes
  app.use('/api/agents', agentRoutes(agentManager));
  app.use('/api/signals', signalRoutes(agentManager));
  app.use('/api/executions', executionRoutes(agentManager));
  app.use('/api/risk', riskRoutes(agentManager));
  app.use('/api/news', newsRoutes(agentManager));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(`Error processing request: ${err.message}`);
    res.status(err.status || 500).json({
      success: false,
      error: {
        code: err.code || 'internal_server_error',
        message: err.message || 'An unexpected error occurred',
        details: err.details
      }
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'not_found',
        message: `Route ${req.method} ${req.url} not found`
      }
    });
  });

  // Setup WebSocket handlers
  setupWebSocketHandlers(io, agentManager);

  // Start the server
  server.listen(port, () => {
    logger.info(`API Server listening on port ${port}`);
  });

  return server;
}
