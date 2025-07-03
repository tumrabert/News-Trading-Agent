"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManagerImpl = void 0;
const uuid_1 = require("uuid");
const index_js_1 = require("../utils/index.js");
const index_js_2 = require("./websocket/index.js");
const events_js_1 = require("./websocket/events.js");
const types_js_1 = require("./types.js");
const logger = new index_js_1.Logger('AgentManager');
/**
 * Agent manager implementation
 */
class AgentManagerImpl {
    constructor(apiKey) {
        this.agents = new Map();
        this.agentData = new Map();
        this.signals = new Map();
        this.executions = new Map();
        this.riskAlerts = new Map();
        this.news = [];
        this.io = null;
        this.apiKey = apiKey;
        logger.info('Agent Manager initialized');
    }
    /**
     * Register WebSocket server
     * @param io Socket.IO server
     */
    registerWebSocketServer(io) {
        this.io = io;
        logger.info('WebSocket server registered with Agent Manager');
    }
    /**
     * Get all agents
     * @param filters Optional filters
     * @returns List of agents
     */
    getAgents(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            let agents = Array.from(this.agentData.values());
            // Apply filters if provided
            if (filters) {
                if (filters.status) {
                    agents = agents.filter(agent => agent.status === filters.status);
                }
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    agents = agents.filter(agent => agent.name.toLowerCase().includes(searchLower));
                }
            }
            return agents;
        });
    }
    /**
     * Get agent by ID
     * @param id Agent ID
     * @returns Agent or null if not found
     */
    getAgent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.agentData.get(id) || null;
        });
    }
    /**
     * Create a new agent
     * @param data Agent data
     * @returns Created agent
     */
    createAgent(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = (0, uuid_1.v4)();
                const now = new Date().toISOString();
                // Create agent data
                const agentData = {
                    id,
                    userId: 'system', // In a real app, this would be the authenticated user's ID
                    name: data.name,
                    status: 'stopped',
                    config: Object.assign({ riskLevel: data.config.riskLevel || 'medium', maxPositionSize: data.config.maxPositionSize || 1000, stopLossPercentage: data.config.stopLossPercentage || 5, takeProfitPercentage: data.config.takeProfitPercentage || 10, maxDailyLoss: data.config.maxDailyLoss || 20, maxDrawdown: data.config.maxDrawdown || 25, maxOpenPositions: data.config.maxOpenPositions || 5 }, data.config),
                    createdAt: now,
                    updatedAt: now
                };
                // Store agent data
                this.agentData.set(id, agentData);
                // Emit agent created event
                if (this.io) {
                    (0, index_js_2.emitToAll)(this.io, events_js_1.WebSocketEventType.AGENT_STATUS, {
                        action: 'created',
                        agent: agentData
                    });
                }
                logger.info(`Agent created: ${id} (${data.name})`);
                return agentData;
            }
            catch (error) {
                logger.error(`Error creating agent: ${error.message}`);
                throw new types_js_1.ApiError(`Failed to create agent: ${error.message}`, 500);
            }
        });
    }
    /**
     * Update an agent
     * @param id Agent ID
     * @param data Agent data
     * @returns Updated agent or null if not found
     */
    updateAgent(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const agent = this.agentData.get(id);
            if (!agent) {
                return null;
            }
            try {
                // Update agent data
                const updatedAgent = Object.assign(Object.assign({}, agent), { name: data.name || agent.name, config: data.config ? Object.assign(Object.assign({}, agent.config), data.config) : agent.config, updatedAt: new Date().toISOString() });
                // Store updated agent data
                this.agentData.set(id, updatedAgent);
                // Emit agent updated event
                if (this.io) {
                    (0, index_js_2.emitToAgent)(this.io, id, events_js_1.WebSocketEventType.AGENT_STATUS, {
                        action: 'updated',
                        agent: updatedAgent
                    });
                }
                logger.info(`Agent updated: ${id} (${updatedAgent.name})`);
                return updatedAgent;
            }
            catch (error) {
                logger.error(`Error updating agent: ${error.message}`);
                throw new types_js_1.ApiError(`Failed to update agent: ${error.message}`, 500);
            }
        });
    }
    /**
     * Delete an agent
     * @param id Agent ID
     * @returns True if deleted, false if not found
     */
    deleteAgent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const agent = this.agentData.get(id);
            if (!agent) {
                return false;
            }
            try {
                // Stop the agent if it's running
                if (agent.status === 'active') {
                    yield this.stopAgent(id);
                }
                // Delete agent instance
                this.agents.delete(id);
                // Delete agent data
                this.agentData.delete(id);
                // Emit agent deleted event
                if (this.io) {
                    (0, index_js_2.emitToAll)(this.io, events_js_1.WebSocketEventType.AGENT_STATUS, {
                        action: 'deleted',
                        agentId: id
                    });
                }
                logger.info(`Agent deleted: ${id} (${agent.name})`);
                return true;
            }
            catch (error) {
                logger.error(`Error deleting agent: ${error.message}`);
                throw new types_js_1.ApiError(`Failed to delete agent: ${error.message}`, 500);
            }
        });
    }
    /**
     * Update agent status
     * @param id Agent ID
     * @param status New status
     * @returns Updated agent or null if not found
     */
    updateAgentStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const agent = this.agentData.get(id);
            if (!agent) {
                return null;
            }
            try {
                // Handle status change
                if (status === 'active' && agent.status !== 'active') {
                    yield this.startAgent(id);
                }
                else if (status === 'paused' && agent.status === 'active') {
                    yield this.pauseAgent(id);
                }
                else if (status === 'stopped' && agent.status !== 'stopped') {
                    yield this.stopAgent(id);
                }
                // Update agent data
                const updatedAgent = Object.assign(Object.assign({}, agent), { status, updatedAt: new Date().toISOString() });
                // Store updated agent data
                this.agentData.set(id, updatedAgent);
                // Emit agent status changed event
                if (this.io) {
                    (0, index_js_2.emitToAll)(this.io, events_js_1.WebSocketEventType.AGENT_STATUS, {
                        action: 'status_changed',
                        agent: updatedAgent
                    });
                }
                logger.info(`Agent status updated: ${id} (${updatedAgent.name}) -> ${status}`);
                return updatedAgent;
            }
            catch (error) {
                logger.error(`Error updating agent status: ${error.message}`);
                throw new types_js_1.ApiError(`Failed to update agent status: ${error.message}`, 500);
            }
        });
    }
    /**
     * Send command to agent
     * @param command Agent command
     * @returns Command result
     */
    sendAgentCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const agent = this.agentData.get(command.agentId);
            if (!agent) {
                throw new types_js_1.ApiError(`Agent not found: ${command.agentId}`, 404, 'agent_not_found');
            }
            try {
                // Handle command
                switch (command.command) {
                    case 'start':
                        return this.updateAgentStatus(command.agentId, 'active');
                    case 'stop':
                        return this.updateAgentStatus(command.agentId, 'stopped');
                    case 'pause':
                        return this.updateAgentStatus(command.agentId, 'paused');
                    case 'resume':
                        return this.updateAgentStatus(command.agentId, 'active');
                    case 'update_config':
                        return this.updateAgent(command.agentId, { config: command.parameters });
                    case 'force_exit_positions':
                        return this.forceExitPositions(command.agentId);
                    default:
                        throw new types_js_1.ApiError(`Unknown command: ${command.command}`, 400, 'invalid_command');
                }
            }
            catch (error) {
                logger.error(`Error executing command: ${error.message}`);
                throw new types_js_1.ApiError(`Failed to execute command: ${error.message}`, 500);
            }
        });
    }
    /**
     * Get agent signals
     * @param agentId Agent ID
     * @param filters Optional filters
     * @returns List of signals
     */
    getSignals(agentId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            let signals = Array.from(this.signals.values());
            // Filter by agent ID if provided
            if (agentId) {
                signals = signals.filter(signal => signal.agentId === agentId);
            }
            // Apply filters if provided
            if (filters) {
                if (filters.symbol) {
                    signals = signals.filter(signal => signal.symbol === filters.symbol);
                }
                if (filters.signalType) {
                    signals = signals.filter(signal => signal.signalType === filters.signalType);
                }
                if (filters.status) {
                    signals = signals.filter(signal => signal.status === filters.status);
                }
                if (filters.fromDate) {
                    const fromDate = new Date(filters.fromDate).getTime();
                    signals = signals.filter(signal => new Date(signal.createdAt).getTime() >= fromDate);
                }
                if (filters.toDate) {
                    const toDate = new Date(filters.toDate).getTime();
                    signals = signals.filter(signal => new Date(signal.createdAt).getTime() <= toDate);
                }
            }
            // Sort by created date (newest first)
            signals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return signals;
        });
    }
    /**
     * Get signal by ID
     * @param id Signal ID
     * @returns Signal or null if not found
     */
    getSignal(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.signals.get(id) || null;
        });
    }
    /**
     * Get agent executions
     * @param agentId Agent ID
     * @param filters Optional filters
     * @returns List of executions
     */
    getExecutions(agentId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            let executions = Array.from(this.executions.values());
            // Filter by agent ID if provided
            if (agentId) {
                executions = executions.filter(execution => execution.agentId === agentId);
            }
            // Apply filters if provided
            if (filters) {
                if (filters.symbol) {
                    executions = executions.filter(execution => execution.symbol === filters.symbol);
                }
                if (filters.side) {
                    executions = executions.filter(execution => execution.side === filters.side);
                }
                if (filters.status) {
                    executions = executions.filter(execution => execution.status === filters.status);
                }
                if (filters.fromDate) {
                    const fromDate = new Date(filters.fromDate).getTime();
                    executions = executions.filter(execution => new Date(execution.executedAt).getTime() >= fromDate);
                }
                if (filters.toDate) {
                    const toDate = new Date(filters.toDate).getTime();
                    executions = executions.filter(execution => new Date(execution.executedAt).getTime() <= toDate);
                }
            }
            // Sort by executed date (newest first)
            executions.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());
            return executions;
        });
    }
    /**
     * Get execution by ID
     * @param id Execution ID
     * @returns Execution or null if not found
     */
    getExecution(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executions.get(id) || null;
        });
    }
    /**
     * Get risk alerts
     * @param includeAcknowledged Whether to include acknowledged alerts
     * @returns List of risk alerts
     */
    getRiskAlerts() {
        return __awaiter(this, arguments, void 0, function* (includeAcknowledged = false) {
            let alerts = Array.from(this.riskAlerts.values());
            // Filter out acknowledged alerts if not requested
            if (!includeAcknowledged) {
                alerts = alerts.filter(alert => !alert.isAcknowledged);
            }
            // Sort by timestamp (newest first)
            alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            return alerts;
        });
    }
    /**
     * Acknowledge a risk alert
     * @param id Alert ID
     * @returns True if acknowledged, false if not found
     */
    acknowledgeRiskAlert(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const alert = this.riskAlerts.get(id);
            if (!alert) {
                return false;
            }
            // Update alert
            const updatedAlert = Object.assign(Object.assign({}, alert), { isAcknowledged: true });
            // Store updated alert
            this.riskAlerts.set(id, updatedAlert);
            // Emit alert acknowledged event
            if (this.io) {
                (0, index_js_2.emitToAll)(this.io, events_js_1.WebSocketEventType.RISK_ALERT, {
                    action: 'acknowledged',
                    alert: updatedAlert
                });
            }
            logger.info(`Risk alert acknowledged: ${id}`);
            return true;
        });
    }
    /**
     * Get market news
     * @param limit Number of news items to return
     * @returns List of news items
     */
    getMarketNews() {
        return __awaiter(this, arguments, void 0, function* (limit = 20) {
            // Sort by published date (newest first)
            const sortedNews = [...this.news].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            // Limit the number of news items
            return sortedNews.slice(0, limit);
        });
    }
    // Private methods
    /**
     * Start an agent
     * @param id Agent ID
     */
    startAgent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const agentData = this.agentData.get(id);
            if (!agentData) {
                throw new types_js_1.ApiError(`Agent not found: ${id}`, 404, 'agent_not_found');
            }
            // Check if agent is already running
            if (this.agents.has(id)) {
                logger.info(`Agent already running: ${id}`);
                return;
            }
            try {
                // For development purposes, we'll create a mock agent instead of using the real Brain Framework
                // This avoids the need for SQLite and other native dependencies
                const mockAgent = {
                    start: () => __awaiter(this, void 0, void 0, function* () {
                        logger.info(`Mock agent started: ${id}`);
                        // Generate a mock signal every 30 seconds
                        setInterval(() => {
                            this.generateMockSignal(id);
                        }, 30000);
                    }),
                    stop: () => __awaiter(this, void 0, void 0, function* () {
                        logger.info(`Mock agent stopped: ${id}`);
                    })
                };
                // Store the mock agent instance
                this.agents.set(id, mockAgent);
                // Start the mock agent
                yield mockAgent.start();
                logger.info(`Agent started: ${id} (${agentData.name})`);
            }
            catch (error) {
                logger.error(`Error starting agent: ${error.message}`);
                throw new types_js_1.ApiError(`Failed to start agent: ${error.message}`, 500);
            }
        });
    }
    /**
     * Stop an agent
     * @param id Agent ID
     */
    stopAgent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const agent = this.agents.get(id);
            if (!agent) {
                logger.info(`Agent not running: ${id}`);
                return;
            }
            try {
                // Stop the agent
                yield agent.stop();
                // Remove the agent instance
                this.agents.delete(id);
                logger.info(`Agent stopped: ${id}`);
            }
            catch (error) {
                logger.error(`Error stopping agent: ${error.message}`);
                throw new types_js_1.ApiError(`Failed to stop agent: ${error.message}`, 500);
            }
        });
    }
    /**
     * Pause an agent
     * @param id Agent ID
     */
    pauseAgent(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const agent = this.agents.get(id);
            if (!agent) {
                logger.info(`Agent not running: ${id}`);
                return;
            }
            try {
                // Pause the agent (in a real implementation, this would use the Brain Framework's pause functionality)
                // For now, we'll just log it
                logger.info(`Agent paused: ${id}`);
            }
            catch (error) {
                logger.error(`Error pausing agent: ${error.message}`);
                throw new types_js_1.ApiError(`Failed to pause agent: ${error.message}`, 500);
            }
        });
    }
    /**
     * Force exit all positions for an agent
     * @param id Agent ID
     */
    forceExitPositions(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const agent = this.agentData.get(id);
            if (!agent) {
                throw new types_js_1.ApiError(`Agent not found: ${id}`, 404, 'agent_not_found');
            }
            try {
                // In a real implementation, this would close all open positions
                // For now, we'll just generate a mock execution
                const execution = this.generateMockExecution(id, 'sell');
                logger.info(`Forced exit positions for agent: ${id}`);
                return { success: true, execution };
            }
            catch (error) {
                logger.error(`Error forcing exit positions: ${error.message}`);
                throw new types_js_1.ApiError(`Failed to force exit positions: ${error.message}`, 500);
            }
        });
    }
    /**
     * Generate a mock signal for testing
     * @param agentId Agent ID
     * @returns Generated signal
     */
    generateMockSignal(agentId) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        const symbols = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC'];
        const signalTypes = ['buy', 'sell', 'hold'];
        const riskLevels = ['low', 'medium', 'high'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const signalType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
        const confidence = Math.floor(Math.random() * 30) + 70; // 70-100
        const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
        const signal = {
            id,
            agentId,
            symbol,
            signalType,
            confidence,
            reason: `${signalType === 'buy' ? 'Bullish' : signalType === 'sell' ? 'Bearish' : 'Neutral'} pattern detected with strong ${signalType === 'buy' ? 'buying' : 'selling'} pressure`,
            targetPrice: signalType !== 'hold' ? Math.random() * 10000 + 20000 : undefined,
            stopLoss: signalType === 'buy' ? Math.random() * 1000 + 19000 : undefined,
            takeProfit: signalType === 'buy' ? Math.random() * 5000 + 25000 : undefined,
            riskLevel,
            timeHorizon: '1-2 days',
            technicalIndicators: ['RSI', 'MACD', 'Moving Averages'],
            fundamentalFactors: ['Market Sentiment', 'News Analysis'],
            marketConditions: { volatility: 'medium', sentiment: signalType === 'buy' ? 'bullish' : 'bearish' },
            status: 'pending',
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString()
        };
        // Store the signal
        this.signals.set(id, signal);
        // Emit signal event
        if (this.io) {
            (0, index_js_2.emitToAgent)(this.io, agentId, events_js_1.WebSocketEventType.AGENT_SIGNAL, {
                action: 'created',
                signal
            });
        }
        logger.info(`Generated signal: ${id} (${symbol} ${signalType.toUpperCase()})`);
        // Sometimes generate an execution for the signal
        if (signalType !== 'hold' && Math.random() > 0.5) {
            setTimeout(() => {
                this.generateMockExecution(agentId, signalType, id);
            }, 5000 + Math.random() * 10000);
        }
        return signal;
    }
    /**
     * Generate a mock execution for testing
     * @param agentId Agent ID
     * @param side Buy or sell
     * @param signalId Optional signal ID
     * @returns Generated execution
     */
    generateMockExecution(agentId, side, signalId) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const symbols = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const price = Math.random() * 10000 + 20000;
        const amount = Math.random() * 0.5 + 0.1;
        const totalValue = price * amount;
        const fees = totalValue * 0.001;
        const execution = {
            id,
            agentId,
            signalId,
            symbol,
            side,
            amount,
            price,
            totalValue,
            fees,
            status: 'filled',
            executionType: 'market',
            metadata: {
                exchange: 'Binance',
                orderId: `ord-${Math.floor(Math.random() * 1000000)}`,
                fillPrice: price
            },
            executedAt: now.toISOString()
        };
        // Store the execution
        this.executions.set(id, execution);
        // Update signal if provided
        if (signalId) {
            const signal = this.signals.get(signalId);
            if (signal) {
                const updatedSignal = Object.assign(Object.assign({}, signal), { status: 'executed' });
                this.signals.set(signalId, updatedSignal);
            }
        }
        // Emit execution event
        if (this.io) {
            (0, index_js_2.emitToAgent)(this.io, agentId, events_js_1.WebSocketEventType.AGENT_EXECUTION, {
                action: 'created',
                execution
            });
        }
        logger.info(`Generated execution: ${id} (${symbol} ${side.toUpperCase()} ${amount.toFixed(4)} @ $${price.toFixed(2)})`);
        return execution;
    }
}
exports.AgentManagerImpl = AgentManagerImpl;
