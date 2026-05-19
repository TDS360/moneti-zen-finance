## Moneti — Build Plan

A premium minimalist personal finance web app. Real accounts via Lovable Cloud, threaded AI Coach chat, polished dashboard, and all connected app pages. Design follows the selected "Split dashboard preview" direction: zinc-50 background, sage-600 accent, Instrument Sans, rounded cards.

### 1. Design system
- Tokens in `src/styles.css`: background `#fafaf9`, foreground `#18181b`, primary sage `#3d5a45`, sage-50/100/700, muted zinc tones. Dark mode mirrors with deep zinc + sage.
- Font: Instrument Sans (Google Fonts) via root layout.
- Rounded-2xl cards, subtle ring-1 borders, soft shadows. Tabular nums for financial figures.

### 2. Lovable Cloud (backend)
Enable Cloud. Tables:
- `profiles` (id→auth.users, full_name, currency, theme, created_at) + trigger to auto-create on signup
- `accounts` (id, user_id, name, type, balance)
- `transactions` (id, user_id, account_id, type [income/expense], category, amount, note, occurred_at)
- `categories` (id, user_id, name, color, monthly_limit)
- `recurring_bills` (id, user_id, name, amount, frequency, next_due, category)
- `goals` (id, user_id, name, target_amount, current_amount, deadline)
- `chat_threads` (id, user_id, title, updated_at)
- `chat_messages` (id [uuid], thread_id, role, parts jsonb, created_at) — stores AI SDK UIMessage shape

All tables RLS-scoped to `auth.uid()`. Auth: email/password + Google (broker).

### 3. Routes (TanStack file-based)
Public:
- `/` — marketing homepage, exact composition of selected prototype (hero left + dashboard preview right with floating AI coach card, features trio, testimonial, CTA, footer)
- `/login`, `/signup` — clean forms, redirect to `/dashboard`
- `/reset-password`

`_authenticated` layout (sidebar + topbar):
- `/dashboard` — balance, income, expenses, savings, investments, net worth, financial health score (computed), insights cards, quick actions, alerts
- `/budget` — income/expense entry, custom categories with monthly limits, search/filter, CSV export
- `/bills` — recurring bills with due dates, status, reminders toggle
- `/analytics` — Recharts: spending, savings, investments, net worth over day/month/year/all + simple linear forecast
- `/goals` — goal cards with progress bars, create/edit
- `/investments` — beginner asset cards (ETFs, stocks, bonds, crypto, REITs) with risk labels + educational copy (static curated data)
- `/coach` — redirect to newest or new thread
- `/coach/$threadId` — threaded AI chat (per chat-agent-ui-contract)
- `/tips` — searchable list of financial tips (static curated content)
- `/settings` — profile, notifications, privacy, theme toggle, logout

### 4. AI Coach (threaded, database-backed)
- AI Elements: `conversation`, `message`, `prompt-input`, `shimmer`
- Server route `src/routes/api/chat.ts` using AI SDK + Lovable AI Gateway (`google/gemini-3-flash-preview`), system prompt: friendly beginner finance coach
- Thread list sidebar inside `/coach` layout, new-thread button creates row + navigates to `/coach/$threadId`
- Messages persisted via `onFinish` with proper UUID ids; reload restores per-thread history
- Each thread has its own URL; chat keyed by threadId

### 5. App shell
- Shadcn `Sidebar` with sage-accented active state, collapsible to icon mini
- Top bar with `SidebarTrigger`, page title, user avatar menu (settings/logout)
- Theme toggle persists to profile + localStorage

### 6. Charts & data
- Recharts area/line/bar charts with sage palette
- Seed transactions on first signup so dashboard feels alive (optional onboarding step)
- Net worth = sum(accounts.balance) + sum(investments); financial health score from savings rate, budget adherence, emergency fund

### 7. Auth flow
- Supabase email/password signup with `emailRedirectTo: window.location.origin`
- Google via Lovable broker + `supabase--configure_social_auth google`
- `_authenticated/` layout guards via `beforeLoad` + session check
- `attachSupabaseAuth` middleware wired in `src/start.ts`
- Auth-state listener at root invalidates router + query cache

### 8. Technical details
- All Supabase reads in `_authenticated` routes go through `createServerFn` with `requireSupabaseAuth`
- Chat history via dedicated `*.functions.ts` files; admin client only where needed
- Form validation with Zod
- SEO: per-route `head()` meta on public pages

### 9. Build order
1. Enable Cloud + schema + RLS
2. Tokens + fonts + sidebar shell
3. Public homepage (faithful to selected prototype)
4. Auth (signup/login/reset + Google)
5. Dashboard + Budget + Bills
6. Analytics + Goals
7. Investments + Tips (curated content)
8. AI Coach (threaded)
9. Settings + theme toggle
10. Polish pass: slop-sweep, verify composition matches direction

Scope is large — I'll ship it in cohesive batches starting with foundation + homepage + auth, then iterate through app pages.
