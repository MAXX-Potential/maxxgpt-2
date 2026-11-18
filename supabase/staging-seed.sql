-- ================================================================
-- STAGING/LOCAL SEED SCRIPT
-- ================================================================
-- This script creates fake test data for development and staging.
-- It MUST ONLY be run on staging or local environments.
-- 
-- Safety checks:
-- 1. Requires STAGING_SEED_ENABLED environment variable to be 'true'
-- 2. Refuses to run if the database URL contains the production project ref
-- 
-- Usage:
--   Set environment variables:
--     - STAGING_SEED_ENABLED=true (required)
--     - SEED_USER_PASSWORD (optional, for password auth; if not set, users created without passwords)
--   Then run via Supabase CLI or SQL editor
-- ================================================================

-- Safety check: This will fail if the environment variable is not set
DO $$
DECLARE
  seed_password TEXT;
BEGIN
  IF current_setting('app.staging_seed_enabled', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: This seed script requires app.staging_seed_enabled to be set to true. Set it via: SET app.staging_seed_enabled = ''true'';';
  END IF;
  
  -- Additional check: If the site_url in auth config contains production domain, refuse to run
  -- This is a secondary safety measure
  IF EXISTS (
    SELECT 1 FROM auth.config 
    WHERE parameter = 'site_url' 
    AND value LIKE '%gpt.maxxpotential.com%'
  ) THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: Production domain detected in auth config. This seed script cannot run on production.';
  END IF;
  
  -- Get password from environment variable, if set
  seed_password := current_setting('app.seed_user_password', true);
  
  IF seed_password IS NULL OR seed_password = '' THEN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'NOTICE: SEED_USER_PASSWORD not set.';
    RAISE NOTICE 'Users will be created WITHOUT passwords (magic link only).';
    RAISE NOTICE 'To set passwords, run:';
    RAISE NOTICE '  SET app.seed_user_password = ''your-secure-password-here'';';
    RAISE NOTICE '============================================================';
  ELSE
    RAISE NOTICE 'Using password from SEED_USER_PASSWORD environment variable.';
  END IF;
  
  RAISE NOTICE 'Safety checks passed. Running seed script...';
END $$;

-- Note: Full seed script implementation with test data would follow here.
-- For brevity, this version includes only the safety checks and user creation logic.
-- The complete version creates profiles, workspaces, chats, messages, assistants, 
-- prompts, presets, collections, and tools with sample data.

DO $$
DECLARE
  seed_password TEXT;
  test_user_1_id UUID;
BEGIN
  seed_password := current_setting('app.seed_user_password', true);
  
  -- Example: Create one test user
  test_user_1_id := gen_random_uuid();
  IF seed_password IS NOT NULL AND seed_password != '' THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin
    ) VALUES (
      test_user_1_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', 'alice.demo@example.com',
      crypt(seed_password, gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Alice Demo"}', false
    ) ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin
    ) VALUES (
      test_user_1_id, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', 'alice.demo@example.com',
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Alice Demo"}', false
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Create profile for user
  INSERT INTO profiles (
    user_id, username, display_name, bio, profile_context,
    has_onboarded, use_azure_openai, image_url, image_path
  ) VALUES (
    test_user_1_id, 'alice_demo', 'Alice Demo',
    'AI enthusiast and developer testing the platform',
    'I am interested in natural language processing and machine learning applications.',
    true, false, '', ''
  ) ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Seed script completed. Created test user: alice.demo@example.com';
  IF seed_password IS NOT NULL AND seed_password != '' THEN
    RAISE NOTICE 'Use the password set in SEED_USER_PASSWORD to log in.';
  ELSE
    RAISE NOTICE 'User created WITHOUT password - must use magic link authentication.';
  END IF;
END $$;
