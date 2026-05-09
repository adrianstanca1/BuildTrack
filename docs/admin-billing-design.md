# BuildTrack Admin Dashboard + Billing Design Doc

## 1. Architecture Overview

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Expo SDK 51 + React Native Web + NativeWind | Responsive admin panel works on web + tablet |
| State | Zustand + persist (AsyncStorage) | Billing state cached locally, synced from Supabase |
| Backend | Supabase (Postgres + Auth + Realtime) | Existing stack — no new infra |
| Payments | Stripe | Recommended; ecosystem alignment with Supabase |
| Webhooks | Supabase Edge Functions (or Next.js API route in separate service) | Handle Stripe events securely |

## 2. Subscription Tiers

| Tier | Price | Projects | Team Members | Features |
|------|-------|----------|--------------|----------|
| **Free** | £0/mo | 1 | 3 | Basic projects, tasks, safety reports |
| **Pro** | £29/mo | 10 | 15 | + Advanced reports, photo storage 10GB, priority support |
| **Enterprise** | £99/mo | Unlimited | Unlimited | + Custom integrations, SLA, dedicated account manager, audit logs |

## 3. Database Schema (New Tables)

### `profiles` (extended)
- `role` TEXT DEFAULT 'user' CHECK ('user', 'admin', 'super_admin')
- `stripe_customer_id` TEXT
- `subscription_tier` TEXT DEFAULT 'free'
- `subscription_status` TEXT DEFAULT 'inactive' CHECK ('active', 'inactive', 'past_due', 'cancelled')

### `subscriptions` (new)
- `id` UUID PK
- `user_id` UUID → auth.users
- `stripe_subscription_id` TEXT
- `stripe_customer_id` TEXT
- `tier` TEXT
- `status` TEXT
- `current_period_start` TIMESTAMPTZ
- `current_period_end` TIMESTAMPTZ
- `cancel_at_period_end` BOOLEAN DEFAULT FALSE
- `created_at` / `updated_at`

### `subscription_items` (new)
- `id` UUID PK
- `subscription_id` UUID → subscriptions
- `stripe_price_id` TEXT
- `quantity` INTEGER DEFAULT 1
- `created_at` / `updated_at`

### `billing_events` (new — audit trail)
- `id` UUID PK
- `user_id` UUID
- `stripe_event_id` TEXT
- `event_type` TEXT
- `payload` JSONB
- `processed_at` TIMESTAMPTZ

## 4. Feature Gates

Implemented via `useSubscription()` hook + `canAccess()` utility:
- `maxProjects` — based on tier
- `maxTeamMembers` — based on tier
- `hasAdvancedReports` — Pro+
- `hasAuditLogs` — Enterprise

## 5. Admin Dashboard Routes

| Route | Screen | Auth |
|-------|--------|------|
| `/admin` | Overview stats + quick nav | admin+ |
| `/admin/users` | User management table | admin+ |
| `/admin/projects` | All projects oversight | admin+ |
| `/admin/teams` | Team memberships + roles | admin+ |
| `/admin/billing` | Subscription management | admin+ |

## 6. Stripe Webhook Events Handled

- `checkout.session.completed` → create/update subscription
- `invoice.paid` → mark active, update period end
- `invoice.payment_failed` → mark past_due, notify
- `customer.subscription.updated` → sync status/cancel flags
- `customer.subscription.deleted` → downgrade to free

## 7. Implementation Plan

1. **Migrations** — add billing tables + profile extensions
2. **Zustand store** — `billingStore.ts`
3. **Hooks** — `useSubscription()`, `useAdmin()`, `useFeatureGate()`
4. **UI Components** — `AdminSidebar`, `DataTable`, `SubscriptionCard`, `TierBadge`
5. **Screens** — admin index, users, projects, teams, billing
6. **Edge Function** — `stripe-webhook` handler
7. **RLS Policies** — admin tables restricted to `role = 'admin'`
8. **Integration** — wire feature gates into existing create-project / add-worker flows
