
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  currency text not null default 'USD',
  theme text not null default 'light',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  -- seed default categories
  insert into public.categories (user_id, name, color, monthly_limit) values
    (new.id, 'Food & Dining', '#3d5a45', 600),
    (new.id, 'Transport', '#6b7a74', 200),
    (new.id, 'Housing', '#2d4233', 1500),
    (new.id, 'Entertainment', '#a8b5a0', 150),
    (new.id, 'Shopping', '#8b9d83', 300),
    (new.id, 'Health', '#5a7561', 200),
    (new.id, 'Salary', '#3d5a45', null),
    (new.id, 'Other', '#9ca39a', null);
  -- seed an account
  insert into public.accounts (user_id, name, type, balance) values
    (new.id, 'Main Checking', 'checking', 4250.00),
    (new.id, 'Savings', 'savings', 12500.00),
    (new.id, 'Investments', 'investment', 28400.00);
  return new;
end; $$;

-- Accounts
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'checking',
  balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);
alter table public.accounts enable row level security;
create policy "accounts_all_own" on public.accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#3d5a45',
  monthly_limit numeric(14,2),
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "categories_all_own" on public.categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  type text not null check (type in ('income','expense')),
  category text,
  amount numeric(14,2) not null,
  note text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.transactions enable row level security;
create policy "transactions_all_own" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index transactions_user_date_idx on public.transactions(user_id, occurred_at desc);

-- Recurring Bills
create table public.recurring_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(14,2) not null,
  frequency text not null default 'monthly',
  next_due date not null,
  category text,
  reminders_enabled boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.recurring_bills enable row level security;
create policy "bills_all_own" on public.recurring_bills for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Goals
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null,
  current_amount numeric(14,2) not null default 0,
  deadline date,
  created_at timestamptz not null default now()
);
alter table public.goals enable row level security;
create policy "goals_all_own" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Chat threads
create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.chat_threads enable row level security;
create policy "threads_all_own" on public.chat_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Chat messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  parts jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
create policy "messages_all_own" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index messages_thread_idx on public.chat_messages(thread_id, created_at);

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
