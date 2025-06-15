// Trading-related types for the onchain-signal workspace

export interface TradingSignal {
  id: string;
  agentId: string;
  symbol: string;
  signalType: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-100
  reason: string;
  targetPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeHorizon: string;
  technicalIndicators: string[];
  fundamentalFactors: string[];
  marketConditions: Record<string, any>;
  status: 'pending' | 'executed' | 'cancelled' | 'expired';
  createdAt: string;
  expiresAt?: string;
}

export interface TradeExecution {
  id: string;
  agentId: string;
  signalId?: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  totalValue: number;
  fees: number;
  status: 'pending' | 'filled' | 'cancelled' | 'failed';
  executionType: 'market' | 'limit' | 'stop';
  metadata: Record<string, any>;
  executedAt: string;
}

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  minOrderSize: number;
  maxOrderSize: number;
  priceDecimals: number;
  quantityDecimals: number;
  isActive: boolean;
}

export interface OrderBook {
  symbol: string;
  timestamp: number;
  bids: [number, number][]; // [price, quantity]
  asks: [number, number][]; // [price, quantity]
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  assets: string[];
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  performance: {
    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}
