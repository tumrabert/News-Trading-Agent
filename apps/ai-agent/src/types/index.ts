// Type definitions for CryptoSentinel Trading Agent
// Showcasing Brain Framework's type-safe configuration

export interface RiskConfig {
  level: 'conservative' | 'moderate' | 'aggressive' | 'custom';
  maxPositionSize: number; // Percentage of portfolio (1-15%)
  stopLossPercentage: number; // Stop loss percentage (2-20%)
  maxDailyLoss: number; // Maximum daily loss percentage
  humanApprovalThreshold: number; // Threshold for human approval
  maxConcurrentTrades: number; // Maximum concurrent positions
}

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  minTradeSize: number;
  enabled: boolean;
}

export interface ExchangeConfig {
  name: 'binance' | 'okx' | 'hyperliquid' | 'dex';
  apiKey?: string;
  apiSecret?: string;
  sandbox?: boolean;
  enabled: boolean;
  supportedPairs: string[];
}

export interface NewsSource {
  name: string;
  url: string;
  type: 'rss' | 'api' | 'websocket';
  enabled: boolean;
  priority: number; // 1-10, higher = more important
}

export interface MarketEvent {
  id: string;
  timestamp: Date;
  source: string;
  type: 'news' | 'onchain' | 'social' | 'regulatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedAssets: string[];
  title: string;
  content: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-100
  tradingSignal?: TradingSignal | null;
}

export interface TradingSignal {
  action: 'buy' | 'sell' | 'hold';
  asset: string;
  confidence: number; // 0-100
  reasoning: string;
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  targetPrice?: number;
  stopLoss?: number;
  positionSize?: number;
}

export interface TradeExecution {
  id: string;
  timestamp: Date;
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled' | 'failed';
  reason: string;
  eventId?: string; // Reference to triggering event
}

export interface OnChainEvent {
  id: string;
  timestamp: Date;
  blockchain: string;
  type: 'whale_movement' | 'exchange_flow' | 'defi_activity' | 'token_burn' | 'governance';
  amount: number;
  asset: string;
  fromAddress?: string;
  toAddress?: string;
  txHash: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationConfig {
  telegram?: {
    botToken: string;
    chatId: string;
    enabled: boolean;
  };
  discord?: {
    webhookUrl: string;
    enabled: boolean;
  };
  alertLevels: ('low' | 'medium' | 'high' | 'critical')[];
}

export interface AgentConfig {
  risk: RiskConfig;
  exchanges: ExchangeConfig[];
  tradingPairs: TradingPair[];
  newsSources: NewsSource[];
  notifications: NotificationConfig;
  monitoring: {
    newsCheckInterval: number; // seconds
    onchainCheckInterval: number; // seconds
    socialSentimentInterval: number; // seconds
  };
}

export interface PluginContext {
  config: AgentConfig;
  logger: any;
  database: any;
  runtime: any;
}
