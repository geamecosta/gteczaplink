ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS referral_count INT DEFAULT 0;

-- Function to generate random short code
CREATE OR REPLACE FUNCTION generate_referral_code(size INT DEFAULT 6) RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql VOLATILE;

-- Trigger to set referral code on insert
CREATE OR REPLACE FUNCTION set_waitlist_referral_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_waitlist_referral_code ON public.waitlist;
CREATE TRIGGER trg_set_waitlist_referral_code
BEFORE INSERT ON public.waitlist
FOR EACH ROW EXECUTE FUNCTION set_waitlist_referral_code();

-- Trigger to increment referral count
CREATE OR REPLACE FUNCTION increment_referral_count() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.waitlist SET referral_count = referral_count + 1 WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_referral_count ON public.waitlist;
CREATE TRIGGER trg_increment_referral_count
AFTER INSERT ON public.waitlist
FOR EACH ROW EXECUTE FUNCTION increment_referral_count();

-- Allow auth users to read waitlist (Dashboard access)
DROP POLICY IF EXISTS "allow_select_auth" ON public.waitlist;
CREATE POLICY "allow_select_auth" ON public.waitlist
  FOR SELECT TO authenticated USING (true);
