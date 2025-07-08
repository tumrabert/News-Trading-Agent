// Risk Management Plugin for CryptoSentinel
// Showcasing Brain Framework's advanced risk control capabilities

import { createSimplePlugin } from "@iqai/agent";
import { Logger, generateId, calculatePositionSize, shouldExecuteTrade, formatCurrency, formatPercentage } from '../../utils/index.js';
import { RiskConfig, TradingSignal, TradeExecution, MarketEvent } from '../../types/index.js';

const logger = new Logger('RiskManager');

interface RiskManagerConfig {
  defaultRisk: RiskConfig;
  portfolioValue: number;
  maxDrawdown: number; // Maximum portfolio drawdown allowed
  emergencyStopLoss: number; // Emergency stop if losses exceed this
}

class RiskManagerService {
  private config: RiskManagerConfig;
  private currentTrades: Map<string, TradeExecution> = new Map();
  private dailyPnL: number = 0;
  private totalPnL: number = 0;
  private lastResetDate: Date = new Date();

  constructor(config: RiskManagerConfig) {
    this.config = config;
  }

  // Reset daily P&L at midnight
  private checkDailyReset() {
    const now = new Date();
    if (now.getDate() !== this.lastResetDate.getDate()) {
      logger.info(`Daily reset: Previous day P&L: ${formatCurrency(this.dailyPnL)}`);
      this.dailyPnL = 0;
      this.lastResetDate = now;
    }
  }

  // Evaluate if a trading signal should be executed based on risk parameters
  evaluateSignal(signal: TradingSignal, currentRisk: RiskConfig): {
    approved: boolean;
    reason: string;
    adjustedPositionSize?: number;
    requiresHumanApproval?: boolean;
  } {
    this.checkDailyReset();

    // Check if signal meets minimum confidence threshold
    if (!shouldExecuteTrade(signal, 70)) {
      return {
        approved: false,
        reason: `Signal confidence ${signal.confidence}% below minimum threshold (70%)`
      };
    }

    // Check daily loss limits
    const maxDailyLossAmount = (this.config.portfolioValue * currentRisk.maxDailyLoss) / 100;
    if (this.dailyPnL < -maxDailyLossAmount) {
      return {
        approved: false,
        reason: `Daily loss limit exceeded: ${formatCurrency(Math.abs(this.dailyPnL))} / ${formatCurrency(maxDailyLossAmount)}`
      };
    }

    // Check maximum concurrent trades
    const activeTrades = Array.from(this.currentTrades.values())
      .filter(trade => trade.status === 'pending' || trade.status === 'filled');
    
    if (activeTrades.length >= currentRisk.maxConcurrentTrades) {
      return {
        approved: false,
        reason: `Maximum concurrent trades reached: ${activeTrades.length}/${currentRisk.maxConcurrentTrades}`
      };
    }

    // Calculate position size
    const basePositionSize = calculatePositionSize(
      this.config.portfolioValue,
      currentRisk.maxPositionSize,
      signal.confidence
    );

    // Adjust position size based on current drawdown
    const currentDrawdown = Math.abs(this.totalPnL) / this.config.portfolioValue;
    let adjustedPositionSize = basePositionSize;
    
    if (currentDrawdown > 0.1) { // If drawdown > 10%, reduce position sizes
      const reductionFactor = Math.max(0.5, 1 - currentDrawdown);
      adjustedPositionSize = basePositionSize * reductionFactor;
      logger.warn(`Position size reduced due to drawdown: ${formatPercentage(currentDrawdown)}`);
    }

    // Check if human approval is required
    const positionPercentage = (adjustedPositionSize / this.config.portfolioValue) * 100;
    const requiresApproval = positionPercentage > currentRisk.humanApprovalThreshold;

    // Emergency stop check
    if (currentDrawdown > this.config.emergencyStopLoss / 100) {
      return {
        approved: false,
        reason: `EMERGENCY STOP: Portfolio drawdown ${formatPercentage(currentDrawdown)} exceeds limit ${formatPercentage(this.config.emergencyStopLoss / 100)}`
      };
    }

    return {
      approved: true,
      reason: `Signal approved: ${signal.confidence}% confidence, ${formatCurrency(adjustedPositionSize)} position`,
      adjustedPositionSize,
      requiresHumanApproval: requiresApproval
    };
  }

  // Record a trade execution
  recordTrade(trade: TradeExecution) {
    this.currentTrades.set(trade.id, trade);
    logger.info(`Trade recorded: ${trade.side.toUpperCase()} ${trade.amount} ${trade.symbol} at ${formatCurrency(trade.price)}`);
  }

