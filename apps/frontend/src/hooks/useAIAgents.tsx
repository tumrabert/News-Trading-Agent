
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { httpClient, wsClient, WebSocketEventType, getApiConfig } from '@workspace/api-client';

export interface AIAgent {
  id: string;
  user_id: string;
  name: string;
  status: 'active' | 'paused' | 'stopped';
  config: any;
  created_at: string;
  updated_at: string;
}

export interface AISignal {
  id: string;
  agent_id: string;
  symbol: string;
  signal_type: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  target_price?: number;
  stop_loss?: number;
  take_profit?: number;
  risk_level: 'low' | 'medium' | 'high';
  time_horizon: string;
  technical_indicators: string[];
  fundamental_factors: string[];
  market_conditions: any;
  status: 'pending' | 'executed' | 'cancelled' | 'expired';
  created_at: string;
  expires_at?: string;
}

export interface TradeExecution {
  id: string;
  agent_id: string;
  signal_id?: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  total_value: number;
  fees: number;
  status: 'pending' | 'filled' | 'cancelled' | 'failed';
  execution_type: 'market' | 'limit' | 'stop';
  metadata: any;
  executed_at: string;
}

// API client is configured in App.tsx

export const useAIAgents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected: isWeb3AuthConnected } = useWeb3Auth();
  const [isConnected, setIsConnected] = useState(false);

  // Connect to WebSocket (temporarily disabled auth requirement for testing)
  useEffect(() => {
    // Temporarily comment out auth requirement for testing
    // if (!isWeb3AuthConnected) {
    //   // Disconnect if user logs out
    //   if (wsClient.isConnected()) {
    //     wsClient.disconnect();
    //     setIsConnected(false);
    //   }
    //   return;
    // }

    const connectWebSocket = async () => {
      try {
        if (!wsClient.isConnected()) {
          console.log('Connecting to AI Agent WebSocket...');
          await wsClient.connect();
          setIsConnected(true);
          console.log('AI Agent WebSocket connected successfully');
          
          // Subscribe to agent status updates
          wsClient.subscribe(WebSocketEventType.AGENT_STATUS, (message) => {
            queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
            
            // Show toast notification for status changes
            if (message.data.action === 'status_changed') {
              toast({
                title: "Agent Status Updated",
                description: `${message.data.agent.name} is now ${message.data.agent.status}`,
              });
            }
          });
        }
      } catch (error) {
        console.error('Failed to connect to AI Agent WebSocket:', error);
        setIsConnected(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to AI Agent server",
          variant: "destructive",
        });
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsClient.isConnected()) {
        wsClient.disconnect();
        setIsConnected(false);
      }
    };
  }, [isWeb3AuthConnected, queryClient, toast]);

  // Fetch agents from API only when authenticated
  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['ai-agents'],
    queryFn: async () => {
      try {
        console.log('Fetching AI agents...');
        const response = await httpClient.getAgents();
        
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to fetch agents');
        }
        
        console.log('AI agents fetched successfully:', response.data);
        return response.data;
      } catch (err) {
        console.error('Error fetching agents:', err);
        throw err;
      }
    },
    enabled: true, // Temporarily disable auth requirement for testing
  });

  // Create a new agent
  const createAgent = useMutation({
    mutationFn: async (agentData: { name: string; config?: any }) => {
      const response = await httpClient.createAgent({
        name: agentData.name,
        config: agentData.config || {}
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create agent');
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast({
        title: "Success",
        description: "AI Agent created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create AI Agent",
        variant: "destructive",
      });
      console.error('Error creating agent:', error);
    },
  });

  // Update agent status
  const updateAgentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'paused' | 'stopped' }) => {
      const response = await httpClient.updateAgentStatus(id, status);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update agent status');
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast({
        title: "Success",
        description: "Agent status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update agent status",
        variant: "destructive",
      });
      console.error('Error updating agent:', error);
    },
  });

  return {
    agents: agents || [],
    isLoading,
    error,
    createAgent: createAgent.mutate,
    updateAgentStatus: updateAgentStatus.mutate,
    isCreating: createAgent.isPending,
    isUpdating: updateAgentStatus.isPending,
    isConnected,
  };
};

