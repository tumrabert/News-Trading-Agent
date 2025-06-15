
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Settings, Brain, TrendingUp, Zap, Save } from 'lucide-react';

interface ConfigState {
  openaiApiKey: string;
  anthropicApiKey: string;
  riskTolerance: string;
  maxPositionSize: string;
  agentName: string;
  tradingMode: string;
  webhookUrl: string;
  alertEmail: string;
}

const Configuration = () => {
  const [config, setConfig] = useState<ConfigState>({
    openaiApiKey: '',
    anthropicApiKey: '',
    riskTolerance: '5',
    maxPositionSize: '10000',
    agentName: 'CryptoTrader AI',
    tradingMode: 'conservative',
    webhookUrl: '',
    alertEmail: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load configuration from localStorage on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('cryptotrader-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Failed to parse saved configuration:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof ConfigState, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('cryptotrader-config', JSON.stringify(config));
      
      toast({
        title: "Configuration Saved",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Configuration</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your AI trading agent settings and API keys
          </p>
        </div>

        <Tabs defaultValue="llm" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="llm" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              LLM APIs
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="agent" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Agent
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="llm" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>LLM API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={config.openaiApiKey}
                    onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    placeholder="sk-ant-..."
                    value={config.anthropicApiKey}
                    onChange={(e) => handleInputChange('anthropicApiKey', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="risk-tolerance">Risk Tolerance (1-10)</Label>
                  <Input
                    id="risk-tolerance"
                    type="number"
                    min="1"
                    max="10"
                    value={config.riskTolerance}
                    onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-position">Max Position Size ($)</Label>
                  <Input
                    id="max-position"
                    type="number"
                    value={config.maxPositionSize}
                    onChange={(e) => handleInputChange('maxPositionSize', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agent" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    value={config.agentName}
                    onChange={(e) => handleInputChange('agentName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trading-mode">Trading Mode</Label>
                  <Input
                    id="trading-mode"
                    value={config.tradingMode}
                    onChange={(e) => handleInputChange('tradingMode', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://..."
                    value={config.webhookUrl}
                    onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alert-email">Alert Email</Label>
                  <Input
                    id="alert-email"
                    type="email"
                    placeholder="alerts@example.com"
                    value={config.alertEmail}
                    onChange={(e) => handleInputChange('alertEmail', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
