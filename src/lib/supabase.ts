import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type RecurringSlot = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

export type SlotException = {
  id: string;
  recurring_slot_id: string;
  exception_date: string;
  exception_type: 'deleted' | 'modified';
  start_time: string | null;
  end_time: string | null;
  created_at: string;
};

export type DaySlot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_exception: boolean;
  recurring_slot_id: string;
};
