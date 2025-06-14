
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Play, Pause, Square, Settings, TrendingUp, AlertTriangle } from "lucide-react";
import { useAIAgents, useAISignals, useTradeExecutions } from "@/hooks/useAIAgents";

const AIAgentManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const { 
    agents, 
    isLoading, 
    createAgent, 
    updateAgentStatus, 
    isCreating, 
    isUpdating 
  } = useAIAgents();

  const handleCreateAgent = () => {
    if (newAgentName.trim()) {
      createAgent({ 
        name: newAgentName.trim(),
        config: {
          riskLevel: 'medium',
          maxPositionSize: 1000,
          stopLossPercentage: 5,
          takeProfitPercentage: 10
        }
      });
      setNewAgentName('');
      setIsCreateDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'stopped': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      case 'stopped': return <Square className="w-3 h-3" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Trading Agents</CardTitle>
          <CardDescription>Loading agents...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>AI Trading Agents</span>
            </CardTitle>
            <CardDescription>
              Manage your automated trading agents powered by Brain framework
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New AI Trading Agent</DialogTitle>
                <DialogDescription>
                  Set up a new AI agent to automate your trading strategies.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="e.g., Bitcoin Momentum Trader"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateAgent}
                  disabled={!newAgentName.trim() || isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Agent'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {agents.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No AI Agents</h3>
            <p className="text-muted-foreground mb-4">
              Create your first AI trading agent to get started with automated trading.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Agent
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                onStatusChange={updateAgentStatus}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AgentCard = ({ 
  agent, 
  onStatusChange, 
  isUpdating 
}: { 
  agent: any; 
  onStatusChange: (params: { id: string; status: 'active' | 'paused' | 'stopped' }) => void;
  isUpdating: boolean;
}) => {
  const { signals } = useAISignals(agent.id);
  const { executions } = useTradeExecutions(agent.id);

  const activeSignals = signals.filter(s => s.status === 'pending');
  const recentExecutions = executions.slice(0, 5);

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-green-500' : agent.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <div>
            <h4 className="font-medium">{agent.name}</h4>
            <p className="text-sm text-muted-foreground">
              Created {new Date(agent.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
            {agent.status}
          </Badge>
          <Select
            value={agent.status}
            onValueChange={(status) => onStatusChange({ id: agent.id, status: status as any })}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Active Signals</p>
          <p className="font-medium">{activeSignals.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total Trades</p>
          <p className="font-medium">{executions.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Success Rate</p>
          <p className="font-medium">
            {executions.length > 0 
              ? `${Math.round((executions.filter(e => e.status === 'filled').length / executions.length) * 100)}%`
              : 'N/A'
            }
          </p>
        </div>
      </div>

      {activeSignals.length > 0 && (
        <div>
          <h5 className="font-medium mb-2">Recent Signals</h5>
          <div className="space-y-2">
            {activeSignals.slice(0, 3).map((signal) => (
              <div key={signal.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Badge variant={signal.signal_type === 'buy' ? 'default' : signal.signal_type === 'sell' ? 'destructive' : 'secondary'}>
                    {signal.signal_type.toUpperCase()}
                  </Badge>
                  <span>{signal.symbol}</span>
                </div>
                <div className="text-muted-foreground">
                  {signal.confidence}% confidence
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentManager;
