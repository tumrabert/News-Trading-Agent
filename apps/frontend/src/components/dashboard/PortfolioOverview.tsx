
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioOverviewProps {
  detailed?: boolean;
}

const PortfolioOverview = ({ detailed = false }: PortfolioOverviewProps) => {
  const holdings = [
    { symbol: "BTC", name: "Bitcoin", amount: 1.25, value: 52500, change: 3.2, allocation: 60 },
    { symbol: "ETH", name: "Ethereum", amount: 15.8, value: 38400, change: -1.5, allocation: 25 },
    { symbol: "SOL", name: "Solana", amount: 125, value: 12500, change: 8.7, allocation: 15 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Holdings</CardTitle>
        <CardDescription>Your current crypto positions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {holdings.map((holding) => (
          <div key={holding.symbol} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img 
                  src={`/assets/logos/${holding.symbol}.png`}
                  alt={holding.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center" style={{display: 'none'}}>
                  <span className="text-xs font-bold">{holding.symbol}</span>
                </div>
              </div>
              <div>
                <p className="font-medium">{holding.name}</p>
                <p className="text-sm text-muted-foreground">{holding.amount} {holding.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">${holding.value.toLocaleString()}</p>
              <div className="flex items-center space-x-1">
                {holding.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={`text-xs ${holding.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.change >= 0 ? '+' : ''}{holding.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {detailed && (
          <div className="mt-6 space-y-4">
            <h4 className="font-medium">Portfolio Allocation</h4>
            {holdings.map((holding) => (
              <div key={holding.symbol} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={`/assets/logos/${holding.symbol}.png`}
                      alt={holding.name}
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span>{holding.symbol}</span>
                  </div>
                  <span>{holding.allocation}%</span>
                </div>
                <Progress value={holding.allocation} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioOverview;
