
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3, Target, Eye } from "lucide-react";

const MarketAnalysis = () => {
  // Mock market sentiment data
  const sentimentData = [
    { date: '2024-01-01', fear: 25, greed: 75, neutral: 0 },
    { date: '2024-01-02', fear: 30, greed: 65, neutral: 5 },
    { date: '2024-01-03', fear: 20, greed: 70, neutral: 10 },
    { date: '2024-01-04', fear: 35, greed: 55, neutral: 10 },
    { date: '2024-01-05', fear: 15, greed: 80, neutral: 5 },
  ];

  // Mock correlation data
  const correlationData = [
    { pair: 'BTC-ETH', correlation: 0.85, strength: 'Strong' },
    { pair: 'BTC-SOL', correlation: 0.72, strength: 'Moderate' },
    { pair: 'ETH-SOL', correlation: 0.78, strength: 'Strong' },
    { pair: 'BTC-MATIC', correlation: 0.65, strength: 'Moderate' },
  ];

  // Mock market indicators
  const marketIndicators = [
    { name: 'Fear & Greed Index', value: 75, status: 'Extreme Greed', color: 'text-red-600' },
    { name: 'Market Cap Dominance', value: 52.3, status: 'BTC Dominance', color: 'text-blue-600' },
    { name: 'Volatility Index', value: 68, status: 'High Volatility', color: 'text-orange-600' },
    { name: 'Social Sentiment', value: 82, status: 'Very Bullish', color: 'text-green-600' },
  ];

  // Mock sector performance
  const sectorPerformance = [
    { sector: 'Layer 1', performance: 15.2, volume: 2.5e9, change: 'up' },
    { sector: 'DeFi', performance: -3.1, volume: 1.2e9, change: 'down' },
    { sector: 'NFT', performance: 8.7, volume: 0.8e9, change: 'up' },
    { sector: 'Gaming', performance: 12.4, volume: 0.6e9, change: 'up' },
    { sector: 'Metaverse', performance: -1.8, volume: 0.4e9, change: 'down' },
  ];

  // Mock technical levels
  const technicalLevels = [
    { coin: 'BTC', support: [40000, 38500, 37000], resistance: [44000, 46500, 49000], current: 42000 },
    { coin: 'ETH', support: [2300, 2200, 2100], resistance: [2600, 2750, 2900], current: 2450 },
    { coin: 'SOL', support: [90, 85, 80], resistance: [110, 120, 135], current: 98 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Market Sentiment */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Market Sentiment Analysis</span>
          </CardTitle>
          <CardDescription>Track market emotions and sentiment over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {marketIndicators.map((indicator, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{indicator.name}</p>
                  <Target className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className={`text-2xl font-bold ${indicator.color}`}>
                  {indicator.value}
                  {indicator.name.includes('Index') || indicator.name.includes('Dominance') ? '' : '%'}
                </p>
                <p className="text-xs text-muted-foreground">{indicator.status}</p>
              </div>
            ))}
          </div>
          
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="greed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6b7280" fill="#6b7280" fillOpacity={0.6} />
                <Area type="monotone" dataKey="fear" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sector Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Sector Performance</span>
          </CardTitle>
          <CardDescription>24h performance by crypto sectors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sectorPerformance.map((sector, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {sector.change === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium">{sector.sector}</span>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${sector.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {sector.performance >= 0 ? '+' : ''}{sector.performance}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Vol: ${(sector.volume / 1e9).toFixed(1)}B
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Correlation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Asset Correlations</span>
          </CardTitle>
          <CardDescription>How assets move together</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {correlationData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.pair}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={item.strength === 'Strong' ? 'default' : 'secondary'}>
                    {item.strength}
                  </Badge>
                  <span className="text-sm font-bold">
                    {(item.correlation * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <Progress value={item.correlation * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Technical Levels */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Key Technical Levels</span>
          </CardTitle>
          <CardDescription>Support and resistance levels for major assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {technicalLevels.map((asset, index) => (
              <div key={index} className="space-y-4">
                <div className="text-center">
                  <h4 className="font-bold text-lg">{asset.coin}</h4>
                  <p className="text-2xl font-bold">${asset.current.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Current Price</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-red-600 mb-2">Resistance Levels</h5>
                    {asset.resistance.map((level, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1">
                        <span className="text-xs">R{idx + 1}</span>
                        <span className="text-sm font-medium">${level.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-2">
                    <h5 className="text-sm font-medium text-green-600 mb-2">Support Levels</h5>
                    {asset.support.map((level, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1">
                        <span className="text-xs">S{idx + 1}</span>
                        <span className="text-sm font-medium">${level.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketAnalysis;
