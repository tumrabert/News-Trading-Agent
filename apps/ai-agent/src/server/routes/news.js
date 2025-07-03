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
exports.default = newsRoutes;
// News routes for the AI Agent API
const express_1 = __importDefault(require("express"));
const index_js_1 = require("../../utils/index.js");
const types_js_1 = require("../types.js");
const logger = new index_js_1.Logger('NewsRoutes');
/**
 * Create news routes
 * @param agentManager Agent manager instance
 * @returns Express router
 */
function newsRoutes(agentManager) {
    const router = express_1.default.Router();
    /**
     * GET /api/news
     * Get market news
     */
    router.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            if (isNaN(limit) || limit < 1 || limit > 100) {
                throw new types_js_1.ApiError('Invalid limit parameter (must be between 1 and 100)', 400, 'invalid_request');
            }
            const news = yield agentManager.getMarketNews(limit);
            res.json({
                success: true,
                data: news
            });
        }
        catch (error) {
            next(error);
        }
    }));
    return router;
}
