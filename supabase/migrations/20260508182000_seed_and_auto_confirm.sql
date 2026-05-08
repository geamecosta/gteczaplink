DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Fix any potential nulls in auth.users token columns to avoid GoTrue panic errors
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE
    confirmation_token IS NULL OR recovery_token IS NULL
    OR email_change_token_new IS NULL OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change IS NULL OR phone_change_token IS NULL
    OR reauthentication_token IS NULL;

  -- Seed the main test user or reset their credentials so login is guaranteed to work
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'geamefialho@hotmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'geamefialho@hotmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Geame"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    -- User exists, update password and ensure email is confirmed
    UPDATE auth.users
    SET 
      encrypted_password = crypt('Skip@Pass', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE email = 'geamefialho@hotmail.com';
  END IF;
END $$;

-- Create an auto-confirm trigger for any new signups so preview testing works smoothly without email validation
CREATE OR REPLACE FUNCTION public.auto_confirm_users_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
  RETURN NEW;
END;
$;

DROP TRIGGER IF EXISTS auto_confirm_users_before_insert_trigger ON auth.users;
CREATE TRIGGER auto_confirm_users_before_insert_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_users_before_insert();
