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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = agentRoutes;
// Agent routes for the AI Agent API
const express_1 = __importDefault(require("express"));
const index_js_1 = require("../../utils/index.js");
const types_js_1 = require("../types.js");
const logger = new index_js_1.Logger('AgentRoutes');
/**
 * Create agent routes
 * @param agentManager Agent manager instance
 * @returns Express router
 */
function agentRoutes(agentManager) {
    const router = express_1.default.Router();
    /**
     * GET /api/agents
     * Get all agents
     */
    router.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const filters = {
                status: req.query.status,
                search: req.query.search
            };
            const agents = yield agentManager.getAgents(filters);
            res.json({
                success: true,
                data: agents
            });
        }
        catch (error) {
            next(error);
        }
    }));
    /**
     * GET /api/agents/:id
     * Get agent by ID
     */
    router.get('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const agent = yield agentManager.getAgent(req.params.id);
            if (!agent) {
                throw new types_js_1.ApiError(`Agent not found: ${req.params.id}`, 404, 'agent_not_found');
            }
            res.json({
                success: true,
                data: agent
            });
        }
        catch (error) {
            next(error);
        }
    }));
    /**
     * POST /api/agents
     * Create a new agent
     */
    router.post('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, config } = req.body;
            if (!name) {
                throw new types_js_1.ApiError('Agent name is required', 400, 'invalid_request');
            }
            const agent = yield agentManager.createAgent({ name, config: config || {} });
            res.status(201).json({
                success: true,
                data: agent
            });
        }
        catch (error) {
            next(error);
        }
    }));
    /**
     * PUT /api/agents/:id
     * Update an agent
     */
    router.put('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, config } = req.body;
            if (!name && !config) {
                throw new types_js_1.ApiError('Name or config is required', 400, 'invalid_request');
            }
            const agent = yield agentManager.updateAgent(req.params.id, { name, config });
            if (!agent) {
                throw new types_js_1.ApiError(`Agent not found: ${req.params.id}`, 404, 'agent_not_found');
            }
            res.json({
                success: true,
                data: agent
            });
        }
        catch (error) {
            next(error);
        }
    }));
    /**
     * DELETE /api/agents/:id
     * Delete an agent
     */
    router.delete('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const deleted = yield agentManager.deleteAgent(req.params.id);
            if (!deleted) {
                throw new types_js_1.ApiError(`Agent not found: ${req.params.id}`, 404, 'agent_not_found');
            }
            res.json({
                success: true,
                data: { id: req.params.id }
            });
        }
        catch (error) {
            next(error);
        }
    }));
    /**
     * PUT /api/agents/:id/status
     * Update agent status
     */
    router.put('/:id/status', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { status } = req.body;
            if (!status || !['active', 'paused', 'stopped'].includes(status)) {
                throw new types_js_1.ApiError('Valid status is required (active, paused, stopped)', 400, 'invalid_request');
            }
            const agent = yield agentManager.updateAgentStatus(req.params.id, status);
            if (!agent) {
                throw new types_js_1.ApiError(`Agent not found: ${req.params.id}`, 404, 'agent_not_found');
            }
            res.json({
                success: true,
                data: agent
            });
        }
        catch (error) {
            next(error);
        }
    }));
    /**
     * POST /api/agents/:id/command
     * Send command to agent
     */
    router.post('/:id/command', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { command, parameters } = req.body;
            if (!command) {
                throw new types_js_1.ApiError('Command is required', 400, 'invalid_request');
            }
            const result = yield agentManager.sendAgentCommand({
                agentId: req.params.id,
                command,
                parameters
            });
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }));
    /**
     * GET /api/agents/:id/signals
     * Get agent signals
     */
    router.get('/:id/signals', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const filters = {
                symbol: req.query.symbol,
                signalType: req.query.signalType,
                status: req.query.status,
                fromDate: req.query.fromDate,
                toDate: req.query.toDate
            };
            const signals = yield agentManager.getSignals(req.params.id, filters);
            res.json({
                success: true,
                data: signals
            });
        }
        catch (error) {
            next(error);
        }
    }));
    /**
     * GET /api/agents/:id/executions
     * Get agent executions
     */
    router.get('/:id/executions', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const filters = {
                symbol: req.query.symbol,
                side: req.query.side,
                status: req.query.status,
                fromDate: req.query.fromDate,
                toDate: req.query.toDate
            };
            const executions = yield agentManager.getExecutions(req.params.id, filters);
            res.json({
                success: true,
                data: executions
            });
        }
        catch (error) {
            next(error);
        }
    }));
    return router;
}
