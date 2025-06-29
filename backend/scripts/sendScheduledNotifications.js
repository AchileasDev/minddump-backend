const { NotificationService } = require('../src/services/notificationService.ts');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

async function sendScheduledNotifications() {
  // Βρες όλους τους χρήστες με notifications_enabled = true και notification_token συμπληρωμένο
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, notification_token')
    .eq('notifications_enabled', true)
    .not('notification_token', 'is', null);

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users to notify.');
    return;
  }

  // Μήνυμα υπενθύμισης
  const payload = {
    title: 'MindDump Reminder',
    body: 'Μην ξεχάσεις να γράψεις τις σκέψεις σου στο MindDump σήμερα!',
    icon: '/icons/notification-icon.png',
    data: { type: 'reminder', timestamp: new Date().toISOString() }
  };

  // Στείλε notification σε κάθε χρήστη
  for (const user of users) {
    await NotificationService.sendToUser(user.id, payload);
  }

  console.log(`Sent scheduled notifications to ${users.length} users.`);
}

// Αν το script τρέχει απευθείας, εκτέλεσέ το
if (require.main === module) {
  sendScheduledNotifications().catch(console.error);
}

module.exports = { sendScheduledNotifications }; 