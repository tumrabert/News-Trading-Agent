
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";
import { useRealTimePrices } from "@/hooks/useRealTimePrices";

interface MarketOverviewProps {
  detailed?: boolean;
}

const MarketOverview = ({ detailed = false }: MarketOverviewProps) => {
  const { prices, isLoading, error, refetch } = useRealTimePrices();

  const displayData = detailed ? prices : prices.slice(0, 6);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'GOLD') {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`;
    }
    if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`;
    }
    return `$${volume.toLocaleString()}`;
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Market Overview
          </CardTitle>
          <CardDescription>Failed to load market data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Market Overview
              {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
            </CardTitle>
            <CardDescription>
              Live prices sorted by market cap • Updates every 30s
            </CardDescription>
          </div>
          <Button 
            onClick={refetch} 
            variant="ghost" 
            size="sm" 
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && prices.length === 0 ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-1">
                    <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {displayData.map((asset, index) => (
              <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold">{asset.symbol}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">{formatPrice(asset.price, asset.symbol)}</p>
                  <div className="flex items-center justify-end space-x-1">
                    {asset.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={`text-xs ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {detailed && (
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Vol: {formatVolume(asset.volume24h)}</p>
                    <p>MCap: {formatMarketCap(asset.marketCap)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {!detailed && prices.length > 6 && (
          <div className="mt-4 text-center">
            <Badge variant="outline">
              Showing top 6 assets • {prices.length} total tracked
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
