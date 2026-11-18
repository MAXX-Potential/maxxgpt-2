# Staging Environment Guide

This document describes the staging environment setup for MaxxGPT-2.

## Branch Model

- **`main`** - Production branch
  - Deployed to: [gpt.maxxpotential.com](https://gpt.maxxpotential.com)
  - Connected to production Supabase project
  
- **`dev`** - Staging branch
  - Deployed to: https://maxxgpt-2-staging.vercel.app
  - Connected to staging Supabase project: `maxxgpt2-staging`
  - Auto-deploys on every push to `dev`

### Development Workflow

1. Create feature branches off `dev`
2. Open pull requests targeting `dev` (NOT `main`)
3. After testing in staging, promote changes from `dev` to `main` via PR
4. Production deploys from `main`

## Staging URL

**Staging deployment URL:** https://maxxgpt-2-staging.vercel.app

The staging environment is accessible at the above URL and is configured with:
- Auto-deploys from the `dev` branch
- Branch-specific environment variables scoped to `dev`
- Vercel deployment protection (bypass token may be required)

## Environment Variables

The following environment variables must be configured in Vercel for the `dev` branch:

### Supabase (Required) - STAGING VALUES ONLY

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | dev | Staging Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dev | Staging anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | dev | Staging service role key (treat as password!) |

⚠️ **CRITICAL**: These must point to the `maxxgpt2-staging` Supabase project, NOT production.

### Site Configuration (Required for OAuth redirects)

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SITE_URL` | dev | Set to `https://maxxgpt-2-staging.vercel.app` for staging |

This variable ensures OAuth password reset emails redirect to the correct environment. Production uses `https://gpt.maxxpotential.com`.

### API Keys (Optional) - OK TO SHARE OR USE TEST KEYS

These can be shared between environments or use dedicated test/sandbox keys:

| Variable | Scope | Notes |
|----------|-------|-------|
| `OPENAI_API_KEY` | dev or all | Can use separate staging key to track costs |
| `ANTHROPIC_API_KEY` | dev or all | Optional |
| `GOOGLE_GEMINI_API_KEY` | dev or all | Optional |
| `GROQ_API_KEY` | dev or all | Optional |
| `MISTRAL_API_KEY` | dev or all | Optional |
| `PERPLEXITY_API_KEY` | dev or all | Optional |
| `OPENROUTER_API_KEY` | dev or all | Optional |
| `NEXT_PUBLIC_OPENAI_ORGANIZATION_ID` | dev or all | Optional |

### Azure OpenAI (Optional) - OK TO SHARE OR USE TEST KEYS

| Variable | Scope | Notes |
|----------|-------|-------|
| `AZURE_OPENAI_API_KEY` | dev or all | Optional |
| `NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT` | dev or all | Optional |
| `NEXT_PUBLIC_AZURE_GPT_35_TURBO_ID` | dev or all | Optional |
| `NEXT_PUBLIC_AZURE_GPT_45_VISION_ID` | dev or all | Optional |
| `NEXT_PUBLIC_AZURE_GPT_45_TURBO_ID` | dev or all | Optional |

### General Configuration (Optional)

| Variable | Scope | Notes |
|----------|-------|-------|
| `EMAIL_DOMAIN_WHITELIST` | dev | Can be different from prod |
| `EMAIL_WHITELIST` | dev | Can be different from prod |
| `NEXT_PUBLIC_OLLAMA_URL` | dev | For local Ollama testing (e.g., `http://localhost:11434`) |

### Seed Script Configuration

| Variable | Scope | Notes |
|----------|-------|-------|
| `STAGING_SEED_ENABLED` | dev | Must be `true` to run seed script (safety measure) |

## Hard-Coded Production References

The following locations in the codebase contain hard-coded production URLs that could potentially cause staging to interact with production systems. These should be monitored or overridden for staging:

### 1. Auth Redirect URLs

**File:** `app/[locale]/login/page.tsx` (line 110)
```typescript
redirectTo: `https://gpt.maxxpotential.com/auth/callback?next=/login/password`
```
**Risk:** OAuth redirects may point to production URL
**Mitigation:** Update with environment-specific URL or use relative paths

### 2. Supabase Auth Configuration

**File:** `supabase/config.toml` (lines 57, 60-61)
```toml
site_url = "https://gpt.maxxpotential.com"
additional_redirect_urls = [
    "https://gpt.maxxpotential.com/auth/callback",
    "https://gpt.maxxpotential.com/login/password",
    ...
]
```
**Risk:** Auth callbacks hard-coded to production
**Mitigation:** Override in staging Supabase project dashboard (Settings → Authentication → Redirect URLs)

### 3. External Brand Links

**Files:** 
- `components/ui/brand.tsx` (line 15)
- `components/sharing/share-header.tsx` (line 14)

```typescript
href="https://maxxpotential.com"
```
**Risk:** Low - These are marketing site links, not functional
**Mitigation:** None needed, but could be environment-aware

### 4. Migration File (IMPORTANT)

**File:** `supabase/migrations/20240108234540_setup.sql` (lines 53-54)
```sql
project_url TEXT := 'http://supabase_kong_chatbotui:8000';
service_role_key TEXT := '...';
```
**Risk:** Low for staging (used for local dev)
**Mitigation:** Update these values when setting up the staging Supabase project with actual staging credentials

## Database Setup

### Prerequisites

1. Staging Supabase project created (`maxxgpt2-staging`)
2. Supabase CLI installed: `brew install supabase/tap/supabase`

### Apply Migrations

To set up the database schema from scratch:

```bash
# Link to staging project
supabase link --project-ref <staging-project-ref>

# Push all migrations
supabase db push
```

This will create:
- All tables (profiles, workspaces, chats, messages, files, folders, assistants, prompts, presets, collections, tools, etc.)
- Junction tables for many-to-many relationships
- Row Level Security (RLS) policies
- Database functions and triggers
- Storage buckets (profile_images, files, assistant_images, message_images)

### Run Seed Script

After migrations are applied, populate with fake test data:

```bash
# Set the safety flag and run seed
psql <staging-database-url> -c "SET app.staging_seed_enabled = 'true';" -f supabase/staging-seed.sql
```

Or via Supabase SQL Editor:
```sql
SET app.staging_seed_enabled = 'true';
-- Then paste and run the contents of supabase/staging-seed.sql
```

**Test Users Created:**
- `alice.demo@example.com` (password: `demo-password-123`)
- `bob.test@example.com` (password: `demo-password-456`)
- `charlie.sample@example.com` (password: `demo-password-789`)

### Seed Safety Features

The seed script includes multiple safety checks:

1. **Environment variable check**: Requires `app.staging_seed_enabled = 'true'`
2. **Production domain detection**: Refuses to run if it detects production URLs in the database config
3. **Fake data only**: All emails are `@example.com`, names are clearly test accounts
4. **No real credentials**: No actual API keys, tokens, or sensitive data

### Manual Seed (Alternative)

If you prefer not to use the seed script, you can:
1. Sign up for test accounts manually through the staging UI
2. Use Supabase Studio to insert test data via the table editor
3. Use the API to create test data programmatically

## Testing Checklist

Before promoting `dev` changes to `main`:

- [ ] Verify staging URL is accessible with bypass token
- [ ] Confirm all environment variables are set correctly (check Vercel dashboard)
- [ ] Test user authentication (sign up, sign in, password reset)
- [ ] Verify storage buckets work (upload profile images, files)
- [ ] Test chat functionality (create chat, send messages)
- [ ] Verify RLS policies (users can only see their own data)
- [ ] Check that no production data is visible
- [ ] Verify no staging operations are hitting production systems (check logs)
- [ ] Test all major features in the staging environment

## Monitoring Staging → Production Leakage

### Known Interaction Points

1. **Database**: Completely isolated (separate Supabase projects)
2. **Storage**: Completely isolated (separate Supabase storage buckets)
3. **Auth**: Isolated (separate Supabase auth, but check redirect URLs)
4. **API Keys**: Can be shared (no isolation), but costs are tracked separately if using different keys

### Recommended Monitoring

- Use separate OpenAI/Anthropic API keys for staging to track usage
- Check Supabase logs for any cross-project queries (shouldn't happen)
- Verify staging URL in browser address bar before testing
- Use different user accounts for staging vs. production testing

## Troubleshooting

### Build Failures

If staging builds fail:
```bash
# Test locally first
npm run build
npm run lint
```

### Migration Failures

If migrations fail to apply:
```bash
# Check migration status
supabase db diff

# Reset local database (local only!)
supabase db reset

# Reapply migrations
supabase db push
```

### Seed Script Failures

Common issues:
- **"app.staging_seed_enabled" not set**: Run `SET app.staging_seed_enabled = 'true';` first
- **Production domain detected**: Check auth.config table, update site_url
- **Foreign key violations**: Ensure migrations are fully applied before seeding
- **User already exists**: Comment out the data cleanup section if adding incremental data

## Deployment URLs Reference

| Environment | Branch | URL | Database |
|-------------|--------|-----|----------|
| Production | `main` | https://gpt.maxxpotential.com | Production Supabase |
| Staging | `dev` | https://maxxgpt-2-staging.vercel.app | `maxxgpt2-staging` |
| Local Dev | any | http://localhost:3000 | Local Supabase (Docker) |

## Next Steps

1. **Engineering Lead**: Configure Vercel environment variables
   - ✅ Staging deployment already set up at https://maxxgpt-2-staging.vercel.app
   - Set staging environment variables (see list above)
   - Set `NEXT_PUBLIC_SITE_URL=https://maxxgpt-2-staging.vercel.app` for OAuth redirects
   - Configure Supabase credentials for staging project

2. **Engineering Lead**: Set up staging Supabase
   - Apply migrations: `supabase db push`
   - Run seed script (with `STAGING_SEED_ENABLED=true` and optionally `SEED_USER_PASSWORD`)
   - Configure auth redirect URLs in Supabase dashboard (Settings → Authentication)

3. **Team**: Verify staging environment
   - Test authentication (magic link and password reset)
   - Verify data isolation from production
   - Confirm OAuth redirects go to staging, not production
   - Test major features in staging before promoting to production

4. **Operations**: Set up monitoring
   - Configure alerts for staging build failures
   - Set up usage tracking for staging API keys
   - Monitor staging database size and performance

## Support

For staging environment issues:
- Check Vercel deployment logs
- Check Supabase logs in the staging project dashboard
- Review this document for configuration requirements
- Contact engineering lead for credentials or access issues
