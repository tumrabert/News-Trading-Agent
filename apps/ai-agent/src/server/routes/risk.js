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
exports.default = riskRoutes;
// Risk routes for the AI Agent API
const express_1 = __importDefault(require("express"));
const index_js_1 = require("../../utils/index.js");
const types_js_1 = require("../types.js");
const logger = new index_js_1.Logger('RiskRoutes');
/**
 * Create risk routes
 * @param agentManager Agent manager instance
 * @returns Express router
 */
function riskRoutes(agentManager) {
    const router = express_1.default.Router();
    /**
     * GET /api/risk/alerts
     * Get risk alerts
     */
    router.get('/alerts', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const includeAcknowledged = req.query.includeAcknowledged === 'true';
            const alerts = yield agentManager.getRiskAlerts(includeAcknowledged);
            res.json({
                success: true,
                data: alerts
            });
        }
        catch (error) {
            next(error);
        }
    }));
    /**
     * PUT /api/risk/alerts/:id/acknowledge
     * Acknowledge a risk alert
     */
    router.put('/alerts/:id/acknowledge', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const acknowledged = yield agentManager.acknowledgeRiskAlert(req.params.id);
            if (!acknowledged) {
                throw new types_js_1.ApiError(`Alert not found: ${req.params.id}`, 404, 'alert_not_found');
            }
            res.json({
                success: true,
                data: { id: req.params.id, acknowledged: true }
            });
        }
        catch (error) {
            next(error);
        }
    }));
    return router;
}
