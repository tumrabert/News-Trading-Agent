// API Client types
import type {
  AIAgent,
  AgentConfig,
  AgentCommand,
  AgentActivity,
  AgentPerformance,
  TradingSignal,
  TradeExecution,
  RiskAlert,
  MarketNews
} from '@workspace/shared-types';

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Filter parameters for agents
 */
export interface AgentFilterParams extends PaginationParams {
  status?: 'active' | 'paused' | 'stopped';
  search?: string;
}

/**
 * Filter parameters for signals
 */
export interface SignalFilterParams extends PaginationParams {
  agentId?: string;
  symbol?: string;
  signalType?: 'buy' | 'sell' | 'hold';
  status?: 'pending' | 'executed' | 'cancelled' | 'expired';
  fromDate?: string;
  toDate?: string;
}

/**
 * Filter parameters for executions
 */
export interface ExecutionFilterParams extends PaginationParams {
  agentId?: string;
  symbol?: string;
  side?: 'buy' | 'sell';
  status?: 'pending' | 'filled' | 'cancelled' | 'failed';
  fromDate?: string;
  toDate?: string;
}

/**
 * Create agent request
 */
export interface CreateAgentRequest {
  name: string;
  config: Partial<AgentConfig>;
}

/**
 * Update agent request
 */
export interface UpdateAgentRequest {
  name?: string;
  config?: Partial<AgentConfig>;
}

/**
 * WebSocket event types
 */
export enum WebSocketEventType {
  AGENT_STATUS = 'agent:status',
  AGENT_SIGNAL = 'agent:signal',
  AGENT_EXECUTION = 'agent:execution',
  AGENT_ERROR = 'agent:error',
  MARKET_UPDATE = 'market:update',
  RISK_ALERT = 'risk:alert',
  NEWS_UPDATE = 'news:update',
}

/**
 * WebSocket message
 */
export interface WebSocketMessage<T = any> {
  type: WebSocketEventType;
  data: T;
  timestamp: string;
}

// Re-export types from shared-types for convenience
export type {
  AIAgent,
  AgentConfig,
  AgentCommand,
  AgentActivity,
  AgentPerformance,
  TradingSignal,
  TradeExecution,
  RiskAlert,
  MarketNews
};
