-- =====================================================
-- MoneyBox Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Investments Table
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mutual_fund', 'equity', 'debt', 'crypto')),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_price NUMERIC NOT NULL CHECK (purchase_price > 0),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  current_price NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Savings Table
CREATE TABLE IF NOT EXISTS public.savings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('mutual_fund', 'equity', 'debt', 'crypto', 'general')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_user ON public.savings(user_id);

-- =====================================================
-- Enable Row Level Security
-- =====================================================
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can manage their own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own investments" ON public.investments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own savings" ON public.savings
  FOR ALL USING (auth.uid() = user_id);

