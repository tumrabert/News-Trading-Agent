
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star } from "lucide-react";

interface MarketOverviewProps {
  detailed?: boolean;
}

const MarketOverview = ({ detailed = false }: MarketOverviewProps) => {
  const marketData = [
    { symbol: "BTC", name: "Bitcoin", price: 42000, change: 3.2, volume: "28.5B", marketCap: "820B" },
    { symbol: "ETH", name: "Ethereum", price: 2430, change: -1.5, volume: "15.2B", marketCap: "292B" },
    { symbol: "BNB", name: "BNB", price: 320, change: 2.8, volume: "1.8B", marketCap: "52B" },
    { symbol: "SOL", name: "Solana", price: 100, change: 8.7, volume: "2.4B", marketCap: "44B" },
    { symbol: "XRP", name: "XRP", price: 0.62, change: -0.8, volume: "1.2B", marketCap: "34B" },
    { symbol: "ADA", name: "Cardano", price: 0.48, change: 1.9, volume: "890M", marketCap: "17B" }
  ];

  const displayData = detailed ? marketData : marketData.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
        <CardDescription>Top cryptocurrencies by market cap</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayData.map((coin, index) => (
            <div key={coin.symbol} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold">{coin.symbol}</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium">{coin.name}</p>
                  <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium">${coin.price.toLocaleString()}</p>
                <div className="flex items-center space-x-1">
                  {coin.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span className={`text-xs ${coin.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {coin.change >= 0 ? '+' : ''}{coin.change}%
                  </span>
                </div>
              </div>

              {detailed && (
                <div className="text-right text-sm text-muted-foreground">
                  <p>Vol: ${coin.volume}</p>
                  <p>MCap: ${coin.marketCap}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!detailed && (
          <div className="mt-4 text-center">
            <Badge variant="outline">View all markets in Market tab</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
