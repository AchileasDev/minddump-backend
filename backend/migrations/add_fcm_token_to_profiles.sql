-- Migration: Add FCM token and notifications_enabled columns to profiles table
-- Date: 2024-01-XX
-- Description: Adds support for Firebase Cloud Messaging tokens and notification preferences

-- Add FCM token column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Add notifications enabled column with default value
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token ON profiles(fcm_token);
CREATE INDEX IF NOT EXISTS idx_profiles_notifications_enabled ON profiles(notifications_enabled);

-- Add comment for documentation
COMMENT ON COLUMN profiles.fcm_token IS 'Firebase Cloud Messaging token for push notifications';
COMMENT ON COLUMN profiles.notifications_enabled IS 'Whether the user has enabled push notifications'; 