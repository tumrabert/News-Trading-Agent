
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const PriceChart = () => {
  // Mock data for Bitcoin price
  const priceData = [
    { time: '00:00', price: 41500 },
    { time: '04:00', price: 41800 },
    { time: '08:00', price: 42200 },
    { time: '12:00', price: 42000 },
    { time: '16:00', price: 42500 },
    { time: '20:00', price: 42800 },
    { time: '24:00', price: 42000 }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>BTC/USD</span>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>+3.2%</span>
              </Badge>
            </CardTitle>
            <CardDescription>Bitcoin to US Dollar</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">$42,000</p>
            <p className="text-sm text-green-600">+$1,320 (3.2%)</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                domain={['dataMin - 200', 'dataMax + 200']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
