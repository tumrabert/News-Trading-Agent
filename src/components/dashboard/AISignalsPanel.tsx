
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Brain, Target, Clock } from "lucide-react";
import { useState } from "react";

interface AISignal {
  id: number;
  type: 'buy' | 'sell' | 'hold';
  coin: string;
  confidence: number;
  reason: string;
  timestamp: string;
  targetPrice?: number;
  stopLoss?: number;
  timeHorizon: string;
  riskLevel: 'low' | 'medium' | 'high';
  technicalIndicators: string[];
  fundamentalFactors: string[];
}

const AISignalsPanel = () => {
  const [selectedSignal, setSelectedSignal] = useState<number | null>(null);

  const aiSignals: AISignal[] = [
    {
      id: 1,
      type: 'buy',
      coin: 'BTC',
      confidence: 85,
      reason: 'Strong support at $41,500 with bullish divergence on RSI',
      timestamp: '2 min ago',
      targetPrice: 45000,
      stopLoss: 40000,
      timeHorizon: '1-2 weeks',
      riskLevel: 'low',
      technicalIndicators: ['RSI Bullish Divergence', 'Support Level Hold', 'Volume Increase'],
      fundamentalFactors: ['ETF Approval News', 'Institutional Buying', 'Network Activity Up']
    },
    {
      id: 2,
      type: 'sell',
      coin: 'ETH',
      confidence: 72,
      reason: 'Resistance at $2,500, potential pullback expected',
      timestamp: '15 min ago',
      targetPrice: 2300,
      stopLoss: 2550,
      timeHorizon: '3-5 days',
      riskLevel: 'medium',
      technicalIndicators: ['Resistance Level', 'Overbought RSI', 'Bearish Pattern'],
      fundamentalFactors: ['Gas Fees Rising', 'Network Congestion', 'Competition from L2s']
    },
    {
      id: 3,
      type: 'buy',
      coin: 'SOL',
      confidence: 78,
      reason: 'Breakout above $100 resistance with strong volume',
      timestamp: '1 hour ago',
      targetPrice: 120,
      stopLoss: 95,
      timeHorizon: '1-3 weeks',
      riskLevel: 'medium',
      technicalIndicators: ['Breakout Pattern', 'Volume Surge', 'Moving Average Cross'],
      fundamentalFactors: ['DeFi Growth', 'NFT Activity', 'Developer Adoption']
    }
  ];

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
        {aiSignals.map((signal) => (
          <div key={signal.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={signal.type === 'buy' ? 'default' : signal.type === 'sell' ? 'destructive' : 'secondary'}
                  className="flex items-center space-x-1"
                >
                  {signal.type === 'buy' && <TrendingUp className="w-3 h-3" />}
                  {signal.type === 'sell' && <TrendingDown className="w-3 h-3" />}
                  {signal.type === 'hold' && <AlertTriangle className="w-3 h-3" />}
                  <span>{signal.type.toUpperCase()} {signal.coin}</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Target className="w-3 h-3" />
                  <span>{signal.confidence}%</span>
                </Badge>
                <Badge variant={signal.riskLevel === 'low' ? 'secondary' : signal.riskLevel === 'medium' ? 'default' : 'destructive'}>
                  {signal.riskLevel} risk
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{signal.timestamp}</span>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <p className="text-sm font-medium">{signal.reason}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {signal.targetPrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-medium">${signal.targetPrice.toLocaleString()}</span>
                  </div>
                )}
                {signal.stopLoss && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stop Loss:</span>
                    <span className="font-medium">${signal.stopLoss.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Horizon:</span>
                  <span className="font-medium">{signal.timeHorizon}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="text-xs font-medium">Confidence Score</div>
              <Progress value={signal.confidence} className="h-2" />
            </div>

            {selectedSignal === signal.id && (
              <div className="space-y-3 border-t pt-3">
                <div>
                  <h5 className="text-xs font-medium mb-2">Technical Indicators</h5>
                  <div className="flex flex-wrap gap-1">
                    {signal.technicalIndicators.map((indicator, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-medium mb-2">Fundamental Factors</h5>
                  <div className="flex flex-wrap gap-1">
                    {signal.fundamentalFactors.map((factor, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => setSelectedSignal(selectedSignal === signal.id ? null : signal.id)}
              >
                {selectedSignal === signal.id ? 'Hide Analysis' : 'View Analysis'}
              </Button>
              <Button size="sm" className="flex-1">
                Execute Trade
              </Button>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium">🧠 AI Agent Status</p>
              <p className="text-xs text-muted-foreground">Connected to Brain platform</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Active
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Configure AI Agent Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISignalsPanel;