export const useAISignals = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { isConnected: isWeb3AuthConnected } = useWeb3Auth();

  // Subscribe to signal updates via WebSocket
  useEffect(() => {
    if (!wsClient.isConnected()) return; // Temporarily removed auth requirement

    // Subscribe to signal updates
    wsClient.subscribe(WebSocketEventType.AGENT_SIGNAL, (message) => {
      console.log('Received signal via WebSocket:', message);
      
      // If agentId is specified, only update for that agent
      if (agentId && message.data.signal.agentId !== agentId) {
        return;
      }
      
      // Invalidate queries to refetch signals
      queryClient.invalidateQueries({ queryKey: ['ai-signals', agentId] });
    });

    // For signals panel (no specific agentId), subscribe to the main agent
    // Get the first available agent and subscribe to its room
    if (!agentId && wsClient.isConnected()) {
      // Subscribe to the default agent room (we'll get the agent ID from the API)
      const subscribeToDefaultAgent = async () => {
        try {
          const response = await httpClient.getAgents();
          if (response.success && response.data.length > 0) {
            const defaultAgentId = response.data[0].id;
            console.log('Subscribing to default agent:', defaultAgentId);
            
            // Subscribe to the agent room to receive real-time updates
            wsClient.subscribeToAgent(defaultAgentId);
          }
        } catch (error) {
          console.error('Error subscribing to default agent:', error);
        }
      };
      
      subscribeToDefaultAgent();
    }

    return () => {
      // No need to unsubscribe as we're using a singleton WebSocket client
    };
  }, [agentId, queryClient, isWeb3AuthConnected]);

  // Fetch signals from API
  const { data: signals, isLoading, error } = useQuery({
    queryKey: ['ai-signals', agentId],
    queryFn: async () => {
      try {
        console.log('Fetching signals with agentId:', agentId);
        console.log('API config:', httpClient);
        console.log('Current API config from client:', JSON.stringify(getApiConfig()));
        
        const response = agentId 
          ? await httpClient.getSignals({ agentId })
          : await httpClient.getSignals();
        
        console.log('Raw API response:', response);
        
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to fetch signals');
        }
        
        return response.data;
      } catch (err) {
        console.error('Error fetching signals:', err);
        throw new Error('Network Error');
      }
    },
    enabled: true, // Temporarily disable auth requirement for testing
  });

  return {
    signals: signals || [],
    isLoading,
    error,
  };
};

export const useTradeExecutions = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { isConnected: isWeb3AuthConnected } = useWeb3Auth();

  // Subscribe to execution updates via WebSocket
  useEffect(() => {
    if (!wsClient.isConnected() || !agentId) return; // Temporarily removed auth requirement

    // Subscribe to execution updates for this agent
    wsClient.subscribe(WebSocketEventType.AGENT_EXECUTION, (message) => {
      if (message.data.execution.agentId === agentId) {
        queryClient.invalidateQueries({ queryKey: ['trade-executions', agentId] });
      }
    });

    return () => {
      // No need to unsubscribe as we're using a singleton WebSocket client
    };
  }, [agentId, queryClient, isWeb3AuthConnected]);

  // Fetch executions from API
  const { data: executions, isLoading, error } = useQuery({
    queryKey: ['trade-executions', agentId],
    queryFn: async () => {
      try {
        const response = agentId 
          ? await httpClient.getExecutions({ agentId })
          : await httpClient.getExecutions();
        
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to fetch executions');
        }
        
        return response.data;
      } catch (err) {
        console.error('Error fetching executions:', err);
        throw err;
      }
    },
    enabled: true, // Temporarily disable auth requirement for testing
  });

  return {
    executions: executions || [],
    isLoading,
    error,
  };
};
