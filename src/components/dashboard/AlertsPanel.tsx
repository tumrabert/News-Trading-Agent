
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, TrendingUp, TrendingDown, AlertTriangle, Zap, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: number;
  type: 'price' | 'volume' | 'news' | 'technical';
  coin: string;
  condition: string;
  value: number;
  isActive: boolean;
  triggered: boolean;
  createdAt: string;
  lastTriggered?: string;
}

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: 'price',
      coin: 'BTC',
      condition: 'above',
      value: 45000,
      isActive: true,
      triggered: false,
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      type: 'price',
      coin: 'ETH',
      condition: 'below',
      value: 2300,
      isActive: true,
      triggered: true,
      createdAt: '2024-01-14',
      lastTriggered: '2024-01-16 14:30'
    },
    {
      id: 3,
      type: 'volume',
      coin: 'SOL',
      condition: 'above',
      value: 50000000,
      isActive: false,
      triggered: false,
      createdAt: '2024-01-13',
    }
  ]);

  const [newAlert, setNewAlert] = useState({
    type: 'price',
    coin: 'BTC',
    condition: 'above',
    value: ''
  });

  const { toast } = useToast();

  const addAlert = () => {
    if (!newAlert.value) return;

    const alert: Alert = {
      id: Date.now(),
      type: newAlert.type as Alert['type'],
      coin: newAlert.coin,
      condition: newAlert.condition,
      value: parseFloat(newAlert.value),
      isActive: true,
      triggered: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAlerts([...alerts, alert]);
    setNewAlert({ type: 'price', coin: 'BTC', condition: 'above', value: '' });
    
    toast({
      title: "Alert Created",
      description: `${alert.coin} ${alert.condition} $${alert.value} alert is now active`,
    });
  };

  const toggleAlert = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast({
      title: "Alert Deleted",
      description: "Alert has been removed successfully",
    });
  };

  const recentNotifications = [
    { id: 1, type: 'price', message: 'BTC reached $42,500', time: '5 min ago', severity: 'info' },
    { id: 2, type: 'news', message: 'Breaking: Major exchange lists new altcoin', time: '15 min ago', severity: 'info' },
    { id: 3, type: 'technical', message: 'ETH RSI entered oversold territory', time: '1 hour ago', severity: 'warning' },
    { id: 4, type: 'ai', message: 'AI detected unusual volume spike in SOL', time: '2 hours ago', severity: 'alert' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Price Alerts</span>
            <Badge variant="secondary">{alerts.filter(a => a.isActive).length} active</Badge>
          </CardTitle>
          <CardDescription>Manage your price and volume alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {alert.isActive ? (
                    <Bell className="w-4 h-4 text-green-600" />
                  ) : (
                    <BellOff className="w-4 h-4 text-gray-400" />
                  )}
                  <Badge variant={alert.triggered ? 'destructive' : 'default'}>
                    {alert.coin}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {alert.type} {alert.condition} ${alert.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {alert.createdAt}
                    {alert.lastTriggered && ` • Last triggered: ${alert.lastTriggered}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={alert.isActive}
                  onCheckedChange={() => toggleAlert(alert.id)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteAlert(alert.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add New Alert */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Create New Alert</h4>
            <div className="grid grid-cols-2 gap-2">
              <Select value={newAlert.coin} onValueChange={(value) => setNewAlert({...newAlert, coin: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="SOL">Solana (SOL)</SelectItem>
                  <SelectItem value="MATIC">Polygon (MATIC)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newAlert.type} onValueChange={(value) => setNewAlert({...newAlert, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={newAlert.condition} onValueChange={(value) => setNewAlert({...newAlert, condition: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Above</SelectItem>
                  <SelectItem value="below">Below</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Value"
                value={newAlert.value}
                onChange={(e) => setNewAlert({...newAlert, value: e.target.value})}
              />
            </div>
            <Button onClick={addAlert} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Recent Notifications</span>
          </CardTitle>
          <CardDescription>Latest alerts and market updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentNotifications.map((notification) => (
            <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg border">
              <div className="mt-1">
                {notification.type === 'price' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                {notification.type === 'news' && <Bell className="w-4 h-4 text-green-600" />}
                {notification.type === 'technical' && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                {notification.type === 'ai' && <Zap className="w-4 h-4 text-purple-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
              <Badge 
                variant={
                  notification.severity === 'alert' ? 'destructive' : 
                  notification.severity === 'warning' ? 'default' : 'secondary'
                }
                className="text-xs"
              >
                {notification.severity}
              </Badge>
            </div>
          ))}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Notification Settings</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="price-alerts">Price Alerts</Label>
                <Switch id="price-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="news-alerts">News Alerts</Label>
                <Switch id="news-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-signals">AI Signals</Label>
                <Switch id="ai-signals" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="portfolio-updates">Portfolio Updates</Label>
                <Switch id="portfolio-updates" defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPanel;
