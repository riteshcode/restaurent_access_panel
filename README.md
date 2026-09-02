# Rasoi Menu — Super Admin Panel

Platform-owner-side admin dashboard for [Rasoi Menu](https://rasoimenu.in), a multi-tenant SaaS for Indian restaurants (QR menus, POS, kitchen display, order management).

This is a **separate application** from the main Rasoi Menu product. It connects to the **same Supabase project/database** via the `service_role` key (bypassing RLS) to give the platform owner full visibility and control across all tenants.

---

## What it does

- **Dashboard** — platform-wide stats: total tenants, active subscriptions, trial/suspended counts, estimated MRR, total orders across all tenant schemas
- **Tenants** — searchable/paginated list, full detail view, add new tenant (auto-provisions their Postgres schema), edit tenant info, suspend/enable with one click
- **Plans** — CRUD for subscription plans (Basic/Pro/Elite), feature lists, active/inactive toggle
- **Subscriptions** — Razorpay subscription status per tenant
- **Payment Events** — Razorpay webhook log viewer with raw payload inspection
- **Email Queue** — tracks transactional email delivery, retry failed sends
- **AI Menu Cache** — visibility into the Claude-powered menu image import cache, with manual cleanup
- **Team Access** — manage which emails are allowlisted for admin login
- **Auth** — email allowlist (`super_admins` table) + Supabase Auth (magic link or password), with route-level middleware protection
- **Dark / Light theme** — toggle in the sidebar, persisted per browser

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS v4 (CSS variables for theming) |
| Database | Supabase (PostgreSQL) — same instance as the main Rasoi Menu app |
| Auth | Supabase Auth (magic link + password) with custom email allowlist |
| Icons | Lucide React |
| Fonts | DM Sans + DM Serif Display |
| Deployment | Vercel (suggested: `admin.rasoimenu.in`) |

---

## Architecture notes

- **Schema-per-tenant**: each restaurant lives in its own Postgres schema (`tenant_xxxxxxxxxxxx`). This admin panel reads across all of them using Postgres functions (`get_total_orders_count`, `get_tenant_order_count`) since Supabase's JS client can't query dynamic schemas directly.
- **Tenant provisioning**: adding a tenant calls the existing `provision_tenant()` RPC function (defined in the main product's database) — this admin app does **not** duplicate schema-creation logic.
- **RLS**: `service_role` is used everywhere for admin operations, bypassing Row Level Security by design. The one exception is the `super_admins` allowlist check performed via middleware, which relies on a scoped RLS policy so an authenticated user can only read their own row.
- **Money fields**: `price_monthly` and similar amounts are stored in **paise** in the database (e.g. ₹299 = `29900`). UI always divides by 100 for display and multiplies by 100 before saving.

---

## Project Structure

```
src/
  app/
    login/                    # public login page (magic link + password)
    auth/callback/             # Supabase auth callback handler
    (dashboard)/                # route group — everything behind the sidebar
      page.tsx                  # dashboard/overview
      tenants/                  # list, [id] detail, [id]/edit, new
      plans/                    # list, [id]/edit, new
      subscriptions/
      payment-events/
      email-queue/
      menu-cache/
      team/                     # super_admins management
    api/                        # route handlers (all use supabaseAdmin / service_role)
  components/                   # Logo, Sidebar, Toast, DateTimePicker, etc.
  contexts/                     # ThemeContext (dark/light)
  hooks/                        # useToast, useCurrentUser
  lib/                          # supabaseAdmin.ts, supabaseBrowser.ts, config.ts
  middleware.ts                 # auth + allowlist route protection
supabase/
  migrations/                   # tracked SQL changes (functions, RLS policies)
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ This connects to the **same Supabase project** as the main Rasoi Menu app. Any write action here affects live production data — there is no separate staging database.

### 3. Run database migrations

Apply everything in `supabase/migrations/` (in order) via the Supabase SQL Editor. See that folder's `README.md` for a log of what's been applied.

### 4. Add yourself to the allowlist

In Supabase, insert your email into `public.super_admins`:

```sql
insert into super_admins (email, name) values ('you@rasoimenu.in', 'Your Name');
```

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000/login`.

---

## Deployment

Intended to deploy as a separate Vercel project (e.g. `admin.rasoimenu.in`), pointed at the same Supabase instance. Set the same environment variables in the Vercel project settings.

---

## Safety notes

- There is **no staging environment** — this app always talks to production data.
- The **Suspend/Enable** tenant toggle and **tenant editing** take effect immediately.
- Deleting a `plans` row is intentionally **not exposed** in the UI (only an Active/Inactive toggle) since `tenants.plan_id` is a foreign key — removing a plan in use would break tenant records.
- Test destructive actions (suspend, delete cache entries, remove team members) on non-critical records first.

---

## License

Internal tool — not for public distribution.