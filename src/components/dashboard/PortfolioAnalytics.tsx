
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, Target, Activity } from "lucide-react";
import { usePortfolioData } from "@/hooks/useMarketData";

const PortfolioAnalytics = () => {
  const { data: portfolioData } = usePortfolioData();

  // Mock performance data
  const performanceData = [
    { date: '2024-01-01', value: 35000, benchmark: 34000 },
    { date: '2024-01-15', value: 38000, benchmark: 36000 },
    { date: '2024-02-01', value: 42000, benchmark: 39000 },
    { date: '2024-02-15', value: 45000, benchmark: 41000 },
    { date: '2024-03-01', value: 43000, benchmark: 40000 },
    { date: '2024-03-15', value: 47000, benchmark: 43000 },
  ];

  const riskMetrics = [
    { metric: 'Sharpe Ratio', value: 1.85, status: 'good' },
    { metric: 'Max Drawdown', value: -12.3, status: 'warning' },
    { metric: 'Volatility', value: 28.5, status: 'normal' },
    { metric: 'Beta', value: 1.2, status: 'normal' }
  ];

  const sectorAllocation = [
    { name: 'Layer 1', value: 65, color: '#8884d8' },
    { name: 'DeFi', value: 20, color: '#82ca9d' },
    { name: 'Layer 2', value: 10, color: '#ffc658' },
    { name: 'Other', value: 5, color: '#ff7300' }
  ];

  if (!portfolioData) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Portfolio Performance</span>
          </CardTitle>
          <CardDescription>Track your portfolio vs benchmark over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Portfolio"
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Benchmark"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Risk Metrics</span>
          </CardTitle>
          <CardDescription>Key risk indicators for your portfolio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {riskMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">{metric.metric}</p>
                <Badge 
                  variant={metric.status === 'good' ? 'default' : metric.status === 'warning' ? 'destructive' : 'secondary'}
                  className="text-xs mt-1"
                >
                  {metric.status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  {metric.value > 0 ? '+' : ''}{metric.value}
                  {metric.metric.includes('Ratio') || metric.metric.includes('Beta') ? '' : '%'}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sector Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Percent className="w-5 h-5" />
            <span>Sector Allocation</span>
          </CardTitle>
          <CardDescription>Distribution across crypto sectors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sectorAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {sectorAllocation.map((sector, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: sector.color }}
                  />
                  <span className="text-sm">{sector.name}</span>
                </div>
                <span className="text-sm font-medium">{sector.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* P&L Analysis */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Profit & Loss Analysis</span>
          </CardTitle>
          <CardDescription>Detailed breakdown of your gains and losses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                +${portfolioData.totalChange.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                +{portfolioData.totalChangePercent.toFixed(2)}%
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Daily P&L</p>
                <Activity className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">
                +${portfolioData.dailyPnL.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Best Performer</p>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-lg font-bold">
                {portfolioData.holdings.reduce((best, current) => 
                  current.change > best.change ? current : best
                ).symbol}
              </p>
              <p className="text-xs text-green-600">
                +{portfolioData.holdings.reduce((best, current) => 
                  current.change > best.change ? current : best
                ).change.toFixed(2)}%
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Worst Performer</p>
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-lg font-bold">
                {portfolioData.holdings.reduce((worst, current) => 
                  current.change < worst.change ? current : worst
                ).symbol}
              </p>
              <p className="text-xs text-red-600">
                {portfolioData.holdings.reduce((worst, current) => 
                  current.change < worst.change ? current : worst
                ).change.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portfolioData.holdings}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="symbol" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="unrealizedPnL" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioAnalytics;
