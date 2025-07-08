import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useRealTimePrices } from "@/hooks/useRealTimePrices";

interface MarketOverviewProps {
  detailed?: boolean;
}

const MarketOverview = ({ detailed = false }: MarketOverviewProps) => {
  const { prices, isLoading, error, refetch, wsConnected } = useRealTimePrices();
  const [showAll, setShowAll] = useState(false);

  const displayData = detailed ? prices : (showAll ? prices : prices.slice(0, 5));

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

  const formatMarketCapInBillions = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
      return `${(marketCap / 1e9).toFixed(1)}B`;
    }
    if (marketCap >= 1e6) {
      return `${(marketCap / 1e6).toFixed(0)}M`;
    }
    if (marketCap >= 1e3) {
      return `${(marketCap / 1e3).toFixed(0)}K`;
    }
    return `${marketCap.toFixed(0)}`;
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
            <CardDescription className="flex items-center gap-2">
              <span>Live prices sorted by market cap</span>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                <span className="text-xs">
                  {wsConnected ? 'Real-time' : 'Delayed'}
                </span>
              </span>
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
              <div key={i} className="grid grid-cols-4 items-center p-3 rounded-lg animate-pulse gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-1">
                    <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Column Headers */}
            <div className="grid grid-cols-4 items-center px-3 py-2 text-xs font-medium text-muted-foreground gap-4 border-b">
              <div>Asset</div>
              <div className="text-right">Price</div>
              <div className="text-right">Market Cap</div>
              <div className="text-right">24h Change</div>
            </div>
            {displayData.map((asset, index) => (
              <div key={asset.symbol} className="grid grid-cols-4 items-center p-3 rounded-lg hover:bg-accent transition-colors gap-4">
                {/* Asset Info */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img 
                        src={`/assets/logos/${asset.symbol}.png`}
                        alt={`${asset.name} logo`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to text if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.className = "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center";
                            parent.innerHTML = `<span class="text-xs font-bold">${asset.symbol}</span>`;
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                  </div>
                </div>
                
                {/* Price */}
                <div className="text-right">
                  <p className="font-medium">{formatPrice(asset.price, asset.symbol)}</p>
                </div>

                {/* Market Cap */}
                <div className="text-right">
                  <p className="font-medium">${formatMarketCapInBillions(asset.marketCap)}</p>
                  <p className="text-xs text-muted-foreground">Market Cap</p>
                </div>

                {/* 24h Change */}
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {asset.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </span>
                  </div>
                  {detailed && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Vol: {formatVolume(asset.volume24h)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!detailed && prices.length > 5 && (
          <div className="mt-4 text-center space-y-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show All ({prices.length})
                </>
              )}
            </Button>
            <Badge variant="outline" className="block">
              {showAll 
                ? `Showing all ${prices.length} assets` 
                : `Showing top 5 of ${prices.length} assets`
              }
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketOverview;