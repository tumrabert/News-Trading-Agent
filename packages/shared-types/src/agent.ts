// AI Agent types for the onchain-signal workspace

export interface AIAgent {
  id: string;
  userId: string;
  name: string;
  status: 'active' | 'paused' | 'stopped';
  config: AgentConfig;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfig {
  riskLevel: 'low' | 'medium' | 'high';
  maxPositionSize: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxDailyLoss?: number;
  maxDrawdown?: number;
  maxOpenPositions?: number;
  assets?: string[];
  exchanges?: string[];
  strategies?: string[];
  timeframes?: string[];
  indicators?: string[];
  notificationChannels?: NotificationChannel[];
  customParameters?: Record<string, any>;
}

export interface NotificationChannel {
  type: 'email' | 'telegram' | 'discord' | 'webhook';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AgentPerformance {
  agentId: string;
  period: 'day' | 'week' | 'month' | 'year' | 'all';
  profitLoss: number;
  profitLossPercentage: number;
  winRate: number;
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  averageHoldingTime: number;
  largestGain: number;
  largestLoss: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface AgentActivity {
  id: string;
  agentId: string;
  activityType: 'signal' | 'trade' | 'status_change' | 'error' | 'notification';
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface AgentCommand {
  agentId: string;
  command: 'start' | 'stop' | 'pause' | 'resume' | 'update_config' | 'force_exit_positions';
  parameters?: Record<string, any>;
}

export interface AgentLog {
  agentId: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}
