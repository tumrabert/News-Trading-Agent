
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, Zap } from "lucide-react";

const NewsPanel = () => {
  const aiSignals = [
    {
      id: 1,
      type: 'buy',
      coin: 'BTC',
      confidence: 85,
      reason: 'Strong support at $41,500 with bullish divergence',
      timestamp: '2 min ago'
    },
    {
      id: 2,
      type: 'sell',
      coin: 'ETH',
      confidence: 72,
      reason: 'Resistance at $2,500, potential pullback expected',
      timestamp: '15 min ago'
    },
    {
      id: 3,
      type: 'hold',
      coin: 'SOL',
      confidence: 68,
      reason: 'Consolidation phase, wait for breakout confirmation',
      timestamp: '1 hour ago'
    }
  ];

  const newsItems = [
    {
      id: 1,
      title: 'Bitcoin ETF Approval Drives Market Rally',
      summary: 'Major institutional adoption signals bullish momentum for Q1 2024',
      impact: 'bullish',
      timestamp: '1 hour ago',
      source: 'CoinDesk'
    },
    {
      id: 2,
      title: 'Ethereum Network Upgrade Shows Promising Results',
      summary: 'Gas fees reduced by 40% following latest protocol improvement',
      impact: 'bullish',
      timestamp: '3 hours ago',
      source: 'The Block'
    },
    {
      id: 3,
      title: 'Regulatory Concerns in Asia Impact Market Sentiment',
      summary: 'New compliance requirements may affect trading volumes',
      impact: 'bearish',
      timestamp: '6 hours ago',
      source: 'CryptoNews'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* AI Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>AI Trading Signals</span>
          </CardTitle>
          <CardDescription>Real-time AI-powered trading recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiSignals.map((signal) => (
            <div key={signal.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
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
                  <Badge variant="outline">{signal.confidence}% confidence</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{signal.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{signal.reason}</p>
              <Button size="sm" variant="outline" className="w-full">
                View Analysis
              </Button>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              🧠 AI Agent will be integrated with Brain platform for enhanced signals
            </p>
            <Button variant="outline" size="sm" disabled>
              Configure AI Agent (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market News */}
      <Card>
        <CardHeader>
          <CardTitle>Market News & Analysis</CardTitle>
          <CardDescription>Latest crypto news and market impact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {newsItems.map((news) => (
            <div key={news.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm leading-tight">{news.title}</h4>
                <Badge 
                  variant={news.impact === 'bullish' ? 'default' : 'destructive'}
                  className="ml-2 flex-shrink-0"
                >
                  {news.impact === 'bullish' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {news.impact}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{news.summary}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{news.source}</span>
                <span>{news.timestamp}</span>
              </div>
            </div>
          ))}
          
          <Button variant="outline" className="w-full">
            View All News
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsPanel;
