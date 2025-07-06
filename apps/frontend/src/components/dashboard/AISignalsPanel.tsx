
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, Brain, Clock, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface TradingSignal {
  id: string;
  agentId: string;
  symbol: string;
  signalType: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  targetPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeHorizon: string;
  technicalIndicators: string[];
  fundamentalFactors: string[];
  marketConditions: Record<string, any>;
  status: 'pending' | 'executed' | 'cancelled' | 'expired';
  createdAt: string;
  expiresAt?: string;
}

const AISignalsPanel = () => {
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch signals directly using fetch API
  const fetchSignals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/signals');
      const data = await response.json();
      
      if (data.success) {
        setSignals(data.data);
        setError(null);
      } else {
        setError(new Error('Failed to fetch signals'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch signals on component mount
  useEffect(() => {
    fetchSignals();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get recent signals (last 10)
  const recentSignals = signals.slice(0, 10);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI Signals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span>Advanced AI Signals</span>
          <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            AI Agent Active
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time AI-powered trading recommendations with detailed analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentSignals.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No AI Signals</h3>
            <p className="text-muted-foreground mb-4">
              AI agents will generate trading signals automatically when market conditions are favorable.
            </p>
          </div>
        ) : (
          recentSignals.map((signal) => (
            <div key={signal.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
              {/* Header with DateTime */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(signal.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={signal.signalType === 'buy' ? 'default' : signal.signalType === 'sell' ? 'destructive' : 'secondary'}
                    className="flex items-center space-x-1"
                  >
                    {signal.signalType === 'buy' && <TrendingUp className="w-3 h-3" />}
                    {signal.signalType === 'sell' && <TrendingDown className="w-3 h-3" />}
                    {signal.signalType === 'hold' && <AlertTriangle className="w-3 h-3" />}
                    <span>{signal.signalType.toUpperCase()}</span>
                  </Badge>
                  <Badge variant="outline" className="font-semibold">
                    {signal.symbol}
                  </Badge>
                </div>
              </div>
              
              {/* News Title and Description */}
              <div className="mb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">
                      {signal.reason || `${signal.signalType.toUpperCase()} Signal for ${signal.symbol}`}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {signal.fundamentalFactors?.join(', ') || 'Market analysis indicates favorable conditions for this trading signal based on technical and fundamental indicators.'}
                    </p>
                  </div>
                  {signal.targetPrice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 w-6 p-0"
                      onClick={() => window.open(`https://coinmarketcap.com/currencies/${signal.symbol.toLowerCase()}/`, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Signal Details */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Confidence</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={signal.confidence} className="h-2 flex-1" />
                    <span className="font-medium">{signal.confidence}%</span>
                  </div>
                </div>
                {signal.targetPrice && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Target Price</span>
                    <div className="font-medium">${Number(signal.targetPrice).toLocaleString()}</div>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-xs">
                    {signal.status}
                  </Badge>
                </div>
              </div>

              {/* Additional Info Toggle */}
              {selectedSignal === signal.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  {signal.technicalIndicators?.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium mb-1">Technical Indicators</h5>
                      <div className="flex flex-wrap gap-1">
                        {signal.technicalIndicators.map((indicator: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {signal.stopLoss && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Stop Loss: </span>
                      <span className="font-medium">${Number(signal.stopLoss).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedSignal(selectedSignal === signal.id ? null : signal.id)}
                >
                  {selectedSignal === signal.id ? 'Hide Details' : 'View Details'}
                </Button>
                <Button size="sm" variant="default" disabled={signal.status !== 'pending'}>
                  Execute Trade
                </Button>
              </div>
            </div>
          ))
        )}
        
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium">🧠 CryptoSentinel Status</p>
              <p className="text-xs text-muted-foreground">Real-time market monitoring</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Active
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Monitoring: CoinDesk, CoinTelegraph, Decrypt, The Block</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISignalsPanel;
