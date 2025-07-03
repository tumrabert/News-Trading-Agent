"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
// API Server for the AI Agent
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const uuid_1 = require("uuid");
const index_js_1 = require("../utils/index.js");
// Import routes
const agents_js_1 = __importDefault(require("./routes/agents.js"));
const signals_js_1 = __importDefault(require("./routes/signals.js"));
const executions_js_1 = __importDefault(require("./routes/executions.js"));
const risk_js_1 = __importDefault(require("./routes/risk.js"));
const news_js_1 = __importDefault(require("./routes/news.js"));
// Import WebSocket handlers
const index_js_2 = require("./websocket/index.js");
const logger = new index_js_1.Logger('APIServer');
/**
 * Create and configure the API server
 * @param agentManager Agent manager instance
 * @param port Port to listen on
 * @returns HTTP server instance
 */
function createServer(agentManager, port = 3001) {
    const app = (0, express_1.default)();
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    // Middleware
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use(body_parser_1.default.json());
    // Request logging
    app.use((req, res, next) => {
        const requestId = (0, uuid_1.v4)();
        req.headers['x-request-id'] = requestId;
        logger.info(`${req.method} ${req.url} [${requestId}]`);
        next();
    });
    // API routes
    app.use('/api/agents', (0, agents_js_1.default)(agentManager));
    app.use('/api/signals', (0, signals_js_1.default)(agentManager));
    app.use('/api/executions', (0, executions_js_1.default)(agentManager));
    app.use('/api/risk', (0, risk_js_1.default)(agentManager));
    app.use('/api/news', (0, news_js_1.default)(agentManager));
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // Error handling
    app.use((err, req, res, next) => {
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
    (0, index_js_2.setupWebSocketHandlers)(io, agentManager);
    // Start the server
    server.listen(port, () => {
        logger.info(`API Server listening on port ${port}`);
    });
    return server;
}
