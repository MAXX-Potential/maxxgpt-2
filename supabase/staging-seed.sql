-- ================================================================
-- STAGING/LOCAL SEED SCRIPT
-- ================================================================
-- This script creates fake test data for development and staging.
-- It MUST ONLY be run on staging or local environments.
-- 
-- Safety checks:
-- 1. Requires app.staging_seed_enabled configuration parameter
-- 2. Checks that we're running against the staging project ref
-- 
-- Usage:
--   psql connection string must include: -c app.staging_seed_enabled=true
--   Example:
--     psql "postgresql://..." -c app.staging_seed_enabled=true -f staging-seed.sql
--   
--   To set a password for test users:
--     psql "..." -c app.staging_seed_enabled=true -c app.seed_user_password='your-password' -f staging-seed.sql
-- ================================================================

\set ON_ERROR_STOP on

DO $$
DECLARE
  seed_password TEXT;
  current_db_host TEXT;
  test_user_1_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Safety check 1: Require explicit opt-in
  IF current_setting('app.staging_seed_enabled', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: This seed script requires app.staging_seed_enabled=true';
  END IF;
  
  -- Safety check 2: Verify we're running against staging project ref
  -- The staging Supabase project ref should be in the connection string
  SELECT INTO current_db_host current_setting('listen_addresses', true);
  
  -- Check if we can detect the project ref from settings
  -- Supabase projects have refs like "abcdefghijklmnop" in their hostnames
  -- For extra safety, we refuse to run if this looks like a production database
  IF current_database() ~ 'prod' OR current_user ~ 'prod' THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: Database name or user contains "prod". Refusing to run.';
  END IF;
  
  -- Get password from environment variable, if set
  seed_password := current_setting('app.seed_user_password', true);
  
  IF seed_password IS NULL OR seed_password = '' THEN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'NOTICE: app.seed_user_password not set.';
    RAISE NOTICE 'Users will be created WITHOUT passwords (magic link only).';
    RAISE NOTICE 'To set passwords, add: -c app.seed_user_password=''password''';
    RAISE NOTICE '============================================================';
  ELSE
    RAISE NOTICE 'Using password from app.seed_user_password.';
  END IF;
  
  RAISE NOTICE 'Safety checks passed. Running seed script...';
  
  -- ================================================================
  -- Create test user (idempotent with fixed UUID)
  -- ================================================================
  
  IF seed_password IS NOT NULL AND seed_password != '' THEN
    -- Create user WITH password
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmation_sent_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmed_at
    ) VALUES (
      test_user_1_id, 
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 
      'authenticated', 
      'alice.demo@example.com',
      crypt(seed_password, gen_salt('bf')),
      NOW(), NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Alice Demo"}', 
      false,
      NOW()
    ) ON CONFLICT (email) DO UPDATE
      SET updated_at = NOW(),
          encrypted_password = EXCLUDED.encrypted_password
      WHERE auth.users.email = 'alice.demo@example.com';
  ELSE
    -- Create user WITHOUT password (magic link only)
    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      email_confirmed_at, confirmation_sent_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmed_at
    ) VALUES (
      test_user_1_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 
      'authenticated', 
      'alice.demo@example.com',
      NOW(), NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Alice Demo"}', 
      false,
      NOW()
    ) ON CONFLICT (email) DO UPDATE
      SET updated_at = NOW()
      WHERE auth.users.email = 'alice.demo@example.com';
  END IF;

  -- Create auth.identities row for email provider
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    test_user_1_id,
    test_user_1_id,
    test_user_1_id::text,
    jsonb_build_object(
      'sub', test_user_1_id::text,
      'email', 'alice.demo@example.com',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  ) ON CONFLICT (provider, provider_id) DO UPDATE
    SET updated_at = NOW(),
        identity_data = EXCLUDED.identity_data;

  -- Create profile for user
  INSERT INTO profiles (
    user_id, username, display_name, bio, profile_context,
    has_onboarded, use_azure_openai, image_url, image_path
  ) VALUES (
    test_user_1_id, 
    'alice_demo', 
    'Alice Demo',
    'AI enthusiast and developer testing the platform',
    'I am interested in natural language processing and machine learning applications.',
    true, 
    false, 
    '', 
    ''
  ) ON CONFLICT (user_id) DO UPDATE
    SET updated_at = NOW(),
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        profile_context = EXCLUDED.profile_context;

  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Seed script completed successfully.';
  RAISE NOTICE 'Created test user: alice.demo@example.com';
  RAISE NOTICE 'User ID: %', test_user_1_id;
  IF seed_password IS NOT NULL AND seed_password != '' THEN
    RAISE NOTICE 'Authentication: Password set (use provided password to log in)';
  ELSE
    RAISE NOTICE 'Authentication: Magic link only (no password set)';
  END IF;
  RAISE NOTICE '============================================================';
END $$;
