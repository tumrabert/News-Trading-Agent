import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Target, Zap, Clock, Calculator } from "lucide-react";

const AdvancedTradingPanel = () => {
  const [orderType, setOrderType] = useState('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [leverage, setLeverage] = useState([1]);
  const [timeInForce, setTimeInForce] = useState('GTC');
  const [postOnly, setPostOnly] = useState(false);
  const [reduceOnly, setReduceOnly] = useState(false);
  
  const { toast } = useToast();

  const handleTrade = (side: 'buy' | 'sell') => {
    toast({
      title: `Advanced ${side.charAt(0).toUpperCase() + side.slice(1)} Order Placed`,
      description: `${side === 'buy' ? 'Buying' : 'Selling'} ${amount} BTC with ${leverage[0]}x leverage`,
    });
  };

  const advancedOrders = [
    { 
      id: '1', 
      type: 'Stop-Loss', 
      side: 'sell', 
      amount: '0.5 BTC', 
      trigger: '$40,000', 
      status: 'active',
      pnl: -500 
    },
    { 
      id: '2', 
      type: 'Take-Profit', 
      side: 'sell', 
      amount: '0.3 BTC', 
      trigger: '$46,000', 
      status: 'active',
      pnl: 1200 
    },
    { 
      id: '3', 
      type: 'Trailing Stop', 
      side: 'sell', 
      amount: '0.2 BTC', 
      trigger: '$41,500', 
      status: 'triggered',
      pnl: 300 
    },
  ];

  const positionData = [
    { 
      symbol: 'BTC/USD', 
      side: 'long', 
      size: '1.5 BTC', 
      entryPrice: 41000, 
      markPrice: 42000, 
      pnl: 1500, 
      margin: 4100, 
      leverage: 10 
    },
    { 
      symbol: 'ETH/USD', 
      side: 'short', 
      size: '10 ETH', 
      entryPrice: 2500, 
      markPrice: 2450, 
      pnl: 500, 
      margin: 2500, 
      leverage: 5 
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Advanced Order Form */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Advanced Trading</span>
          </CardTitle>
          <CardDescription>Professional trading tools with leverage and advanced orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="spot" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="spot">Spot</TabsTrigger>
              <TabsTrigger value="margin">Margin</TabsTrigger>
              <TabsTrigger value="futures">Futures</TabsTrigger>
            </TabsList>

            <TabsContent value="spot" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trading Pair</Label>
                  <Select defaultValue="BTC/USD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                      <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                      <SelectItem value="SOL/USD">SOL/USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Order Type</Label>
                  <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                      <SelectItem value="stop-limit">Stop-Limit</SelectItem>
                      <SelectItem value="oco">OCO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {orderType !== 'market' && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      placeholder="42,000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Advanced Options */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">Advanced Options</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stop-loss">Stop Loss ($)</Label>
                    <Input
                      id="stop-loss"
                      placeholder="40,000"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="take-profit">Take Profit ($)</Label>
                    <Input
                      id="take-profit"
                      placeholder="45,000"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Time in Force</Label>
                  <Select value={timeInForce} onValueChange={setTimeInForce}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GTC">Good Till Canceled</SelectItem>
                      <SelectItem value="IOC">Immediate or Cancel</SelectItem>
                      <SelectItem value="FOK">Fill or Kill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="post-only"
                      checked={postOnly}
                      onCheckedChange={setPostOnly}
                    />
                    <Label htmlFor="post-only">Post Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reduce-only"
                      checked={reduceOnly}
                      onCheckedChange={setReduceOnly}
                    />
                    <Label htmlFor="reduce-only">Reduce Only</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handleTrade('buy')} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Buy
                </Button>
                <Button 
                  onClick={() => handleTrade('sell')} 
                  variant="destructive"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Sell
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="futures" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Leverage: {leverage[0]}x</Label>
                  <Slider
                    value={leverage}
                    onValueChange={setLeverage}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1x</span>
                    <span>25x</span>
                    <span>50x</span>
                    <span>100x</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  {orderType !== 'market' && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        placeholder="42,000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calculator className="w-4 h-4" />
                    <span className="font-medium">Position Calculator</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Position Size:</span>
                      <span>{amount ? `$${(parseFloat(amount) * 42000).toLocaleString()}` : '$0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Required Margin:</span>
                      <span>{amount ? `$${((parseFloat(amount) * 42000) / leverage[0]).toLocaleString()}` : '$0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Liquidation Price:</span>
                      <span>$38,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Funding Rate:</span>
                      <span className="text-green-600">-0.01%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Positions & Orders */}
      <div className="space-y-6">
        {/* Open Positions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Open Positions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {positionData.map((position, index) => (
              <div key={index} className="p-3 rounded-lg border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={position.side === 'long' ? 'default' : 'destructive'}>
                    {position.side.toUpperCase()} {position.symbol}
                  </Badge>
                  <Badge variant="outline">{position.leverage}x</Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{position.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entry:</span>
                    <span>${position.entryPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mark:</span>
                    <span>${position.markPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PnL:</span>
                    <span className={position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {position.pnl >= 0 ? '+' : ''}${position.pnl}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Close Position
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Advanced Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Advanced Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {advancedOrders.map((order) => (
              <div key={order.id} className="p-3 rounded-lg border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{order.type}</Badge>
                  <Badge variant={order.status === 'active' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>{order.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trigger:</span>
                    <span>{order.trigger}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. PnL:</span>
                    <span className={order.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {order.pnl >= 0 ? '+' : ''}${order.pnl}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedTradingPanel;
