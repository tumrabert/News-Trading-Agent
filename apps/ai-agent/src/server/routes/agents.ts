// Agent routes for the AI Agent API
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../utils/index.js';
import { ApiError } from '../types.js';
import type { AgentManager } from '../types.js';

const logger = new Logger('AgentRoutes');

/**
 * Create agent routes
 * @param agentManager Agent manager instance
 * @returns Express router
 */
export default function agentRoutes(agentManager: AgentManager): express.Router {
  const router = express.Router();

  /**
   * GET /api/agents
   * Get all agents
   */
  router.get('/', async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status as 'active' | 'paused' | 'stopped' | undefined,
        search: req.query.search as string | undefined
      };
      
      const agents = await agentManager.getAgents(filters);
      res.json({
        success: true,
        data: agents
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/agents/:id
   * Get agent by ID
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const agent = await agentManager.getAgent(req.params.id);
      
      if (!agent) {
        throw new ApiError(`Agent not found: ${req.params.id}`, 404, 'agent_not_found');
      }
      
      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/agents
   * Create a new agent
   */
  router.post('/', async (req, res, next) => {
    try {
      const { name, config } = req.body;
      
      if (!name) {
        throw new ApiError('Agent name is required', 400, 'invalid_request');
      }
      
      const agent = await agentManager.createAgent({ name, config: config || {} });
      
      res.status(201).json({
        success: true,
        data: agent
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * PUT /api/agents/:id
   * Update an agent
   */
  router.put('/:id', async (req, res, next) => {
    try {
      const { name, config } = req.body;
      
      if (!name && !config) {
        throw new ApiError('Name or config is required', 400, 'invalid_request');
      }
      
      const agent = await agentManager.updateAgent(req.params.id, { name, config });
      
      if (!agent) {
        throw new ApiError(`Agent not found: ${req.params.id}`, 404, 'agent_not_found');
      }
      
      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * DELETE /api/agents/:id
   * Delete an agent
   */
  router.delete('/:id', async (req, res, next) => {
    try {
      const deleted = await agentManager.deleteAgent(req.params.id);
      
      if (!deleted) {
        throw new ApiError(`Agent not found: ${req.params.id}`, 404, 'agent_not_found');
      }
      
      res.json({
        success: true,
        data: { id: req.params.id }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * PUT /api/agents/:id/status
   * Update agent status
   */
  router.put('/:id/status', async (req, res, next) => {
    try {
      const { status } = req.body;
      
      if (!status || !['active', 'paused', 'stopped'].includes(status)) {
        throw new ApiError('Valid status is required (active, paused, stopped)', 400, 'invalid_request');
      }
      
      const agent = await agentManager.updateAgentStatus(
        req.params.id, 
        status as 'active' | 'paused' | 'stopped'
      );
      
      if (!agent) {
        throw new ApiError(`Agent not found: ${req.params.id}`, 404, 'agent_not_found');
      }
      
      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/agents/:id/command
   * Send command to agent
   */
  router.post('/:id/command', async (req, res, next) => {
    try {
      const { command, parameters } = req.body;
      
      if (!command) {
        throw new ApiError('Command is required', 400, 'invalid_request');
      }
      
      const result = await agentManager.sendAgentCommand({
        agentId: req.params.id,
        command,
        parameters
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/agents/:id/signals
   * Get agent signals
   */
  router.get('/:id/signals', async (req, res, next) => {
    try {
      const filters = {
        symbol: req.query.symbol as string | undefined,
        signalType: req.query.signalType as 'buy' | 'sell' | 'hold' | undefined,
        status: req.query.status as 'pending' | 'executed' | 'cancelled' | 'expired' | undefined,
        fromDate: req.query.fromDate as string | undefined,
        toDate: req.query.toDate as string | undefined
      };
      
      const signals = await agentManager.getSignals(req.params.id, filters);
      
      res.json({
        success: true,
        data: signals
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/agents/:id/executions
   * Get agent executions
   */
  router.get('/:id/executions', async (req, res, next) => {
    try {
      const filters = {
        symbol: req.query.symbol as string | undefined,
        side: req.query.side as 'buy' | 'sell' | undefined,
        status: req.query.status as 'pending' | 'filled' | 'cancelled' | 'failed' | undefined,
        fromDate: req.query.fromDate as string | undefined,
        toDate: req.query.toDate as string | undefined
      };
      
      const executions = await agentManager.getExecutions(req.params.id, filters);
      
      res.json({
        success: true,
        data: executions
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
