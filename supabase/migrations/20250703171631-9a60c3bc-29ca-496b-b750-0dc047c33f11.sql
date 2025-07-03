-- Create subscribers table to track subscription information
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

-- Create policy for edge functions to update subscription info
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

-- Create policy for edge functions to insert subscription info
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add platform admin support to contractors table
ALTER TABLE public.contractors ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT false;

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('job-media', 'job-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('contractor-logos', 'contractor-logos', true);

-- Create storage policies for job media
CREATE POLICY "Job media publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'job-media');

CREATE POLICY "Contractors can upload job media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'job-media' AND auth.role() = 'authenticated');

CREATE POLICY "Contractors can update their job media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'job-media' AND auth.role() = 'authenticated');

-- Create storage policies for contractor logos
CREATE POLICY "Contractor logos publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'contractor-logos');

CREATE POLICY "Contractors can upload their logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'contractor-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Contractors can update their logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'contractor-logos' AND auth.role() = 'authenticated');