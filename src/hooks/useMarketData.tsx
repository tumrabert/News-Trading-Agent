
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  lastUpdated: Date;
}

export interface PortfolioData {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  dailyPnL: number;
  holdings: Array<{
    symbol: string;
    name: string;
    amount: number;
    value: number;
    change: number;
    allocation: number;
    avgBuyPrice: number;
    unrealizedPnL: number;
  }>;
}

// Mock real-time data simulation
const generateMockMarketData = (): MarketData[] => {
  const coins = [
    { symbol: 'BTC', name: 'Bitcoin', basePrice: 42000 },
    { symbol: 'ETH', name: 'Ethereum', basePrice: 2450 },
    { symbol: 'SOL', name: 'Solana', basePrice: 98 },
    { symbol: 'MATIC', name: 'Polygon', basePrice: 0.84 }
  ];

  return coins.map(coin => ({
    symbol: coin.symbol,
    price: coin.basePrice + (Math.random() - 0.5) * coin.basePrice * 0.05,
    change24h: (Math.random() - 0.5) * 10,
    volume24h: Math.random() * 1000000000,
    marketCap: Math.random() * 100000000000,
    high24h: coin.basePrice * (1 + Math.random() * 0.08),
    low24h: coin.basePrice * (1 - Math.random() * 0.08),
    lastUpdated: new Date()
  }));
};

export const useMarketData = () => {
  const [data, setData] = useState<MarketData[]>([]);

  const { data: queryData, refetch } = useQuery({
    queryKey: ['marketData'],
    queryFn: generateMockMarketData,
    refetchInterval: 5000, // Update every 5 seconds
  });

  useEffect(() => {
    if (queryData) {
      setData(queryData);
    }
  }, [queryData]);

  return { data, refetch };
};

export const usePortfolioData = () => {
  const { data: marketData } = useMarketData();
  
  const calculatePortfolio = (): PortfolioData => {
    const holdings = [
      { symbol: "BTC", amount: 1.25, avgBuyPrice: 40000 },
      { symbol: "ETH", amount: 15.8, avgBuyPrice: 2300 },
      { symbol: "SOL", amount: 125, avgBuyPrice: 85 },
      { symbol: "MATIC", amount: 5000, avgBuyPrice: 0.75 }
    ];

    const enrichedHoldings = holdings.map(holding => {
      const marketPrice = marketData?.find(m => m.symbol === holding.symbol)?.price || holding.avgBuyPrice;
      const value = holding.amount * marketPrice;
      const unrealizedPnL = (marketPrice - holding.avgBuyPrice) * holding.amount;
      const change = ((marketPrice - holding.avgBuyPrice) / holding.avgBuyPrice) * 100;

      return {
        ...holding,
        name: holding.symbol,
        value,
        change,
        allocation: 0, // Will be calculated below
        unrealizedPnL
      };
    });

    const totalValue = enrichedHoldings.reduce((sum, h) => sum + h.value, 0);
    const totalUnrealizedPnL = enrichedHoldings.reduce((sum, h) => sum + h.unrealizedPnL, 0);
    const totalCost = enrichedHoldings.reduce((sum, h) => sum + (h.amount * h.avgBuyPrice), 0);
    const totalChangePercent = ((totalValue - totalCost) / totalCost) * 100;

    // Calculate allocations
    enrichedHoldings.forEach(holding => {
      holding.allocation = (holding.value / totalValue) * 100;
    });

    return {
      totalValue,
      totalChange: totalUnrealizedPnL,
      totalChangePercent,
      dailyPnL: totalUnrealizedPnL * 0.1, // Mock daily P&L
      holdings: enrichedHoldings
    };
  };

  return useQuery({
    queryKey: ['portfolioData', marketData],
    queryFn: calculatePortfolio,
    enabled: !!marketData?.length,
  });
};
