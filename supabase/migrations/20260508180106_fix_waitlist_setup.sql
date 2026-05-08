-- 1. Ensure table and basic constraints
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referral_code TEXT,
  referred_by TEXT,
  referral_count INTEGER DEFAULT 0
);

-- 2. Make email unique to avoid duplicates gracefully
DO $DO$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_email_key'
  ) THEN
    ALTER TABLE public.waitlist ADD CONSTRAINT waitlist_email_key UNIQUE (email);
  END IF;
END $DO$;

-- 3. RLS policies
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_insert_anon" ON public.waitlist;
CREATE POLICY "allow_insert_anon" ON public.waitlist FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "allow_insert_auth" ON public.waitlist;
CREATE POLICY "allow_insert_auth" ON public.waitlist FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "allow_select_auth" ON public.waitlist;
CREATE POLICY "allow_select_auth" ON public.waitlist FOR SELECT TO authenticated USING (true);

-- 4. Triggers for referral
CREATE OR REPLACE FUNCTION public.generate_referral_code(size integer DEFAULT 6)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..size LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_waitlist_referral_code()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_set_waitlist_referral_code ON public.waitlist;
CREATE TRIGGER trg_set_waitlist_referral_code
  BEFORE INSERT ON public.waitlist
  FOR EACH ROW EXECUTE FUNCTION public.set_waitlist_referral_code();

CREATE OR REPLACE FUNCTION public.increment_referral_count()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.waitlist SET referral_count = referral_count + 1 WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_increment_referral_count ON public.waitlist;
CREATE TRIGGER trg_increment_referral_count
  AFTER INSERT ON public.waitlist
  FOR EACH ROW EXECUTE FUNCTION public.increment_referral_count();

-- 5. RPC function to securely join waitlist and return data for anon users without SELECT policy errors
CREATE OR REPLACE FUNCTION public.join_waitlist(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_referred_by TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_waitlist public.waitlist;
BEGIN
  -- Check if already exists
  SELECT * INTO v_waitlist FROM public.waitlist WHERE email = p_email LIMIT 1;
  
  IF v_waitlist.id IS NOT NULL THEN
    RETURN to_jsonb(v_waitlist);
  END IF;

  -- Insert new record
  INSERT INTO public.waitlist (name, email, phone, referred_by)
  VALUES (p_name, p_email, p_phone, p_referred_by)
  RETURNING * INTO v_waitlist;

  RETURN to_jsonb(v_waitlist);
END;
$function$;

-- 6. RPC function to get referral status without full SELECT access
CREATE OR REPLACE FUNCTION public.get_referral_status(p_email TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'name', name,
    'referral_code', referral_code,
    'referral_count', referral_count
  ) INTO v_data
  FROM public.waitlist
  WHERE email = p_email
  LIMIT 1;
  
  RETURN v_data;
END;
$function$;
