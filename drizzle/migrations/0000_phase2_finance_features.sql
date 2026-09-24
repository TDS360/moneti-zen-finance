ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS merchant text, ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS demo_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE public.debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'credit_card',
  balance numeric NOT NULL CHECK (balance >= 0),
  interest_rate numeric NOT NULL DEFAULT 0 CHECK (interest_rate >= 0 AND interest_rate <= 100),
  minimum_payment numeric NOT NULL DEFAULT 0 CHECK (minimum_payment >= 0),
  extra_payment numeric NOT NULL DEFAULT 0 CHECK (extra_payment >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO authenticated;
GRANT ALL ON public.debts TO service_role;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY debts_all_own ON public.debts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.net_worth_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  side text NOT NULL CHECK (side IN ('asset','liability')),
  kind text NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.net_worth_items TO authenticated;
GRANT ALL ON public.net_worth_items TO service_role;
ALTER TABLE public.net_worth_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY nwi_all_own ON public.net_worth_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.net_worth_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  snapshot_date date NOT NULL DEFAULT current_date,
  assets numeric NOT NULL DEFAULT 0,
  liabilities numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, snapshot_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.net_worth_snapshots TO authenticated;
GRANT ALL ON public.net_worth_snapshots TO service_role;
ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY nws_all_own ON public.net_worth_snapshots FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.emergency_funds (
  user_id uuid PRIMARY KEY DEFAULT auth.uid(),
  target_amount numeric NOT NULL DEFAULT 0 CHECK (target_amount >= 0),
  current_amount numeric NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  monthly_contribution numeric NOT NULL DEFAULT 0 CHECK (monthly_contribution >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_funds TO authenticated;
GRANT ALL ON public.emergency_funds TO service_role;
ALTER TABLE public.emergency_funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY ef_all_own ON public.emergency_funds FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_usage_user_time ON public.ai_usage (user_id, created_at DESC);
GRANT SELECT, INSERT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_select_own ON public.ai_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY ai_usage_insert_own ON public.ai_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);