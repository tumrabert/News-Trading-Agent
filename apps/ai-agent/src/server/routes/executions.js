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
exports.default = executionRoutes;
// Execution routes for the AI Agent API
const express_1 = __importDefault(require("express"));
const index_js_1 = require("../../utils/index.js");
const types_js_1 = require("../types.js");
const logger = new index_js_1.Logger('ExecutionRoutes');
/**
 * Create execution routes
 * @param agentManager Agent manager instance
 * @returns Express router
 */
function executionRoutes(agentManager) {
    const router = express_1.default.Router();
    /**
     * GET /api/executions
     * Get all executions
     */
    router.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const filters = {
                symbol: req.query.symbol,
                side: req.query.side,
                status: req.query.status,
                fromDate: req.query.fromDate,
                toDate: req.query.toDate
            };
            const agentId = req.query.agentId;
            const executions = yield agentManager.getExecutions(agentId, filters);
            res.json({
                success: true,
                data: executions
            });
        }
        catch (error) {
            next(error);
        }
    }));
    /**
     * GET /api/executions/:id
     * Get execution by ID
     */
    router.get('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const execution = yield agentManager.getExecution(req.params.id);
            if (!execution) {
                throw new types_js_1.ApiError(`Execution not found: ${req.params.id}`, 404, 'execution_not_found');
            }
            res.json({
                success: true,
                data: execution
            });
        }
        catch (error) {
            next(error);
        }
    }));
    return router;
}