  // Update trade status and P&L
  updateTrade(tradeId: string, status: TradeExecution['status'], exitPrice?: number) {
    const trade = this.currentTrades.get(tradeId);
    if (!trade) {
      logger.error(`Trade not found: ${tradeId}`);
      return;
    }

    trade.status = status;

    if (status === 'filled' && exitPrice) {
      // Calculate P&L
      const pnl = trade.side === 'buy' 
        ? (exitPrice - trade.price) * trade.amount
        : (trade.price - exitPrice) * trade.amount;

      this.dailyPnL += pnl;
      this.totalPnL += pnl;

      logger.info(`Trade completed: ${formatCurrency(pnl)} P&L, Daily: ${formatCurrency(this.dailyPnL)}, Total: ${formatCurrency(this.totalPnL)}`);
    }
  }

  // Get current risk metrics
  getRiskMetrics() {
    this.checkDailyReset();
    
    const activeTrades = Array.from(this.currentTrades.values())
      .filter(trade => trade.status === 'pending' || trade.status === 'filled');

    const currentDrawdown = Math.abs(this.totalPnL) / this.config.portfolioValue;
    const dailyLossPercentage = Math.abs(this.dailyPnL) / this.config.portfolioValue;

    return {
      portfolioValue: this.config.portfolioValue,
      dailyPnL: this.dailyPnL,
      totalPnL: this.totalPnL,
      currentDrawdown: currentDrawdown,
      dailyLossPercentage: dailyLossPercentage,
      activeTrades: activeTrades.length,
      maxConcurrentTrades: this.config.defaultRisk.maxConcurrentTrades,
      emergencyStopTriggered: currentDrawdown > this.config.emergencyStopLoss / 100
    };
  }

  // Apply risk-based position sizing to multiple signals
  optimizePortfolio(signals: TradingSignal[], currentRisk: RiskConfig): TradingSignal[] {
    // Sort signals by confidence and urgency
    const sortedSignals = signals.sort((a, b) => {
      if (a.urgency === 'immediate' && b.urgency !== 'immediate') return -1;
      if (b.urgency === 'immediate' && a.urgency !== 'immediate') return 1;
      return b.confidence - a.confidence;
    });

    const optimizedSignals: TradingSignal[] = [];
    let remainingCapital = this.config.portfolioValue * (currentRisk.maxPositionSize / 100);

    for (const signal of sortedSignals) {
      const evaluation = this.evaluateSignal(signal, currentRisk);
      
      if (evaluation.approved && evaluation.adjustedPositionSize) {
        if (evaluation.adjustedPositionSize <= remainingCapital) {
          const optimizedSignal = {
            ...signal,
            positionSize: evaluation.adjustedPositionSize
          };
          optimizedSignals.push(optimizedSignal);
          remainingCapital -= evaluation.adjustedPositionSize;
        }
      }
    }

    return optimizedSignals;
  }
}

