# Production Environment Variables Setup Guide

This document outlines all the environment variables and configuration changes needed to deploy your Task App to production.

## ⚠️ Important Notes

- **Never commit production secrets to Git**
- Use your hosting platform's environment variable management (Vercel, Netlify, etc.)
- Keep test and production configurations separate
- Test thoroughly in staging before going live

---

## 1. Supabase Production Configuration

### Environment Variables to Update

**In your production hosting platform (Vercel/Netlify/etc.):**

```bash
# Production Supabase Project
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

**In Supabase Edge Functions (via Supabase Dashboard or CLI):**

```bash
# Set these secrets in your PRODUCTION Supabase project
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

### How to Get Production Keys

1. Go to your **production** Supabase project dashboard
2. Navigate to: **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Set Supabase Secrets

```bash
# Link to your production project first
npx supabase link --project-ref your-production-project-ref

# Set secrets
npx supabase secrets set SUPABASE_URL=https://your-production-project.supabase.co
npx supabase secrets set SUPABASE_ANON_KEY=your-production-anon-key
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

---

## 2. Stripe Production Configuration

### Switch from Test Mode to Live Mode

**⚠️ CRITICAL: Only switch to live mode when you're ready for real payments!**

### Environment Variables to Update

**In Supabase Edge Functions (via CLI or Dashboard):**

```bash
# Replace test keys with live keys
STRIPE_SECRET_KEY=sk_live_...  # (was sk_test_...)
STRIPE_PRICE_ID=price_...      # Your LIVE mode price ID (create new price in live mode)
STRIPE_WEBHOOK_SECRET=whsec_... # New webhook secret from live mode webhook
```

**Note:** You'll need to create a NEW price in Stripe's **live mode** for your production subscription. The test mode price ID won't work in live mode.

### Steps to Switch Stripe to Live Mode

1. **Create Live Mode Product & Price:**
   - Go to Stripe Dashboard → Switch to **Live mode** (toggle in top right)
   - Create a new product: "TaskMaster Premium" (or your product name)
   - Create a price: $10/month (or your pricing)
   - Copy the **live mode price ID** (starts with `price_`)

2. **Set Live Mode Secrets:**
   ```bash
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
   npx supabase secrets set STRIPE_PRICE_ID=price_xxxxx  # Your LIVE price ID
   ```

3. **Update Stripe Webhook:**
   - Go to Stripe Dashboard → **Developers** → **Webhooks**
   - Create/update webhook endpoint:
     - URL: `https://your-production-project.supabase.co/functions/v1/stripe-webhook`
     - Events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
   - Copy the **webhook signing secret** (starts with `whsec_`)
   - Set it: `npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

4. **Get Live Mode API Keys:**
   - Stripe Dashboard → **Developers** → **API keys**
   - Copy **Publishable key** (`pk_live_...`) - you might need this for frontend
   - Copy **Secret key** (`sk_live_...`) - for edge functions

---

## 3. OAuth Configuration (Google)

### Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 Client
3. Add **Authorized redirect URIs**:
   ```
   https://your-production-project.supabase.co/auth/v1/callback
   https://yourapp.com/auth/callback  # If using custom domain
   ```

### Update Supabase Auth Settings

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add **Site URL**: `https://yourapp.com`
3. Add **Redirect URLs**:
   ```
   https://yourapp.com/**
   https://yourapp.com/dashboard
   https://yourapp.com/profile
   ```

---

## 4. OpenAI Configuration

**In Supabase Edge Functions:**

```bash
# Use the same OpenAI API key (no test/live distinction)
npx supabase secrets set OPENAI_API_KEY=sk-...
```

**Note:** OpenAI doesn't have separate test/live modes, but make sure you're using a key with appropriate usage limits for production.

---

## 5. Next.js Environment Variables

**In your hosting platform (Vercel/Netlify/etc.):**

### Required Variables

```bash
# Supabase (Public - safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### Optional (if needed for testing)

```bash
# Only if you need these for integration tests
SUPABASE_SERVICE_KEY=your-production-service-key
STRIPE_SECRET_KEY=sk_live_...  # Only if needed client-side (usually not)
STRIPE_PRICE_ID=price_...     # Only if needed client-side (usually not)
STRIPE_WEBHOOK_SECRET=whsec_... # Only if needed client-side (usually not)
```

**⚠️ Important:** The Stripe keys should generally stay in Supabase secrets, not in Next.js env vars, unless you have a specific need.

---

## 6. CORS Configuration

### Update Supabase CORS Settings

1. Go to Supabase Dashboard → **Settings** → **API**
2. Under **CORS**, add your production domain:
   ```
   https://yourapp.com
   https://www.yourapp.com  # If using www subdomain
   ```

---

## 7. Database Migrations

### Apply Migrations to Production

```bash
# Link to production project
npx supabase link --project-ref your-production-project-ref

# Push all migrations
npx supabase db push

# Deploy edge functions
npx supabase functions deploy create-task-with-ai
npx supabase functions deploy create-stripe-session
npx supabase functions deploy stripe-webhook
```

---

## 8. Checklist Before Going Live

- [ ] All Supabase secrets set in production project
- [ ] Stripe switched to live mode with live keys
- [ ] New Stripe price created in live mode
- [ ] Stripe webhook configured for production URL
- [ ] Google OAuth redirect URIs updated
- [ ] Supabase Auth redirect URLs configured
- [ ] CORS settings updated
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Environment variables set in hosting platform
- [ ] Test subscription flow end-to-end
- [ ] Test task creation with AI labeling
- [ ] Test image uploads
- [ ] Verify email authentication works
- [ ] Check that webhooks are receiving events

---

## 9. Testing Production Setup

### Test Checklist

1. **Authentication:**
   - [ ] Sign up with email
   - [ ] Sign in with email
   - [ ] Sign in with Google OAuth

2. **Task Management:**
   - [ ] Create a task
   - [ ] Edit a task
   - [ ] Delete a task
   - [ ] Upload an image
   - [ ] Verify AI labeling works (if OpenAI key is set)

3. **Subscriptions:**
   - [ ] Click "Manage Subscription"
   - [ ] Complete test checkout (use Stripe test card: 4242 4242 4242 4242)
   - [ ] Verify subscription status updates
   - [ ] Test subscription cancellation

4. **Webhooks:**
   - [ ] Check Stripe webhook logs
   - [ ] Verify events are being received
   - [ ] Check that subscription updates are reflected in database

---

## 10. Security Best Practices

- ✅ Never commit `.env.local` or `.env.production` files
- ✅ Use different Supabase projects for test and production
- ✅ Rotate secrets regularly
- ✅ Use environment-specific API keys
- ✅ Enable Supabase RLS (Row Level Security) policies
- ✅ Review and test all security policies
- ✅ Monitor Supabase logs for suspicious activity
- ✅ Set up Stripe webhook signature verification
- ✅ Use HTTPS for all production endpoints

---

## Quick Reference: All Environment Variables

### Next.js (Hosting Platform)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Supabase Edge Functions (Supabase Secrets)
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
```

---

## Need Help?

If you encounter issues:
1. Check Supabase function logs: Dashboard → Edge Functions → Logs
2. Check Stripe webhook logs: Dashboard → Developers → Webhooks
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

**Last Updated:** $(date)
**Version:** 1.0



