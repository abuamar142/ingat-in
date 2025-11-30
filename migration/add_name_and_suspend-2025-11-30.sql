-- Migration: Add name and suspend_until columns to users table
-- Created: 2025-11-30

-- Add name column for user registration
ALTER TABLE users
ADD COLUMN IF NOT EXISTS name VARCHAR(100);

-- Add suspend_until column for reminder suspension feature
ALTER TABLE users
ADD COLUMN IF NOT EXISTS suspend_until TIMESTAMPTZ;

-- Add index for suspend_until to improve query performance
CREATE INDEX IF NOT EXISTS idx_users_suspend_until ON users(suspend_until);

-- Add comment for documentation
COMMENT ON COLUMN users.name IS 'User full name collected during registration';
COMMENT ON COLUMN users.suspend_until IS 'Timestamp until when reminders are suspended for this user';