export function createRiskManagementPlugin(config: RiskManagerConfig): ReturnType<typeof createSimplePlugin> {
  const riskManager = new RiskManagerService(config);

  return createSimplePlugin({
    name: "risk-management",
    description: "Advanced risk management system for crypto trading with position sizing, drawdown control, and safety limits",
    actions: [
      {
        name: "EVALUATE_SIGNAL",
        description: "Evaluate a trading signal against current risk parameters",
        handler: async (opts) => {
          try {
            // Get the latest market events to find trading signals
            const events = (opts.runtime as any)?.marketEvents || [];
            const signalsToEvaluate = events
              .filter((e: MarketEvent) => e.tradingSignal && e.tradingSignal.action !== 'hold')
              .map((e: MarketEvent) => e.tradingSignal)
              .slice(0, 5); // Evaluate top 5 signals

            if (signalsToEvaluate.length === 0) {
              opts.callback?.({
                text: "⚖️ No trading signals to evaluate"
              });
              return true;
            }

            let response = `⚖️ **RISK EVALUATION REPORT**\n\n`;
            
            for (const signal of signalsToEvaluate) {
              const evaluation = riskManager.evaluateSignal(signal, config.defaultRisk);
              
              response += `**${signal.asset} - ${signal.action.toUpperCase()}**\n`;
              response += `Confidence: ${signal.confidence}%\n`;
              response += `Status: ${evaluation.approved ? '✅ APPROVED' : '❌ REJECTED'}\n`;
              response += `Reason: ${evaluation.reason}\n`;
              
              if (evaluation.adjustedPositionSize) {
                response += `Position Size: ${formatCurrency(evaluation.adjustedPositionSize)}\n`;
              }
              
              if (evaluation.requiresHumanApproval) {
                response += `⚠️ **REQUIRES HUMAN APPROVAL**\n`;
              }
              
              response += `\n`;
            }

            // Add current risk metrics
            const metrics = riskManager.getRiskMetrics();
            response += `**CURRENT RISK METRICS:**\n`;
            response += `Portfolio Value: ${formatCurrency(metrics.portfolioValue)}\n`;
            response += `Daily P&L: ${formatCurrency(metrics.dailyPnL)}\n`;
            response += `Total P&L: ${formatCurrency(metrics.totalPnL)}\n`;
            response += `Current Drawdown: ${formatPercentage(metrics.currentDrawdown)}\n`;
            response += `Active Trades: ${metrics.activeTrades}/${metrics.maxConcurrentTrades}\n`;

            if (metrics.emergencyStopTriggered) {
              response += `🚨 **EMERGENCY STOP ACTIVATED**\n`;
            }

            opts.callback?.({
              text: response
            });

            return true;
          } catch (error) {
            logger.error('Signal evaluation failed:', error);
            opts.callback?.({
              text: "❌ Risk evaluation failed - check logs for details"
            });
            return false;
          }
        }
      },
      {
        name: "GET_RISK_STATUS",
        description: "Get current risk management status and portfolio metrics",
        handler: async (opts) => {
          try {
            const metrics = riskManager.getRiskMetrics();
            
            let response = `⚖️ **RISK MANAGEMENT STATUS**\n\n`;
            response += `**Portfolio Metrics:**\n`;
            response += `• Portfolio Value: ${formatCurrency(metrics.portfolioValue)}\n`;
            response += `• Daily P&L: ${formatCurrency(metrics.dailyPnL)} (${formatPercentage(metrics.dailyLossPercentage)})\n`;
            response += `• Total P&L: ${formatCurrency(metrics.totalPnL)}\n`;
            response += `• Current Drawdown: ${formatPercentage(metrics.currentDrawdown)}\n\n`;
            
            response += `**Risk Limits:**\n`;
            response += `• Max Position Size: ${config.defaultRisk.maxPositionSize}%\n`;
            response += `• Max Daily Loss: ${config.defaultRisk.maxDailyLoss}%\n`;
            response += `• Stop Loss: ${config.defaultRisk.stopLossPercentage}%\n`;
            response += `• Human Approval Threshold: ${config.defaultRisk.humanApprovalThreshold}%\n\n`;
            
            response += `**Current Status:**\n`;
            response += `• Active Trades: ${metrics.activeTrades}/${metrics.maxConcurrentTrades}\n`;
            response += `• Risk Level: ${config.defaultRisk.level.toUpperCase()}\n`;
            
            if (metrics.emergencyStopTriggered) {
              response += `• 🚨 **EMERGENCY STOP ACTIVE**\n`;
            } else {
              response += `• ✅ Normal Operations\n`;
            }

            opts.callback?.({
              text: response
            });

            return true;
          } catch (error) {
            logger.error('Failed to get risk status:', error);
            opts.callback?.({
              text: "❌ Failed to retrieve risk status"
            });
            return false;
          }
        }
      },
      {
        name: "OPTIMIZE_PORTFOLIO",
        description: "Optimize portfolio allocation based on current signals and risk parameters",
        handler: async (opts) => {
          try {
            const events = (opts.runtime as any)?.marketEvents || [];
            const signals = events
              .filter((e: MarketEvent) => e.tradingSignal && e.tradingSignal.action !== 'hold')
              .map((e: MarketEvent) => e.tradingSignal);

            if (signals.length === 0) {
              opts.callback?.({
                text: "📊 No signals available for portfolio optimization"
              });
              return true;
            }

            const optimizedSignals = riskManager.optimizePortfolio(signals, config.defaultRisk);
            
            let response = `📊 **PORTFOLIO OPTIMIZATION**\n\n`;
            response += `Analyzed ${signals.length} signals, optimized ${optimizedSignals.length} for execution\n\n`;
            
            if (optimizedSignals.length > 0) {
              response += `**RECOMMENDED TRADES:**\n`;
              optimizedSignals.forEach((signal, index) => {
                response += `${index + 1}. ${signal.asset} - ${signal.action.toUpperCase()}\n`;
                response += `   Confidence: ${signal.confidence}%\n`;
                response += `   Position: ${formatCurrency(signal.positionSize || 0)}\n`;
                response += `   Urgency: ${signal.urgency.toUpperCase()}\n\n`;
              });

              const totalAllocation = optimizedSignals.reduce((sum, s) => sum + (s.positionSize || 0), 0);
              response += `**Total Allocation: ${formatCurrency(totalAllocation)}**\n`;
              response += `**Portfolio Utilization: ${formatPercentage(totalAllocation / config.portfolioValue)}**\n`;
            } else {
              response += `**No trades recommended** - All signals rejected by risk management\n`;
            }

            opts.callback?.({
              text: response
            });

            return true;
          } catch (error) {
            logger.error('Portfolio optimization failed:', error);
            opts.callback?.({
              text: "❌ Portfolio optimization failed - check logs for details"
            });
            return false;
          }
        }
      }
    ]
  });
}

// Default risk configuration
export const defaultRiskConfig: RiskConfig = {
  level: 'moderate',
  maxPositionSize: 5, // 5% per trade
  stopLossPercentage: 8, // 8% stop loss
  maxDailyLoss: 10, // 10% max daily loss
  humanApprovalThreshold: 3, // Require approval for trades > 3% of portfolio
  maxConcurrentTrades: 5
};
