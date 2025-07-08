// News Monitoring Plugin for CryptoSentinel
// Showcasing Brain Framework's custom plugin capabilities

import { createSimplePlugin } from "@iqai/agent";
import Parser from 'rss-parser';
import axios from 'axios';
import { Logger, generateId, calculateSentiment, extractAffectedAssets, calculateConfidence, generateTradingSignal } from '../../utils/index.js';
import { MarketEvent, NewsSource, PluginContext } from '../../types/index.js';

const logger = new Logger('NewsMonitor');

interface NewsMonitorConfig {
  sources: NewsSource[];
  checkInterval: number; // seconds
  maxArticlesPerCheck: number;
}

class NewsMonitorService {
  private parser: Parser;
  private lastCheckTime: Map<string, Date> = new Map();
  private processedArticles: Set<string> = new Set();

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      customFields: {
        item: ['pubDate', 'description', 'content:encoded']
      }
    });
  }

  async fetchRSSFeed(source: NewsSource): Promise<MarketEvent[]> {
    try {
      logger.debug(`Fetching RSS feed from ${source.name}: ${source.url}`);
      
      const feed = await this.parser.parseURL(source.url);
      const events: MarketEvent[] = [];
      const lastCheck = this.lastCheckTime.get(source.name) || new Date(0);

      for (const item of feed.items.slice(0, 10)) { // Limit to 10 most recent
        if (!item.title || !item.pubDate) continue;

        const pubDate = new Date(item.pubDate);
        if (pubDate <= lastCheck) continue;

        const articleId = `${source.name}-${item.title}-${pubDate.getTime()}`;
        if (this.processedArticles.has(articleId)) continue;

        const content = item.contentSnippet || item.content || item.description || '';
        const fullText = `${item.title} ${content}`;
        
        // Only process crypto-related articles
        if (!this.isCryptoRelated(fullText)) continue;

        const affectedAssets = extractAffectedAssets(fullText);
        if (affectedAssets.length === 0) continue; // Skip if no crypto assets mentioned

        const event: MarketEvent = {
          id: generateId(),
          timestamp: pubDate,
          source: source.name,
          type: 'news',
          severity: this.calculateSeverity(fullText, source.priority),
          affectedAssets,
          title: item.title,
          content: content.substring(0, 1000), // Limit content length
          sentiment: calculateSentiment(fullText),
          confidence: 0 // Will be calculated later
        };

        event.confidence = calculateConfidence(event);
        event.tradingSignal = generateTradingSignal(event);

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

    } catch (error) {
      logger.error(`Failed to fetch RSS feed from ${source.name}:`, error);
      return [];
    }
  }

  private isCryptoRelated(text: string): boolean {
    const cryptoKeywords = [
      'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency', 'blockchain',
      'defi', 'nft', 'altcoin', 'trading', 'exchange', 'wallet', 'mining',
      'solana', 'cardano', 'polkadot', 'chainlink', 'binance', 'coinbase'
    ];

    const lowerText = text.toLowerCase();
    return cryptoKeywords.some(keyword => lowerText.includes(keyword));
  }

  private calculateSeverity(text: string, sourcePriority: number): 'low' | 'medium' | 'high' | 'critical' {
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

  async checkAllSources(sources: NewsSource[]): Promise<MarketEvent[]> {
    const allEvents: MarketEvent[] = [];
    
    for (const source of sources.filter(s => s.enabled)) {
      if (source.type === 'rss') {
        const events = await this.fetchRSSFeed(source);
        allEvents.push(...events);
      }
      // Future: Add API and WebSocket support
    }

    return allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export function createNewsMonitorPlugin(config: NewsMonitorConfig): ReturnType<typeof createSimplePlugin> {
  const newsService = new NewsMonitorService();
  
  return createSimplePlugin({
    name: "news-monitor",
    description: "Monitors crypto news sources for market-moving events and generates trading signals",
    actions: [
      {
        name: "CHECK_NEWS",
        description: "Check all configured news sources for new crypto-related articles",
        handler: async (opts) => {
          try {
            logger.info("Starting news monitoring check...");
            
            const events = await newsService.checkAllSources(config.sources);
            
            if (events.length === 0) {
              opts.callback?.({
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
              (opts.runtime as any).marketEvents = [...existingEvents, ...events];
            }

            opts.callback?.({
              text: response
            });

            logger.info(`News monitoring complete: ${events.length} events processed`);
            return true;

          } catch (error) {
            logger.error('News monitoring failed:', error);
            opts.callback?.({
              text: "❌ News monitoring failed - check logs for details"
            });
            return false;
          }
        }
      },
      {
        name: "GET_LATEST_NEWS",
        description: "Get the latest processed news events",
        handler: async (opts) => {
          try {
            const events = (opts.runtime as any)?.marketEvents || opts.runtime?.getSetting('marketEvents') || [];
            const eventsArray = Array.isArray(events) ? events : [];
            const recentEvents = eventsArray
              .filter((e: MarketEvent) => Date.now() - e.timestamp.getTime() < 3600000) // Last hour
              .slice(0, 5);

            if (recentEvents.length === 0) {
              opts.callback?.({
                text: "📰 No recent news events found"
              });
              return true;
            }

            let response = `📰 **LATEST NEWS EVENTS:**\n\n`;
            recentEvents.forEach((event: MarketEvent) => {
              response += `• **${event.title}**\n`;
              response += `  Source: ${event.source}\n`;
              response += `  Assets: ${event.affectedAssets.join(', ')}\n`;
              response += `  Sentiment: ${event.sentiment.toUpperCase()}\n`;
              response += `  Confidence: ${event.confidence}%\n`;
              response += `  Time: ${event.timestamp.toLocaleTimeString()}\n\n`;
            });

            opts.callback?.({
              text: response
            });

            return true;
          } catch (error) {
            logger.error('Failed to get latest news:', error);
            opts.callback?.({
              text: "❌ Failed to retrieve latest news"
            });
            return false;
          }
        }
      }
    ]
  });
}

// Default news sources configuration
export const defaultNewsSources: NewsSource[] = [
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
