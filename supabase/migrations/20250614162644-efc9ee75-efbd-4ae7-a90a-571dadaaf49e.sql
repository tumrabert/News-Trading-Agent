
-- Create tables for the AI trading agent system

-- AI Agent configuration and state
CREATE TABLE public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI-generated trading signals
CREATE TABLE public.ai_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold')),
  confidence DECIMAL(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  reason TEXT NOT NULL,
  target_price DECIMAL(20,8),
  stop_loss DECIMAL(20,8),
  take_profit DECIMAL(20,8),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  time_horizon TEXT NOT NULL,
  technical_indicators JSONB DEFAULT '[]',
  fundamental_factors JSONB DEFAULT '[]',
  market_conditions JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- News and market data monitoring
CREATE TABLE public.market_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  source TEXT NOT NULL,
  url TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  impact_score DECIMAL(3,2) CHECK (impact_score >= 0 AND impact_score <= 1),
  symbols_mentioned TEXT[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trading execution logs
CREATE TABLE public.trade_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  signal_id UUID REFERENCES public.ai_signals(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  amount DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  total_value DECIMAL(20,8) NOT NULL,
  fees DECIMAL(20,8) DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'filled', 'cancelled', 'failed')),
  execution_type TEXT NOT NULL CHECK (execution_type IN ('market', 'limit', 'stop')),
  metadata JSONB DEFAULT '{}',
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk management logs
CREATE TABLE public.risk_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('stop_loss', 'position_limit', 'drawdown_limit', 'exposure_limit')),
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action_taken TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance tracking
CREATE TABLE public.agent_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  total_trades INTEGER NOT NULL DEFAULT 0,
  winning_trades INTEGER NOT NULL DEFAULT 0,
  total_pnl DECIMAL(20,8) NOT NULL DEFAULT 0,
  max_drawdown DECIMAL(20,8) NOT NULL DEFAULT 0,
  sharpe_ratio DECIMAL(10,4),
  success_rate DECIMAL(5,2),
  avg_trade_duration INTERVAL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_agents
CREATE POLICY "Users can view their own agents" ON public.ai_agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own agents" ON public.ai_agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own agents" ON public.ai_agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own agents" ON public.ai_agents FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_signals (based on agent ownership)
CREATE POLICY "Users can view signals from their agents" ON public.ai_signals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = ai_signals.agent_id AND ai_agents.user_id = auth.uid())
);
CREATE POLICY "System can create signals" ON public.ai_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update signals from their agents" ON public.ai_signals FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = ai_signals.agent_id AND ai_agents.user_id = auth.uid())
);

-- RLS Policies for market_news (public read access)
CREATE POLICY "Everyone can read market news" ON public.market_news FOR SELECT USING (true);
CREATE POLICY "System can create market news" ON public.market_news FOR INSERT WITH CHECK (true);

-- RLS Policies for trade_executions
CREATE POLICY "Users can view executions from their agents" ON public.trade_executions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = trade_executions.agent_id AND ai_agents.user_id = auth.uid())
);
CREATE POLICY "System can create executions" ON public.trade_executions FOR INSERT WITH CHECK (true);

-- RLS Policies for risk_events
CREATE POLICY "Users can view risk events from their agents" ON public.risk_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = risk_events.agent_id AND ai_agents.user_id = auth.uid())
);
CREATE POLICY "System can create risk events" ON public.risk_events FOR INSERT WITH CHECK (true);

-- RLS Policies for agent_performance
CREATE POLICY "Users can view performance from their agents" ON public.agent_performance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_agents WHERE ai_agents.id = agent_performance.agent_id AND ai_agents.user_id = auth.uid())
);
CREATE POLICY "System can create performance records" ON public.agent_performance FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_ai_signals_agent_id ON public.ai_signals(agent_id);
CREATE INDEX idx_ai_signals_symbol ON public.ai_signals(symbol);
CREATE INDEX idx_ai_signals_created_at ON public.ai_signals(created_at);
CREATE INDEX idx_market_news_published_at ON public.market_news(published_at);
CREATE INDEX idx_market_news_symbols ON public.market_news USING GIN(symbols_mentioned);
CREATE INDEX idx_trade_executions_agent_id ON public.trade_executions(agent_id);
CREATE INDEX idx_trade_executions_executed_at ON public.trade_executions(executed_at);
CREATE INDEX idx_risk_events_agent_id ON public.risk_events(agent_id);
CREATE INDEX idx_agent_performance_agent_id ON public.agent_performance(agent_id);
