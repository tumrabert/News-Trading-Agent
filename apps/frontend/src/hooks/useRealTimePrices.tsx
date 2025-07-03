import { useState, useEffect, useRef, useCallback } from 'react';

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
  { symbol: 'BTC', name: 'Bitcoin', coingeckoId: 'bitcoin', binanceSymbol: 'BTCUSDT' },
  { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum', binanceSymbol: 'ETHUSDT' },
  { symbol: 'XRP', name: 'XRP', coingeckoId: 'ripple', binanceSymbol: 'XRPUSDT' },
  { symbol: 'BNB', name: 'BNB', coingeckoId: 'binancecoin', binanceSymbol: 'BNBUSDT' },
  { symbol: 'SOL', name: 'Solana', coingeckoId: 'solana', binanceSymbol: 'SOLUSDT' },
  { symbol: 'DOGE', name: 'Dogecoin', coingeckoId: 'dogecoin', binanceSymbol: 'DOGEUSDT' },
  { symbol: 'ADA', name: 'Cardano', coingeckoId: 'cardano', binanceSymbol: 'ADAUSDT' },
  { symbol: 'HYPE', name: 'Hyperliquid', coingeckoId: 'hyperliquid', binanceSymbol: null }, // Not on Binance
  { symbol: 'GOLD', name: 'Gold', coingeckoId: 'gold', binanceSymbol: null }, // Not on Binance
];

// Assets available on Binance WebSocket
const BINANCE_ASSETS = ASSETS.filter(asset => asset.binanceSymbol);
// Assets to fetch from CoinGecko
const COINGECKO_ASSETS = ASSETS.filter(asset => !asset.binanceSymbol);

export const useRealTimePrices = () => {
  const [prices, setPrices] = useState<AssetPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pricesRef = useRef<Map<string, AssetPrice>>(new Map());

  // Update a single asset price
  const updateAssetPrice = useCallback((symbol: string, updates: Partial<AssetPrice>) => {
    const asset = ASSETS.find(a => a.symbol === symbol);
    if (!asset) return;

    const currentPrice = pricesRef.current.get(symbol) || {
      symbol,
      name: asset.name,
      price: 0,
      change24h: 0,
      marketCap: 0,
      volume24h: 0,
      lastUpdated: new Date().toISOString(),
    };

    const updatedPrice = { ...currentPrice, ...updates, lastUpdated: new Date().toISOString() };
    pricesRef.current.set(symbol, updatedPrice);

    // Update state with sorted prices by market cap
    const allPrices = Array.from(pricesRef.current.values()).sort((a, b) => b.marketCap - a.marketCap);
    setPrices(allPrices);
  }, []);

  // Fetch market cap and volume data from CoinGecko (for market cap sorting)
  const fetchMarketData = useCallback(async () => {
    try {
      const binanceAssets = BINANCE_ASSETS.filter(asset => asset.symbol !== 'GOLD');
      const ids = binanceAssets.map(asset => asset.coingeckoId).join(',');
      
      console.log('Fetching market data for:', ids);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('CoinGecko market data response:', data);
        
        binanceAssets.forEach(asset => {
          const coinData = data[asset.coingeckoId];
          if (coinData) {
            console.log(`Updating ${asset.symbol} with market cap:`, coinData.usd_market_cap);
            updateAssetPrice(asset.symbol, {
              marketCap: coinData.usd_market_cap || 0,
              volume24h: coinData.usd_24h_vol || 0,
            });
          }
        });
      } else {
        console.error('CoinGecko API error:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    }
  }, [updateAssetPrice]);

  // Fetch CoinGecko data for assets not on Binance
  const fetchCoinGeckoData = useCallback(async () => {
    try {
      const coingeckoAssets = COINGECKO_ASSETS.filter(asset => asset.symbol !== 'GOLD');
      if (coingeckoAssets.length === 0) return;

      const ids = coingeckoAssets.map(asset => asset.coingeckoId).join(',');
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        coingeckoAssets.forEach(asset => {
          const coinData = data[asset.coingeckoId];
          if (coinData) {
            updateAssetPrice(asset.symbol, {
              price: coinData.usd || 0,
              change24h: coinData.usd_24h_change || 0,
              marketCap: coinData.usd_market_cap || 0,
              volume24h: coinData.usd_24h_vol || 0,
            });
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch CoinGecko data:', error);
    }
  }, [updateAssetPrice]);

  // Add Gold data
  const addGoldData = useCallback(() => {
    updateAssetPrice('GOLD', {
      price: 2650.50 + (Math.random() - 0.5) * 10, // Mock real-time fluctuation
      change24h: 0.8 + (Math.random() - 0.5) * 2,
      marketCap: 15000000000000,
      volume24h: 180000000000,
    });
  }, [updateAssetPrice]);

  // Setup Binance WebSocket
  const setupWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // Create stream names for all Binance assets
      const streams = BINANCE_ASSETS.map(asset => `${asset.binanceSymbol!.toLowerCase()}@ticker`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
      
      console.log('Connecting to Binance WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Binance WebSocket connected');
        setWsConnected(true);
        setError(null);
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle single ticker or array of tickers
          const tickers = Array.isArray(data) ? data : [data];
          
          tickers.forEach((ticker: any) => {
            const binanceSymbol = ticker.s; // e.g., 'BTCUSDT'
            const asset = BINANCE_ASSETS.find(a => a.binanceSymbol === binanceSymbol);
            
            if (asset) {
              updateAssetPrice(asset.symbol, {
                price: parseFloat(ticker.c), // Current price
                change24h: parseFloat(ticker.P), // 24h price change percentage
                volume24h: parseFloat(ticker.q), // 24h quote asset volume
              });
            }
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
        setError('WebSocket connection error');
      };

      ws.onclose = (event) => {
        console.log('Binance WebSocket closed:', event.code, event.reason);
        setWsConnected(false);
        
        // Attempt to reconnect after 3 seconds if not manually closed
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            setupWebSocket();
          }, 3000);
        }
      };

    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
      setError('Failed to connect to real-time data');
    }
  }, [updateAssetPrice]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      // Add gold data
      addGoldData();
      
      // Fetch initial market data for sorting
      await fetchMarketData();
      
      // Fetch CoinGecko data for non-Binance assets
      await fetchCoinGeckoData();
      
      // Setup WebSocket for real-time Binance data
      setupWebSocket();
      
      setIsLoading(false);
    };

    initialize();

    // Fetch market data periodically for market cap updates
    const marketDataInterval = setInterval(fetchMarketData, 60000); // Every minute
    
    // Fetch CoinGecko data periodically for non-Binance assets
    const coingeckoInterval = setInterval(fetchCoinGeckoData, 30000); // Every 30 seconds
    
    // Update gold data periodically
    const goldInterval = setInterval(addGoldData, 10000); // Every 10 seconds

    return () => {
      cleanup();
      clearInterval(marketDataInterval);
      clearInterval(coingeckoInterval);
      clearInterval(goldInterval);
    };
  }, [setupWebSocket, fetchMarketData, fetchCoinGeckoData, addGoldData, cleanup]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchMarketData();
    await fetchCoinGeckoData();
    addGoldData();
    
    // Reconnect WebSocket if disconnected
    if (!wsConnected) {
      setupWebSocket();
    }
    setIsLoading(false);
  }, [fetchMarketData, fetchCoinGeckoData, addGoldData, setupWebSocket, wsConnected]);

  return { 
    prices, 
    isLoading, 
    error, 
    refetch, 
    wsConnected 
  };
};