export type InvestmentType = 'mutual_fund' | 'equity' | 'debt' | 'crypto';
export type SavingsCategory = 'mutual_fund' | 'equity' | 'debt' | 'crypto' | 'general';
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'education'
  | 'other';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  type: InvestmentType;
  name: string;
  symbol: string;
  purchase_date: string;
  purchase_price: number;
  quantity: number;
  current_price: number;
  notes: string;
  created_at: string;
}

export interface Savings {
  id: string;
  user_id: string;
  category: SavingsCategory;
  amount: number;
  date: string;
  notes: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, 'id' | 'created_at'>;
        Update: Partial<Omit<Expense, 'id' | 'created_at'>>;
      };
      investments: {
        Row: Investment;
        Insert: Omit<Investment, 'id' | 'created_at'>;
        Update: Partial<Omit<Investment, 'id' | 'created_at'>>;
      };
      savings: {
        Row: Savings;
        Insert: Omit<Savings, 'id' | 'created_at'>;
        Update: Partial<Omit<Savings, 'id' | 'created_at'>>;
      };
    };
  };
}
