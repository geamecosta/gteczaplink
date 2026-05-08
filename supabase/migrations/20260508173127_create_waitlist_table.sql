CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated inserts
DROP POLICY IF EXISTS "allow_insert_anon" ON public.waitlist;
CREATE POLICY "allow_insert_anon" ON public.waitlist
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "allow_insert_auth" ON public.waitlist;
CREATE POLICY "allow_insert_auth" ON public.waitlist
  FOR INSERT TO authenticated WITH CHECK (true);
