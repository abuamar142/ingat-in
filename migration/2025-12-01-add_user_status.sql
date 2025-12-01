-- Migration: Create user_leaves table for tracking izin, sakit, cuti
-- Created: 2025-12-01
-- This replaces the single-column status approach with a separate table for better history tracking

-- Create user_leaves table
CREATE TABLE IF NOT EXISTS user_leaves (
  id SERIAL PRIMARY KEY,
  user_number VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('izin', 'sakit', 'cuti')),
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'cancelled')),
  approved_by VARCHAR(50),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key reference to users table by number
  CONSTRAINT fk_user_leaves_user FOREIGN KEY (user_number) REFERENCES users(number) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_leaves_user_number ON user_leaves(user_number);
CREATE INDEX IF NOT EXISTS idx_user_leaves_dates ON user_leaves(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_leaves_status ON user_leaves(status);
CREATE INDEX IF NOT EXISTS idx_user_leaves_type ON user_leaves(type);
CREATE INDEX IF NOT EXISTS idx_user_leaves_active ON user_leaves(user_number, status) WHERE status = 'active';

-- Comments for documentation
COMMENT ON TABLE user_leaves IS 'Tracks all user leave requests (izin, sakit, cuti) with full history';
COMMENT ON COLUMN user_leaves.type IS 'Type of leave: izin, sakit, or cuti';
COMMENT ON COLUMN user_leaves.reason IS 'User-provided reason for the leave';
COMMENT ON COLUMN user_leaves.start_date IS 'Start date of leave period';
COMMENT ON COLUMN user_leaves.end_date IS 'End date of leave period (inclusive)';
COMMENT ON COLUMN user_leaves.days IS 'Total number of days for this leave';
COMMENT ON COLUMN user_leaves.status IS 'Status: pending (awaiting approval), approved, active (currently on leave), completed (past), cancelled';
COMMENT ON COLUMN user_leaves.approved_by IS 'Admin number who approved (for future approval system)';

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_leaves_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_user_leaves_updated_at
  BEFORE UPDATE ON user_leaves
  FOR EACH ROW
  EXECUTE FUNCTION update_user_leaves_updated_at();
