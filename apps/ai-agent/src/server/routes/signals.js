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
exports.default = signalRoutes;
// Signal routes for the AI Agent API
const express_1 = __importDefault(require("express"));
const index_js_1 = require("../../utils/index.js");
const types_js_1 = require("../types.js");
const logger = new index_js_1.Logger('SignalRoutes');
/**
 * Create signal routes
 * @param agentManager Agent manager instance
 * @returns Express router
 */
function signalRoutes(agentManager) {
    const router = express_1.default.Router();
    /**
     * GET /api/signals
     * Get all signals
     */
    router.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const filters = {
                symbol: req.query.symbol,
                signalType: req.query.signalType,
                status: req.query.status,
                fromDate: req.query.fromDate,
                toDate: req.query.toDate
            };
            const agentId = req.query.agentId;
            const signals = yield agentManager.getSignals(agentId, filters);
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
     * GET /api/signals/:id
     * Get signal by ID
     */
    router.get('/:id', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const signal = yield agentManager.getSignal(req.params.id);
            if (!signal) {
                throw new types_js_1.ApiError(`Signal not found: ${req.params.id}`, 404, 'signal_not_found');
            }
            res.json({
                success: true,
                data: signal
            });
        }
        catch (error) {
            next(error);
        }
    }));
    return router;
}
