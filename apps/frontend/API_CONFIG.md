# Real-Time Price API Configuration

## Current Setup

### CoinGecko API (Free Tier)
Currently using CoinGecko's free public API for cryptocurrency prices:

**Endpoint:** `https://api.coingecko.com/api/v3/simple/price`

**Current Parameters:**
- `ids`: Asset IDs (bitcoin, ethereum, ripple, etc.)
- `vs_currencies`: usd
- `include_24hr_change`: true
- `include_market_cap`: true
- `include_24hr_vol`: true
- `include_last_updated_at`: true

**Rate Limits (Free):**
- 10-30 calls per minute
- No API key required
- Public endpoints only

## Upgrade Options for Better Real-Time Data

### 1. CoinGecko Pro API
**Cost:** $199/month
**Features:**
- Higher rate limits (500+ calls/minute)
- Real-time data (vs 5-10min delay)
- WebSocket streams available
- Enterprise support

**Setup:**
```javascript
const response = await fetch(
  `https://pro-api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
  {
    headers: {
      'X-Cg-Pro-Api-Key': 'YOUR_API_KEY'
    }
  }
);
```

### 2. CoinMarketCap API
**Cost:** $333/month (Pro plan)
**Features:**
- Real-time prices
- High rate limits
- Comprehensive market data

**Setup:**
```javascript
const response = await fetch(
  'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
  {
    headers: {
      'X-CMC_PRO_API_KEY': 'YOUR_API_KEY'
    },
    params: {
      symbol: 'BTC,ETH,XRP,BNB,SOL,DOGE,ADA'
    }
  }
);
```

### 3. Binance API (Free)
**Cost:** Free
**Features:**
- Real-time WebSocket streams
- High rate limits
- Best for major cryptocurrencies

**WebSocket Setup:**
```javascript
const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update price: data.c (current price)
  // Update 24h change: data.P (percentage change)
};
```

### 4. Alpha Vantage (For Gold)
**Cost:** $49.99/month
**Features:**
- Commodities data including Gold
- Real-time precious metals prices

**Setup:**
```javascript
const response = await fetch(
  `https://www.alphavantage.co/query?function=REAL_TIME_PRICE&symbol=XAU&apikey=YOUR_API_KEY`
);
```

## Recommended Upgrade Path

### Phase 1: WebSocket Integration (Free)
1. **Add Binance WebSocket** for major cryptos (BTC, ETH, BNB, SOL)
2. **Keep CoinGecko** for remaining assets (XRP, DOGE, ADA, HYPE)
3. **Add Alpha Vantage free tier** for Gold (5 calls/minute)

### Phase 2: Professional APIs
1. **CoinGecko Pro** for comprehensive crypto data
2. **Alpha Vantage Premium** for real-time gold
3. **Implement caching** to optimize API calls

## Implementation Example

```typescript
// Enhanced useRealTimePrices hook with WebSocket
const useRealTimePrices = () => {
  const [prices, setPrices] = useState<AssetPrice[]>([]);
  
  useEffect(() => {
    // WebSocket for major cryptos
    const binanceWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker/solusdt@ticker/bnbusdt@ticker');
    
    binanceWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updatePrice(data.s.replace('USDT', ''), parseFloat(data.c), parseFloat(data.P));
    };
    
    // REST API for remaining assets
    const fetchOtherAssets = async () => {
      // CoinGecko for XRP, DOGE, ADA, HYPE
      // Alpha Vantage for Gold
    };
    
    return () => binanceWs.close();
  }, []);
};
```

## Current Configuration Files

1. **`useRealTimePrices.tsx`** - Main price fetching hook
2. **Asset mapping** - Symbol to CoinGecko ID mapping
3. **Update interval** - Currently 30 seconds

## Next Steps

1. Choose upgrade option based on budget
2. Implement WebSocket for real-time updates
3. Add error handling and reconnection logic
4. Set up monitoring for API rate limits