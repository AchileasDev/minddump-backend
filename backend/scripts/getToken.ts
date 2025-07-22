import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aqllcenutuqwlwoyckua.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGxjZW51dHVxd2x3b3lja3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODY1NzUsImV4cCI6MjA2MzI2MjU3NX0.sr69yrr54dQrtwR6hhdssezNe_3ylzhhvys06mvhBgo';

const EMAIL = 'testuser@minddump.io';
const PASSWORD = 'TestPassword123';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getJwtToken() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

  if (error) {
    console.error('❌ Error logging in:', error.message);
    return;
  }

  const token = data.session?.access_token;

  if (token) {
    console.log('✅ JWT Token:', token);
  } else {
    console.error('❌ No token returned.');
  }
}

getJwtToken(); 