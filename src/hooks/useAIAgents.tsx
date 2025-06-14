
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

export const useAIAgents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['ai-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AIAgent[];
    },
  });

  const createAgent = useMutation({
    mutationFn: async (agentData: { name: string; config?: any }) => {
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
      const { data, error } = await supabase
        .from('ai_agents')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      let query = supabase
        .from('ai_signals')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AISignal[];
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
      let query = supabase
        .from('trade_executions')
        .select('*')
        .order('executed_at', { ascending: false });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TradeExecution[];
    },
  });

  return {
    executions: executions || [],
    isLoading,
    error,
  };
};
