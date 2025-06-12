-- Add notification_token column to profiles table
ALTER TABLE profiles
ADD COLUMN notification_token TEXT;

-- Add index for faster lookups
CREATE INDEX idx_profiles_notification_token ON profiles(notification_token);

-- Add comment to explain the column
COMMENT ON COLUMN profiles.notification_token IS 'Firebase Cloud Messaging token for push notifications'; 