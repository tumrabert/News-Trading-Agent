
-- Create a profiles table to store additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id)
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" 
      ON public.profiles 
      FOR UPDATE 
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile" 
      ON public.profiles 
      FOR INSERT 
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$$;

-- Create trigger to automatically create profile when user signs up (only if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add RLS to other tables that don't have it yet
DO $$ 
BEGIN
  -- Add RLS to ai_signals if not already enabled
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_signals' AND policyname = 'Users can view signals from their agents') THEN
    CREATE POLICY "Users can view signals from their agents" 
      ON public.ai_signals 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.ai_agents 
          WHERE ai_agents.id = ai_signals.agent_id 
          AND ai_agents.user_id = auth.uid()
        )
      );
  END IF;

  -- Add RLS to trade_executions if not already enabled
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trade_executions' AND policyname = 'Users can view executions from their agents') THEN
    CREATE POLICY "Users can view executions from their agents" 
      ON public.trade_executions 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.ai_agents 
          WHERE ai_agents.id = trade_executions.agent_id 
          AND ai_agents.user_id = auth.uid()
        )
      );
  END IF;

  -- Add RLS to agent_performance if not already enabled
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agent_performance' AND policyname = 'Users can view performance of their agents') THEN
    CREATE POLICY "Users can view performance of their agents" 
      ON public.agent_performance 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.ai_agents 
          WHERE ai_agents.id = agent_performance.agent_id 
          AND ai_agents.user_id = auth.uid()
        )
      );
  END IF;

  -- Add RLS to risk_events if not already enabled
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'risk_events' AND policyname = 'Users can view risk events from their agents') THEN
    CREATE POLICY "Users can view risk events from their agents" 
      ON public.risk_events 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.ai_agents 
          WHERE ai_agents.id = risk_events.agent_id 
          AND ai_agents.user_id = auth.uid()
        )
      );
  END IF;
END $$;
