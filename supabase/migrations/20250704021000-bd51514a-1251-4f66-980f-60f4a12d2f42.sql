
-- Extend the chats table to support agent assignments and enhanced functionality
ALTER TABLE public.chats 
ADD COLUMN category TEXT DEFAULT 'general',
ADD COLUMN assigned_agent_id UUID REFERENCES auth.users(id),
ADD COLUMN agent_response_time INTERVAL,
ADD COLUMN session_id TEXT,
ADD COLUMN is_resolved BOOLEAN DEFAULT FALSE,
ADD COLUMN priority INTEGER DEFAULT 1;

-- Create agents table for managing live agents
CREATE TABLE public.chat_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  categories TEXT[] DEFAULT '{}',
  is_online BOOLEAN DEFAULT FALSE,
  max_concurrent_chats INTEGER DEFAULT 5,
  current_chat_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for chat_agents
ALTER TABLE public.chat_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chat agents"
  ON public.chat_agents
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can view their own data"
  ON public.chat_agents
  FOR SELECT
  USING (user_id = auth.uid());

-- Update chats table RLS to allow visitors to create chats
CREATE POLICY "Anyone can create chats"
  ON public.chats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view chats they created"
  ON public.chats
  FOR SELECT
  USING (visitor_email = auth.email() OR assigned_agent_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
