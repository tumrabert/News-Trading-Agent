// Utility functions for CryptoSentinel Trading Agent
import crypto from 'crypto';
import { MarketEvent, TradingSignal, OnChainEvent } from '../types/index.js';

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any) {
    console.log(`[${new Date().toISOString()}] [${this.context}] INFO: ${message}`, data || '');
  }

  warn(message: string, data?: any) {
    console.warn(`[${new Date().toISOString()}] [${this.context}] WARN: ${message}`, data || '');
  }

  error(message: string, error?: any) {
    console.error(`[${new Date().toISOString()}] [${this.context}] ERROR: ${message}`, error || '');
  }

  debug(message: string, data?: any) {
    if (process.env.DEBUG === 'true') {
      console.debug(`[${new Date().toISOString()}] [${this.context}] DEBUG: ${message}`, data || '');
    }
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function calculateSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const bullishKeywords = [
    'bullish', 'moon', 'pump', 'surge', 'rally', 'breakout', 'adoption', 
    'partnership', 'approval', 'institutional', 'etf', 'upgrade', 'launch',
    'positive', 'growth', 'increase', 'rise', 'gain', 'profit', 'buy'
  ];
  
  const bearishKeywords = [
    'bearish', 'crash', 'dump', 'drop', 'fall', 'decline', 'sell-off',
    'regulation', 'ban', 'hack', 'exploit', 'lawsuit', 'investigation',
    'negative', 'loss', 'decrease', 'fear', 'panic', 'sell', 'short'
  ];

  const lowerText = text.toLowerCase();
  let bullishScore = 0;
  let bearishScore = 0;

  bullishKeywords.forEach(keyword => {
    const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
    bullishScore += matches;
  });

  bearishKeywords.forEach(keyword => {
    const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
    bearishScore += matches;
  });

  if (bullishScore > bearishScore) return 'bullish';
  if (bearishScore > bullishScore) return 'bearish';
  return 'neutral';
}

export function calculateConfidence(event: MarketEvent): number {
  let confidence = 50; // Base confidence

  // Source reliability
  const reliableSources = ['coindesk', 'cointelegraph', 'reuters', 'bloomberg'];
  if (reliableSources.some(source => event.source.toLowerCase().includes(source))) {
    confidence += 20;
  }

  // Event severity
  switch (event.severity) {
    case 'critical':
      confidence += 25;
      break;
    case 'high':
      confidence += 15;
      break;
    case 'medium':
      confidence += 5;
      break;
    default:
      confidence -= 5;
  }

  // Content quality (length and detail)
  if (event.content.length > 500) confidence += 10;
  if (event.content.length > 1000) confidence += 5;

  // Multiple affected assets (broader impact)
  if (event.affectedAssets.length > 1) confidence += 10;

  return Math.min(Math.max(confidence, 0), 100);
}

export function extractAffectedAssets(text: string): string[] {
  const cryptoSymbols = [
    'BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'MATIC', 'AVAX', 'ATOM',
    'XRP', 'LTC', 'BCH', 'ETC', 'DOGE', 'SHIB', 'UNI', 'AAVE', 'COMP',
    'BITCOIN', 'ETHEREUM', 'SOLANA', 'CARDANO', 'POLKADOT', 'CHAINLINK'
  ];

  const foundAssets = new Set<string>();
  const upperText = text.toUpperCase();

  cryptoSymbols.forEach(symbol => {
    if (upperText.includes(symbol)) {
      // Normalize to standard symbols
      if (symbol === 'BITCOIN') foundAssets.add('BTC');
      else if (symbol === 'ETHEREUM') foundAssets.add('ETH');
      else if (symbol === 'SOLANA') foundAssets.add('SOL');
      else if (symbol === 'CARDANO') foundAssets.add('ADA');
      else if (symbol === 'POLKADOT') foundAssets.add('DOT');
      else if (symbol === 'CHAINLINK') foundAssets.add('LINK');
      else foundAssets.add(symbol);
    }
  });

  return Array.from(foundAssets);
}

export function generateTradingSignal(event: MarketEvent): TradingSignal | null {
  if (event.confidence < 60) return null; // Too low confidence

  const signal: TradingSignal = {
    action: 'hold',
    asset: event.affectedAssets[0] || 'BTC',
    confidence: event.confidence,
    reasoning: `Based on ${event.type} event: ${event.title}`,
    urgency: 'medium'
  };

  // Determine action based on sentiment and severity
  if (event.sentiment === 'bullish' && event.severity !== 'low') {
    signal.action = 'buy';
    signal.urgency = event.severity === 'critical' ? 'immediate' : 'high';
  } else if (event.sentiment === 'bearish' && event.severity !== 'low') {
    signal.action = 'sell';
    signal.urgency = event.severity === 'critical' ? 'immediate' : 'high';
  }

  // Adjust confidence based on urgency
  if (signal.urgency === 'immediate') signal.confidence = Math.min(signal.confidence + 10, 100);

  return signal;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[^\w\s\-.,!?()]/g, '') // Remove special characters except basic punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export function calculatePositionSize(
  portfolioValue: number,
  riskPercentage: number,
  confidence: number
): number {
  // Adjust position size based on confidence
  const confidenceMultiplier = confidence / 100;
  const adjustedRisk = riskPercentage * confidenceMultiplier;
  
  return (portfolioValue * adjustedRisk) / 100;
}

export function shouldExecuteTrade(
  signal: TradingSignal,
  minConfidence: number = 70
): boolean {
  return signal.confidence >= minConfidence && 
         signal.action !== 'hold' && 
         signal.urgency !== 'low';
}
