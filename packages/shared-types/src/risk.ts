// Risk management types for the onchain-signal workspace

export interface RiskConfig {
  level: 'low' | 'medium' | 'high';
  maxPositionSize: number; // Percentage of portfolio
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxDailyLoss: number; // Percentage of portfolio
  maxDrawdown: number; // Maximum allowed drawdown percentage
  maxOpenPositions: number;
  maxLeverage: number;
  correlationLimit: number; // Maximum correlation between positions
  volatilityThreshold: number; // Maximum allowed volatility
}

export interface PortfolioRisk {
  totalValue: number;
  exposure: number; // Percentage of portfolio at risk
  diversification: number; // 0-100 score
  volatility: number;
  drawdown: number; // Current drawdown percentage
  sharpeRatio: number;
  valueAtRisk: number; // 95% VaR
  stressTestResults: StressTestResult[];
}

export interface StressTestResult {
  scenario: string;
  description: string;
  potentialLoss: number; // Percentage
  impactedAssets: string[];
  probabilityScore: number; // 0-100
  mitigationSuggestions: string[];
}

export interface RiskAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  affectedAssets: string[];
  timestamp: string;
  isAcknowledged: boolean;
  suggestedActions?: string[];
}

export interface RiskMetrics {
  dailyVaR: number;
  expectedShortfall: number;
  betaToMarket: number;
  concentrationRisk: number; // 0-100
  liquidityRisk: number; // 0-100
  counterpartyRisk: number; // 0-100
  leverageRatio: number;
  stressTestScore: number; // 0-100
}
