-- =====================================================
-- Ingat-In WhatsApp Bot Database Schema
-- =====================================================
-- 
-- Cara Setup:
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Copy & paste script ini
-- 3. Klik "Run" untuk mengeksekusi
--
-- =====================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  absen_pagi BOOLEAN DEFAULT FALSE,
  absen_sore BOOLEAN DEFAULT FALSE,
  last_checkin TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on number for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_number ON users(number);

-- Create index on checkin times for analytics
CREATE INDEX IF NOT EXISTS idx_users_last_checkin ON users(last_checkin);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous read access (for dashboard)
CREATE POLICY "Allow anonymous read access" ON users
  FOR SELECT
  USING (true);

-- Policy: Allow anonymous insert (for new registrations)
CREATE POLICY "Allow anonymous insert" ON users
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anonymous update (for absen updates)
CREATE POLICY "Allow anonymous update" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Enable Realtime
-- =====================================================

-- Enable realtime for the users table
-- This allows clients to subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- =====================================================
-- Insert Sample Data (Optional - for testing)
-- =====================================================

-- Uncomment to insert sample data:
-- INSERT INTO users (number, absen_pagi, absen_sore, last_checkin)
-- VALUES 
--   ('6285157803374@s.whatsapp.net', false, true, '2025-11-27T08:36:17.934Z'),
--   ('6285779715042@s.whatsapp.net', true, true, '2025-11-27T17:31:30.947Z')
-- ON CONFLICT (number) DO NOTHING;

-- =====================================================
-- Useful Queries
-- =====================================================

-- View all users
-- SELECT * FROM users ORDER BY created_at DESC;

-- Count users by attendance status
-- SELECT 
--   COUNT(*) as total_users,
--   SUM(CASE WHEN absen_pagi THEN 1 ELSE 0 END) as absen_pagi_count,
--   SUM(CASE WHEN absen_sore THEN 1 ELSE 0 END) as absen_sore_count
-- FROM users;

-- Reset daily attendance (run this via cron job)
-- UPDATE users SET absen_pagi = false, absen_sore = false;
