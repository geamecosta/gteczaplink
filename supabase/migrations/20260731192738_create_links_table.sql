CREATE TABLE IF NOT EXISTS public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_url TEXT NOT NULL,
  short_slug TEXT NOT NULL UNIQUE,
  title TEXT,
  tags TEXT[] DEFAULT '{}',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  expires_at TIMESTAMPTZ,
  qr_code_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_short_slug ON public.links(short_slug);

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_select_own_links" ON public.links;
CREATE POLICY "allow_select_own_links" ON public.links
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "allow_insert_own_links" ON public.links;
CREATE POLICY "allow_insert_own_links" ON public.links
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "allow_update_own_links" ON public.links;
CREATE POLICY "allow_update_own_links" ON public.links
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "allow_delete_own_links" ON public.links;
CREATE POLICY "allow_delete_own_links" ON public.links
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
