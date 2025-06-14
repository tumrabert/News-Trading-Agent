
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Brain, Target, Clock } from "lucide-react";
import { useState } from "react";
import { useAISignals } from "@/hooks/useAIAgents";
import { formatDistanceToNow } from "date-fns";

const AISignalsPanel = () => {
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const { signals, isLoading } = useAISignals();

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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={signal.signal_type === 'buy' ? 'default' : signal.signal_type === 'sell' ? 'destructive' : 'secondary'}
                    className="flex items-center space-x-1"
                  >
                    {signal.signal_type === 'buy' && <TrendingUp className="w-3 h-3" />}
                    {signal.signal_type === 'sell' && <TrendingDown className="w-3 h-3" />}
                    {signal.signal_type === 'hold' && <AlertTriangle className="w-3 h-3" />}
                    <span>{signal.signal_type.toUpperCase()} {signal.symbol}</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Target className="w-3 h-3" />
                    <span>{signal.confidence}%</span>
                  </Badge>
                  <Badge variant={signal.risk_level === 'low' ? 'secondary' : signal.risk_level === 'medium' ? 'default' : 'destructive'}>
                    {signal.risk_level} risk
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(signal.created_at), { addSuffix: true })}</span>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <p className="text-sm font-medium">{signal.reason}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {signal.target_price && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-medium">${Number(signal.target_price).toLocaleString()}</span>
                    </div>
                  )}
                  {signal.stop_loss && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stop Loss:</span>
                      <span className="font-medium">${Number(signal.stop_loss).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Horizon:</span>
                    <span className="font-medium">{signal.time_horizon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {signal.status}
                    </Badge>
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
                      {signal.technical_indicators.map((indicator, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium mb-2">Fundamental Factors</h5>
                    <div className="flex flex-wrap gap-1">
                      {signal.fundamental_factors.map((factor, idx) => (
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
                <Button size="sm" className="flex-1" disabled={signal.status !== 'pending'}>
                  Execute Trade
                </Button>
              </div>
            </div>
          ))
        )}
        
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
