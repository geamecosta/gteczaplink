CREATE TABLE IF NOT EXISTS public.whatsapp_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  message TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.whatsapp_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_insert_anon" ON public.whatsapp_links;
CREATE POLICY "allow_insert_anon" ON public.whatsapp_links
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "allow_insert_auth" ON public.whatsapp_links;
CREATE POLICY "allow_insert_auth" ON public.whatsapp_links
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_select_auth" ON public.whatsapp_links;
CREATE POLICY "allow_select_auth" ON public.whatsapp_links
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "allow_delete_auth" ON public.whatsapp_links;
CREATE POLICY "allow_delete_auth" ON public.whatsapp_links
  FOR DELETE TO authenticated USING (user_id = auth.uid());
