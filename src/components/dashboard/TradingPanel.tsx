
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const TradingPanel = () => {
  const [orderType, setOrderType] = useState('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const { toast } = useToast();

  const handleTrade = (side: 'buy' | 'sell') => {
    toast({
      title: `${side.charAt(0).toUpperCase() + side.slice(1)} Order Placed`,
      description: `${side === 'buy' ? 'Buying' : 'Selling'} ${amount} BTC`,
    });
  };

  const openOrders = [
    { id: '1', side: 'buy', amount: '0.5 BTC', price: '$41,500', status: 'pending' },
    { id: '2', side: 'sell', amount: '0.3 ETH', price: '$2,450', status: 'filled' },
    { id: '3', side: 'buy', amount: '100 SOL', price: '$98', status: 'pending' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Center</CardTitle>
        <CardDescription>Place orders and manage your trades</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="place-order" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="place-order">Place Order</TabsTrigger>
            <TabsTrigger value="open-orders">Open Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="place-order" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Select defaultValue="BTC">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="SOL">Solana (SOL)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handleTrade('buy')} 
                className="bg-green-600 hover:bg-green-700"
              >
                Buy
              </Button>
              <Button 
                onClick={() => handleTrade('sell')} 
                variant="destructive"
              >
                Sell
              </Button>
            </div>

            <div className="pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Available Balance:</span>
                <span>$15,420.50</span>
              </div>
              <div className="flex justify-between">
                <span>Trading Fee:</span>
                <span>0.1%</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="open-orders">
            <div className="space-y-3">
              {openOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Badge variant={order.side === 'buy' ? 'default' : 'destructive'}>
                      {order.side.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">{order.amount}</p>
                      <p className="text-sm text-muted-foreground">at {order.price}</p>
                    </div>
                  </div>
                  <Badge variant={order.status === 'filled' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TradingPanel;
