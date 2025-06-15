// Signal routes for the AI Agent API
import express from 'express';
import { Logger } from '../../utils/index.js';
import { ApiError } from '../types.js';
import type { AgentManager } from '../types.js';

const logger = new Logger('SignalRoutes');

/**
 * Create signal routes
 * @param agentManager Agent manager instance
 * @returns Express router
 */
export default function signalRoutes(agentManager: AgentManager): express.Router {
  const router = express.Router();

  /**
   * GET /api/signals
   * Get all signals
   */
  router.get('/', async (req, res, next) => {
    try {
      const filters = {
        symbol: req.query.symbol as string | undefined,
        signalType: req.query.signalType as 'buy' | 'sell' | 'hold' | undefined,
        status: req.query.status as 'pending' | 'executed' | 'cancelled' | 'expired' | undefined,
        fromDate: req.query.fromDate as string | undefined,
        toDate: req.query.toDate as string | undefined
      };
      
      const agentId = req.query.agentId as string | undefined;
      const signals = await agentManager.getSignals(agentId, filters);
      
      res.json({
        success: true,
        data: signals
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/signals/:id
   * Get signal by ID
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const signal = await agentManager.getSignal(req.params.id);
      
      if (!signal) {
        throw new ApiError(`Signal not found: ${req.params.id}`, 404, 'signal_not_found');
      }
      
      res.json({
        success: true,
        data: signal
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
