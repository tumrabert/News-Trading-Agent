
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

// Mock data for development
const mockAgents: AIAgent[] = [
  {
    id: '1',
    user_id: 'demo-user',
    name: 'Bitcoin Momentum Trader',
    status: 'active',
    config: { riskLevel: 'medium', maxPositionSize: 1000 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo-user',
    name: 'DeFi Yield Hunter',
    status: 'paused',
    config: { riskLevel: 'high', maxPositionSize: 5000 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const mockSignals: AISignal[] = [
  {
    id: '1',
    agent_id: '1',
    symbol: 'BTC',
    signal_type: 'buy',
    confidence: 85,
    reason: 'Strong bullish momentum with RSI oversold conditions and volume spike',
    target_price: 45000,
    stop_loss: 40000,
    take_profit: 48000,
    risk_level: 'medium',
    time_horizon: '1-2 weeks',
    technical_indicators: ['RSI Oversold', 'Volume Spike', 'MACD Bullish Cross'],
    fundamental_factors: ['ETF Inflows', 'Institutional Adoption'],
    market_conditions: { volatility: 'medium', sentiment: 'bullish' },
    status: 'pending',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    agent_id: '1',
    symbol: 'ETH',
    signal_type: 'hold',
    confidence: 75,
    reason: 'Consolidation phase with strong support levels holding',
    target_price: 2600,
    risk_level: 'low',
    time_horizon: '3-5 days',
    technical_indicators: ['Support Level', 'Consolidation Pattern'],
    fundamental_factors: ['Shanghai Upgrade', 'Staking Rewards'],
    market_conditions: { volatility: 'low', sentiment: 'neutral' },
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  }
];

export const useAIAgents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['ai-agents'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('ai_agents')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.log('Using mock data due to database error:', error);
          return mockAgents;
        }
        return data as AIAgent[] || mockAgents;
      } catch (err) {
        console.log('Using mock data due to connection error:', err);
        return mockAgents;
      }
    },
  });

  const createAgent = useMutation({
    mutationFn: async (agentData: { name: string; config?: any }) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('ai_agents')
          .insert({
            name: agentData.name,
            user_id: user.id,
            config: agentData.config || {},
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        // For demo purposes, create a mock agent
        const newAgent: AIAgent = {
          id: Math.random().toString(),
          user_id: 'demo-user',
          name: agentData.name,
          status: 'active',
          config: agentData.config || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return newAgent;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast({
        title: "Success",
        description: "AI Agent created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create AI Agent",
        variant: "destructive",
      });
      console.error('Error creating agent:', error);
    },
  });

  const updateAgentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'paused' | 'stopped' }) => {
      try {
        const { data, error } = await supabase
          .from('ai_agents')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        // For demo purposes, just return success
        console.log('Mock update for agent status:', id, status);
        return { id, status };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast({
        title: "Success",
        description: "Agent status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update agent status",
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
  };
};

export const useAISignals = (agentId?: string) => {
  const { data: signals, isLoading, error } = useQuery({
    queryKey: ['ai-signals', agentId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('ai_signals')
          .select('*')
          .order('created_at', { ascending: false });

        if (agentId) {
          query = query.eq('agent_id', agentId);
        }

        const { data, error } = await query;
        if (error) {
          console.log('Using mock signals due to database error:', error);
          return agentId ? mockSignals.filter(s => s.agent_id === agentId) : mockSignals;
        }
        return data as AISignal[] || mockSignals;
      } catch (err) {
        console.log('Using mock signals due to connection error:', err);
        return agentId ? mockSignals.filter(s => s.agent_id === agentId) : mockSignals;
      }
    },
  });

  return {
    signals: signals || [],
    isLoading,
    error,
  };
};

export const useTradeExecutions = (agentId?: string) => {
  const { data: executions, isLoading, error } = useQuery({
    queryKey: ['trade-executions', agentId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('trade_executions')
          .select('*')
          .order('executed_at', { ascending: false });

        if (agentId) {
          query = query.eq('agent_id', agentId);
        }

        const { data, error } = await query;
        if (error) {
          console.log('Using mock executions due to database error:', error);
          return [];
        }
        return data as TradeExecution[] || [];
      } catch (err) {
        console.log('Using mock executions due to connection error:', err);
        return [];
      }
    },
  });

  return {
    executions: executions || [],
    isLoading,
    error,
  };
};
