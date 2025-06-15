// News routes for the AI Agent API
import express from 'express';
import { Logger } from '../../utils/index.js';
import { ApiError } from '../types.js';
import type { AgentManager } from '../types.js';

const logger = new Logger('NewsRoutes');

/**
 * Create news routes
 * @param agentManager Agent manager instance
 * @returns Express router
 */
export default function newsRoutes(agentManager: AgentManager): express.Router {
  const router = express.Router();

  /**
   * GET /api/news
   * Get market news
   */
  router.get('/', async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      
      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new ApiError('Invalid limit parameter (must be between 1 and 100)', 400, 'invalid_request');
      }
      
      const news = await agentManager.getMarketNews(limit);
      
      res.json({
        success: true,
        data: news
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
