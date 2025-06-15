// Server types for the AI Agent API
import type { Server as SocketIOServer } from 'socket.io';
import type {
  AIAgent,
  AgentConfig,
  AgentCommand,
  TradingSignal,
  TradeExecution,
  RiskAlert,
  MarketNews
} from '@workspace/shared-types';

/**
 * Agent manager interface
 * Manages the lifecycle of AI agents
 */
export interface AgentManager {
  /**
   * Get all agents
   * @param filters Optional filters
   * @returns List of agents
   */
  getAgents(filters?: AgentFilters): Promise<AIAgent[]>;

  /**
   * Get agent by ID
   * @param id Agent ID
   * @returns Agent or null if not found
   */
  getAgent(id: string): Promise<AIAgent | null>;

  /**
   * Create a new agent
   * @param data Agent data
   * @returns Created agent
   */
  createAgent(data: CreateAgentData): Promise<AIAgent>;

  /**
   * Update an agent
   * @param id Agent ID
   * @param data Agent data
   * @returns Updated agent or null if not found
   */
  updateAgent(id: string, data: UpdateAgentData): Promise<AIAgent | null>;

  /**
   * Delete an agent
   * @param id Agent ID
   * @returns True if deleted, false if not found
   */
  deleteAgent(id: string): Promise<boolean>;

  /**
   * Update agent status
   * @param id Agent ID
   * @param status New status
   * @returns Updated agent or null if not found
   */
  updateAgentStatus(id: string, status: 'active' | 'paused' | 'stopped'): Promise<AIAgent | null>;

  /**
   * Send command to agent
   * @param command Agent command
   * @returns Command result
   */
  sendAgentCommand(command: AgentCommand): Promise<any>;

  /**
   * Get agent signals
   * @param agentId Agent ID
   * @param filters Optional filters
   * @returns List of signals
   */
  getSignals(agentId?: string, filters?: SignalFilters): Promise<TradingSignal[]>;

  /**
   * Get signal by ID
   * @param id Signal ID
   * @returns Signal or null if not found
   */
  getSignal(id: string): Promise<TradingSignal | null>;

  /**
   * Get agent executions
   * @param agentId Agent ID
   * @param filters Optional filters
   * @returns List of executions
   */
  getExecutions(agentId?: string, filters?: ExecutionFilters): Promise<TradeExecution[]>;

  /**
   * Get execution by ID
   * @param id Execution ID
   * @returns Execution or null if not found
   */
  getExecution(id: string): Promise<TradeExecution | null>;

  /**
   * Get risk alerts
   * @param includeAcknowledged Whether to include acknowledged alerts
   * @returns List of risk alerts
   */
  getRiskAlerts(includeAcknowledged?: boolean): Promise<RiskAlert[]>;

  /**
   * Acknowledge a risk alert
   * @param id Alert ID
   * @returns True if acknowledged, false if not found
   */
  acknowledgeRiskAlert(id: string): Promise<boolean>;

  /**
   * Get market news
   * @param limit Number of news items to return
   * @returns List of news items
   */
  getMarketNews(limit?: number): Promise<MarketNews[]>;

  /**
   * Register WebSocket server
   * @param io Socket.IO server
   */
  registerWebSocketServer(io: SocketIOServer): void;
}

/**
 * Agent filters
 */
export interface AgentFilters {
  status?: 'active' | 'paused' | 'stopped';
  search?: string;
}

/**
 * Signal filters
 */
export interface SignalFilters {
  symbol?: string;
  signalType?: 'buy' | 'sell' | 'hold';
  status?: 'pending' | 'executed' | 'cancelled' | 'expired';
  fromDate?: string;
  toDate?: string;
}

/**
 * Execution filters
 */
export interface ExecutionFilters {
  symbol?: string;
  side?: 'buy' | 'sell';
  status?: 'pending' | 'filled' | 'cancelled' | 'failed';
  fromDate?: string;
  toDate?: string;
}

/**
 * Create agent data
 */
export interface CreateAgentData {
  name: string;
  config: Partial<AgentConfig>;
}

/**
 * Update agent data
 */
export interface UpdateAgentData {
  name?: string;
  config?: Partial<AgentConfig>;
}

/**
 * API error
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: any;

  constructor(message: string, status: number = 500, code: string = 'internal_server_error', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
