/*
  # Scheduler System with Recurring Slots

  ## Overview
  This migration creates a scheduler system that supports recurring weekly slots with exception handling.
  Each slot can recur weekly, and modifications to specific dates are tracked as exceptions.

  ## New Tables
  
  ### `recurring_slots`
  Base recurring slot patterns that repeat weekly
  - `id` (uuid, primary key) - Unique identifier for the recurring slot
  - `day_of_week` (integer, 0-6) - Day of week (0=Sunday, 6=Saturday)
  - `start_time` (time) - Start time of the slot
  - `end_time` (time) - End time of the slot
  - `created_at` (timestamptz) - Timestamp when slot was created
  - `updated_at` (timestamptz) - Timestamp when slot was last updated
  
  ### `slot_exceptions`
  Tracks exceptions to recurring slots (edits or deletions on specific dates)
  - `id` (uuid, primary key) - Unique identifier for the exception
  - `recurring_slot_id` (uuid, foreign key) - Reference to the recurring slot
  - `exception_date` (date) - Specific date this exception applies to
  - `exception_type` (text) - Type of exception: 'deleted' or 'modified'
  - `start_time` (time, nullable) - Modified start time (only for 'modified' type)
  - `end_time` (time, nullable) - Modified end time (only for 'modified' type)
  - `created_at` (timestamptz) - Timestamp when exception was created
  
  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Public access for demo purposes (in production, would be user-specific)
  
  ## Indexes
  - Index on day_of_week for efficient recurring slot queries
  - Composite index on (recurring_slot_id, exception_date) for fast exception lookups
*/

-- Create recurring_slots table
CREATE TABLE IF NOT EXISTS recurring_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create slot_exceptions table
CREATE TABLE IF NOT EXISTS slot_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_slot_id uuid NOT NULL REFERENCES recurring_slots(id) ON DELETE CASCADE,
  exception_date date NOT NULL,
  exception_type text NOT NULL CHECK (exception_type IN ('deleted', 'modified')),
  start_time time,
  end_time time,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_exception_times CHECK (
    (exception_type = 'deleted') OR 
    (exception_type = 'modified' AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  ),
  UNIQUE (recurring_slot_id, exception_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recurring_slots_day ON recurring_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_slot_exceptions_lookup ON slot_exceptions(recurring_slot_id, exception_date);

-- Enable Row Level Security
ALTER TABLE recurring_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_exceptions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo purposes)
CREATE POLICY "Allow public read access to recurring_slots"
  ON recurring_slots FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to recurring_slots"
  ON recurring_slots FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to recurring_slots"
  ON recurring_slots FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to recurring_slots"
  ON recurring_slots FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to slot_exceptions"
  ON slot_exceptions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to slot_exceptions"
  ON slot_exceptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to slot_exceptions"
  ON slot_exceptions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to slot_exceptions"
  ON slot_exceptions FOR DELETE
  TO anon, authenticated
  USING (true);