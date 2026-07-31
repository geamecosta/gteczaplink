ALTER TABLE public.links ADD COLUMN IF NOT EXISTS click_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  short_slug TEXT,
  referrer TEXT,
  user_agent TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON public.link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON public.link_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_link_clicks_short_slug ON public.link_clicks(short_slug);

ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_insert_clicks_anon" ON public.link_clicks;
CREATE POLICY "allow_insert_clicks_anon" ON public.link_clicks
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_select_clicks_auth" ON public.link_clicks;
CREATE POLICY "allow_select_clicks_auth" ON public.link_clicks
  FOR SELECT TO authenticated USING (
    link_id IN (SELECT id FROM public.links WHERE user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.increment_link_click(p_slug TEXT)
RETURNS void AS $$
DECLARE
  v_link_id uuid;
BEGIN
  SELECT id INTO v_link_id FROM public.links WHERE short_slug = p_slug;
  IF v_link_id IS NOT NULL THEN
    UPDATE public.links SET click_count = click_count + 1 WHERE id = v_link_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_link_click(TEXT) TO anon, authenticated;
