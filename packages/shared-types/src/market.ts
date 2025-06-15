// Market-related types for the onchain-signal workspace

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface MarketPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  exchange: string;
  isActive: boolean;
}

export interface MarketOverview {
  topGainers: MarketData[];
  topLosers: MarketData[];
  trending: MarketData[];
  recentlyAdded: MarketData[];
  watchlist: MarketData[];
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relatedAssets: string[];
  impactScore: number;
}

export interface MarketSentiment {
  symbol: string;
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number; // -100 to 100
  socialVolume: number;
  newsVolume: number;
  timestamp: number;
}
