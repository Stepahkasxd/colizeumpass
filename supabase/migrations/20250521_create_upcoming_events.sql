
-- Create the upcoming_events table
CREATE TABLE IF NOT EXISTS public.upcoming_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('bonus', 'reward', 'other')),
  event_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Set up RLS
ALTER TABLE public.upcoming_events ENABLE ROW LEVEL SECURITY;

-- Create policies for the upcoming_events table
-- Admin can do everything
CREATE POLICY "Admins can do everything with upcoming events"
  ON public.upcoming_events
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- All users can view upcoming events
CREATE POLICY "All users can view upcoming events"
  ON public.upcoming_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can view upcoming events too
CREATE POLICY "Anonymous users can view upcoming events"
  ON public.upcoming_events
  FOR SELECT
  TO anon
  USING (true);
