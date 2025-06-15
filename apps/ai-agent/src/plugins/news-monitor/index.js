"use strict";
// News Monitoring Plugin for CryptoSentinel
// Showcasing Brain Framework's custom plugin capabilities
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultNewsSources = void 0;
exports.createNewsMonitorPlugin = createNewsMonitorPlugin;
const agent_1 = require("@iqai/agent");
const rss_parser_1 = __importDefault(require("rss-parser"));
const index_js_1 = require("../../utils/index.js");
const logger = new index_js_1.Logger('NewsMonitor');
class NewsMonitorService {
    constructor() {
        this.lastCheckTime = new Map();
        this.processedArticles = new Set();
        this.parser = new rss_parser_1.default({
            timeout: 10000,
            customFields: {
                item: ['pubDate', 'description', 'content:encoded']
            }
        });
    }
    fetchRSSFeed(source) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.debug(`Fetching RSS feed from ${source.name}: ${source.url}`);
                const feed = yield this.parser.parseURL(source.url);
                const events = [];
                const lastCheck = this.lastCheckTime.get(source.name) || new Date(0);
                for (const item of feed.items.slice(0, 10)) { // Limit to 10 most recent
                    if (!item.title || !item.pubDate)
                        continue;
                    const pubDate = new Date(item.pubDate);
                    if (pubDate <= lastCheck)
                        continue;
                    const articleId = `${source.name}-${item.title}-${pubDate.getTime()}`;
                    if (this.processedArticles.has(articleId))
                        continue;
                    const content = item.contentSnippet || item.content || item.description || '';
                    const fullText = `${item.title} ${content}`;
                    // Only process crypto-related articles
                    if (!this.isCryptoRelated(fullText))
                        continue;
                    const affectedAssets = (0, index_js_1.extractAffectedAssets)(fullText);
                    if (affectedAssets.length === 0)
                        continue; // Skip if no crypto assets mentioned
                    const event = {
                        id: (0, index_js_1.generateId)(),
                        timestamp: pubDate,
                        source: source.name,
                        type: 'news',
                        severity: this.calculateSeverity(fullText, source.priority),
                        affectedAssets,
                        title: item.title,
                        content: content.substring(0, 1000), // Limit content length
                        sentiment: (0, index_js_1.calculateSentiment)(fullText),
                        confidence: 0 // Will be calculated later
                    };
                    event.confidence = (0, index_js_1.calculateConfidence)(event);
                    event.tradingSignal = (0, index_js_1.generateTradingSignal)(event);
                    events.push(event);
                    this.processedArticles.add(articleId);
                    logger.info(`New crypto news detected: ${event.title}`, {
                        sentiment: event.sentiment,
                        confidence: event.confidence,
                        assets: event.affectedAssets
                    });
                }
                this.lastCheckTime.set(source.name, new Date());
                return events;
            }
            catch (error) {
                logger.error(`Failed to fetch RSS feed from ${source.name}:`, error);
                return [];
            }
        });
    }
    isCryptoRelated(text) {
        const cryptoKeywords = [
            'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency', 'blockchain',
            'defi', 'nft', 'altcoin', 'trading', 'exchange', 'wallet', 'mining',
            'solana', 'cardano', 'polkadot', 'chainlink', 'binance', 'coinbase'
        ];
        const lowerText = text.toLowerCase();
        return cryptoKeywords.some(keyword => lowerText.includes(keyword));
    }
    calculateSeverity(text, sourcePriority) {
        const criticalKeywords = ['hack', 'exploit', 'ban', 'regulation', 'lawsuit', 'sec', 'crash'];
        const highKeywords = ['partnership', 'adoption', 'etf', 'institutional', 'upgrade', 'launch'];
        const mediumKeywords = ['analysis', 'prediction', 'trend', 'market', 'price'];
        const lowerText = text.toLowerCase();
        if (criticalKeywords.some(keyword => lowerText.includes(keyword))) {
            return 'critical';
        }
        if (highKeywords.some(keyword => lowerText.includes(keyword)) && sourcePriority >= 7) {
            return 'high';
        }
        if (mediumKeywords.some(keyword => lowerText.includes(keyword)) && sourcePriority >= 5) {
            return 'medium';
        }
        return 'low';
    }
    checkAllSources(sources) {
        return __awaiter(this, void 0, void 0, function* () {
            const allEvents = [];
            for (const source of sources.filter(s => s.enabled)) {
                if (source.type === 'rss') {
                    const events = yield this.fetchRSSFeed(source);
                    allEvents.push(...events);
                }
                // Future: Add API and WebSocket support
            }
            return allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        });
    }
}
function createNewsMonitorPlugin(config) {
    const newsService = new NewsMonitorService();
    return (0, agent_1.createSimplePlugin)({
        name: "news-monitor",
        description: "Monitors crypto news sources for market-moving events and generates trading signals",
        actions: [
            {
                name: "CHECK_NEWS",
                description: "Check all configured news sources for new crypto-related articles",
                handler: (opts) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    try {
                        logger.info("Starting news monitoring check...");
                        const events = yield newsService.checkAllSources(config.sources);
                        if (events.length === 0) {
                            (_a = opts.callback) === null || _a === void 0 ? void 0 : _a.call(opts, {
                                text: "📰 News check complete - No new crypto-related articles found"
                            });
                            return true;
                        }
                        // Process high-priority events
                        const criticalEvents = events.filter(e => e.severity === 'critical');
                        const highEvents = events.filter(e => e.severity === 'high');
                        let response = `📰 **NEWS MONITORING REPORT**\n\n`;
                        response += `Found ${events.length} new crypto-related articles\n`;
                        if (criticalEvents.length > 0) {
                            response += `🚨 **CRITICAL EVENTS (${criticalEvents.length}):**\n`;
                            criticalEvents.forEach(event => {
                                response += `• ${event.title}\n`;
                                response += `  Assets: ${event.affectedAssets.join(', ')}\n`;
                                response += `  Sentiment: ${event.sentiment.toUpperCase()}\n`;
                                if (event.tradingSignal) {
                                    response += `  Signal: ${event.tradingSignal.action.toUpperCase()} (${event.tradingSignal.confidence}% confidence)\n`;
                                }
                                response += `\n`;
                            });
                        }
                        if (highEvents.length > 0) {
                            response += `⚠️ **HIGH PRIORITY EVENTS (${highEvents.length}):**\n`;
                            highEvents.slice(0, 3).forEach(event => {
                                response += `• ${event.title}\n`;
                                response += `  Assets: ${event.affectedAssets.join(', ')}\n`;
                                response += `  Sentiment: ${event.sentiment.toUpperCase()}\n`;
                                response += `\n`;
                            });
                        }
                        // Store events for other plugins to access
                        if (opts.runtime) {
                            const existingEvents = opts.runtime.getSetting('marketEvents') || [];
                            // Note: Brain Framework runtime may not have setSetting, storing in memory for now
                            opts.runtime.marketEvents = [...existingEvents, ...events];
                        }
                        (_b = opts.callback) === null || _b === void 0 ? void 0 : _b.call(opts, {
                            text: response
                        });
                        logger.info(`News monitoring complete: ${events.length} events processed`);
                        return true;
                    }
                    catch (error) {
                        logger.error('News monitoring failed:', error);
                        (_c = opts.callback) === null || _c === void 0 ? void 0 : _c.call(opts, {
                            text: "❌ News monitoring failed - check logs for details"
                        });
                        return false;
                    }
                })
            },
            {
                name: "GET_LATEST_NEWS",
                description: "Get the latest processed news events",
                handler: (opts) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e;
                    try {
                        const events = ((_a = opts.runtime) === null || _a === void 0 ? void 0 : _a.marketEvents) || ((_b = opts.runtime) === null || _b === void 0 ? void 0 : _b.getSetting('marketEvents')) || [];
                        const eventsArray = Array.isArray(events) ? events : [];
                        const recentEvents = eventsArray
                            .filter((e) => Date.now() - e.timestamp.getTime() < 3600000) // Last hour
                            .slice(0, 5);
                        if (recentEvents.length === 0) {
                            (_c = opts.callback) === null || _c === void 0 ? void 0 : _c.call(opts, {
                                text: "📰 No recent news events found"
                            });
                            return true;
                        }
                        let response = `📰 **LATEST NEWS EVENTS:**\n\n`;
                        recentEvents.forEach((event) => {
                            response += `• **${event.title}**\n`;
                            response += `  Source: ${event.source}\n`;
                            response += `  Assets: ${event.affectedAssets.join(', ')}\n`;
                            response += `  Sentiment: ${event.sentiment.toUpperCase()}\n`;
                            response += `  Confidence: ${event.confidence}%\n`;
                            response += `  Time: ${event.timestamp.toLocaleTimeString()}\n\n`;
                        });
                        (_d = opts.callback) === null || _d === void 0 ? void 0 : _d.call(opts, {
                            text: response
                        });
                        return true;
                    }
                    catch (error) {
                        logger.error('Failed to get latest news:', error);
                        (_e = opts.callback) === null || _e === void 0 ? void 0 : _e.call(opts, {
                            text: "❌ Failed to retrieve latest news"
                        });
                        return false;
                    }
                })
            }
        ]
    });
}
// Default news sources configuration
exports.defaultNewsSources = [
    {
        name: 'CoinDesk',
        url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
        type: 'rss',
        enabled: true,
        priority: 9
    },
    {
        name: 'CoinTelegraph',
        url: 'https://cointelegraph.com/rss',
        type: 'rss',
        enabled: true,
        priority: 8
    },
    {
        name: 'Decrypt',
        url: 'https://decrypt.co/feed',
        type: 'rss',
        enabled: true,
        priority: 7
    },
    {
        name: 'The Block',
        url: 'https://www.theblock.co/rss.xml',
        type: 'rss',
        enabled: true,
        priority: 8
    }
];
