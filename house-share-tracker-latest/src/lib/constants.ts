export const DEFAULT_CATEGORIES = [
  'Rent',
  'Food',
  'Electricity',
  'Internet',
  'Groceries',
  'Others'
] as const;

export const DEFAULT_ROOMMATES = ['Amith', 'Anusha'] as const;

export const LARGE_EXPENSE_THRESHOLD = 5000;

export const CURRENCY_SYMBOL = '₹';

export type Category = (typeof DEFAULT_CATEGORIES)[number];
export type Roommate = string;

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  paid_by: string;
  month: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  roommates: string[];
  categories: string[];
  currency: string;
  large_expense_threshold: number;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
