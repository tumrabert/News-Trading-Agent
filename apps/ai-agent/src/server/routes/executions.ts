// Execution routes for the AI Agent API
import express from 'express';
import { Logger } from '../../utils/index.js';
import { ApiError } from '../types.js';
import type { AgentManager } from '../types.js';

const logger = new Logger('ExecutionRoutes');

/**
 * Create execution routes
 * @param agentManager Agent manager instance
 * @returns Express router
 */
export default function executionRoutes(agentManager: AgentManager): express.Router {
  const router = express.Router();

  /**
   * GET /api/executions
   * Get all executions
   */
  router.get('/', async (req, res, next) => {
    try {
      const filters = {
        symbol: req.query.symbol as string | undefined,
        side: req.query.side as 'buy' | 'sell' | undefined,
        status: req.query.status as 'pending' | 'filled' | 'cancelled' | 'failed' | undefined,
        fromDate: req.query.fromDate as string | undefined,
        toDate: req.query.toDate as string | undefined
      };
      
      const agentId = req.query.agentId as string | undefined;
      const executions = await agentManager.getExecutions(agentId, filters);
      
      res.json({
        success: true,
        data: executions
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/executions/:id
   * Get execution by ID
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const execution = await agentManager.getExecution(req.params.id);
      
      if (!execution) {
        throw new ApiError(`Execution not found: ${req.params.id}`, 404, 'execution_not_found');
      }
      
      res.json({
        success: true,
        data: execution
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
