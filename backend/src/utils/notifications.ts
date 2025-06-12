import { createServerClient } from '@supabase/ssr';

/**
 * Fetches the notification token for a given user from the profiles table
 * @param userId - The ID of the user to fetch the token for
 * @returns The notification token if found, null otherwise
 */
export async function getNotificationTokenForUser(userId: string): Promise<string | null> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
      }
    );

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('notification_token')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching notification token:', error);
      return null;
    }

    return profile?.notification_token || null;
  } catch (error) {
    console.error('Unexpected error fetching notification token:', error);
    return null;
  }
} 