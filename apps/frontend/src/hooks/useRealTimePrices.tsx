import { useState, useEffect } from 'react';

interface AssetPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: string;
}

const ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', coingeckoId: 'bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum' },
  { symbol: 'XRP', name: 'XRP', coingeckoId: 'ripple' },
  { symbol: 'BNB', name: 'BNB', coingeckoId: 'binancecoin' },
  { symbol: 'SOL', name: 'Solana', coingeckoId: 'solana' },
  { symbol: 'DOGE', name: 'Dogecoin', coingeckoId: 'dogecoin' },
  { symbol: 'ADA', name: 'Cardano', coingeckoId: 'cardano' },
  { symbol: 'HYPE', name: 'Hyperliquid', coingeckoId: 'hyperliquid' },
  { symbol: 'GOLD', name: 'Gold', coingeckoId: 'gold' }, // Note: May need different API for gold
];

export const useRealTimePrices = () => {
  const [prices, setPrices] = useState<AssetPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setError(null);
      
      // Create CoinGecko API call for crypto assets
      const cryptoAssets = ASSETS.filter(asset => asset.symbol !== 'GOLD');
      const ids = cryptoAssets.map(asset => asset.coingeckoId).join(',');
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_last_updated_at=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      
      const data = await response.json();
      
      const priceData: AssetPrice[] = cryptoAssets.map(asset => {
        const coinData = data[asset.coingeckoId];
        return {
          symbol: asset.symbol,
          name: asset.name,
          price: coinData?.usd || 0,
          change24h: coinData?.usd_24h_change || 0,
          marketCap: coinData?.usd_market_cap || 0,
          volume24h: coinData?.usd_24h_vol || 0,
          lastUpdated: new Date(coinData?.last_updated_at * 1000 || Date.now()).toISOString(),
        };
      });

      // Add mock gold data (you can replace with real gold API)
      priceData.push({
        symbol: 'GOLD',
        name: 'Gold',
        price: 2650.50, // Mock price
        change24h: 0.8,
        marketCap: 15000000000000, // Large market cap for gold
        volume24h: 180000000000,
        lastUpdated: new Date().toISOString(),
      });

      // Sort by market cap (descending)
      priceData.sort((a, b) => b.marketCap - a.marketCap);
      
      setPrices(priceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Price fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Update prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { prices, isLoading, error, refetch: fetchPrices };
};