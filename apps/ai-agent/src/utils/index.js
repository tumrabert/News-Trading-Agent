"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.generateId = generateId;
exports.calculateSentiment = calculateSentiment;
exports.calculateConfidence = calculateConfidence;
exports.extractAffectedAssets = extractAffectedAssets;
exports.generateTradingSignal = generateTradingSignal;
exports.formatCurrency = formatCurrency;
exports.formatPercentage = formatPercentage;
exports.sleep = sleep;
exports.isValidUrl = isValidUrl;
exports.sanitizeText = sanitizeText;
exports.calculatePositionSize = calculatePositionSize;
exports.shouldExecuteTrade = shouldExecuteTrade;
// Utility functions for CryptoSentinel Trading Agent
const crypto_1 = __importDefault(require("crypto"));
class Logger {
    constructor(context) {
        this.context = context;
    }
    info(message, data) {
        console.log(`[${new Date().toISOString()}] [${this.context}] INFO: ${message}`, data || '');
    }
    warn(message, data) {
        console.warn(`[${new Date().toISOString()}] [${this.context}] WARN: ${message}`, data || '');
    }
    error(message, error) {
        console.error(`[${new Date().toISOString()}] [${this.context}] ERROR: ${message}`, error || '');
    }
    debug(message, data) {
        if (process.env.DEBUG === 'true') {
            console.debug(`[${new Date().toISOString()}] [${this.context}] DEBUG: ${message}`, data || '');
        }
    }
}
exports.Logger = Logger;
function generateId() {
    return crypto_1.default.randomUUID();
}
function calculateSentiment(text) {
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
    if (bullishScore > bearishScore)
        return 'bullish';
    if (bearishScore > bullishScore)
        return 'bearish';
    return 'neutral';
}
function calculateConfidence(event) {
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
    if (event.content.length > 500)
        confidence += 10;
    if (event.content.length > 1000)
        confidence += 5;
    // Multiple affected assets (broader impact)
    if (event.affectedAssets.length > 1)
        confidence += 10;
    return Math.min(Math.max(confidence, 0), 100);
}
function extractAffectedAssets(text) {
    const cryptoSymbols = [
        'BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'MATIC', 'AVAX', 'ATOM',
        'XRP', 'LTC', 'BCH', 'ETC', 'DOGE', 'SHIB', 'UNI', 'AAVE', 'COMP',
        'BITCOIN', 'ETHEREUM', 'SOLANA', 'CARDANO', 'POLKADOT', 'CHAINLINK'
    ];
    const foundAssets = new Set();
    const upperText = text.toUpperCase();
    cryptoSymbols.forEach(symbol => {
        if (upperText.includes(symbol)) {
            // Normalize to standard symbols
            if (symbol === 'BITCOIN')
                foundAssets.add('BTC');
            else if (symbol === 'ETHEREUM')
                foundAssets.add('ETH');
            else if (symbol === 'SOLANA')
                foundAssets.add('SOL');
            else if (symbol === 'CARDANO')
                foundAssets.add('ADA');
            else if (symbol === 'POLKADOT')
                foundAssets.add('DOT');
            else if (symbol === 'CHAINLINK')
                foundAssets.add('LINK');
            else
                foundAssets.add(symbol);
        }
    });
    return Array.from(foundAssets);
}
function generateTradingSignal(event) {
    if (event.confidence < 60)
        return null; // Too low confidence
    const signal = {
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
    }
    else if (event.sentiment === 'bearish' && event.severity !== 'low') {
        signal.action = 'sell';
        signal.urgency = event.severity === 'critical' ? 'immediate' : 'high';
    }
    // Adjust confidence based on urgency
    if (signal.urgency === 'immediate')
        signal.confidence = Math.min(signal.confidence + 10, 100);
    return signal;
}
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
    }).format(amount);
}
function formatPercentage(value) {
    return `${(value * 100).toFixed(2)}%`;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
}
function sanitizeText(text) {
    return text
        .replace(/[^\w\s\-.,!?()]/g, '') // Remove special characters except basic punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}
function calculatePositionSize(portfolioValue, riskPercentage, confidence) {
    // Adjust position size based on confidence
    const confidenceMultiplier = confidence / 100;
    const adjustedRisk = riskPercentage * confidenceMultiplier;
    return (portfolioValue * adjustedRisk) / 100;
}
function shouldExecuteTrade(signal, minConfidence = 70) {
    return signal.confidence >= minConfidence &&
        signal.action !== 'hold' &&
        signal.urgency !== 'low';
}
