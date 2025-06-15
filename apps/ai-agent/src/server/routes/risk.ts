// Risk routes for the AI Agent API
import express from 'express';
import { Logger } from '../../utils/index.js';
import { ApiError } from '../types.js';
import type { AgentManager } from '../types.js';

const logger = new Logger('RiskRoutes');

/**
 * Create risk routes
 * @param agentManager Agent manager instance
 * @returns Express router
 */
export default function riskRoutes(agentManager: AgentManager): express.Router {
  const router = express.Router();

  /**
   * GET /api/risk/alerts
   * Get risk alerts
   */
  router.get('/alerts', async (req, res, next) => {
    try {
      const includeAcknowledged = req.query.includeAcknowledged === 'true';
      const alerts = await agentManager.getRiskAlerts(includeAcknowledged);
      
      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * PUT /api/risk/alerts/:id/acknowledge
   * Acknowledge a risk alert
   */
  router.put('/alerts/:id/acknowledge', async (req, res, next) => {
    try {
      const acknowledged = await agentManager.acknowledgeRiskAlert(req.params.id);
      
      if (!acknowledged) {
        throw new ApiError(`Alert not found: ${req.params.id}`, 404, 'alert_not_found');
      }
      
      res.json({
        success: true,
        data: { id: req.params.id, acknowledged: true }
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
