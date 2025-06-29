const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

// This is the admin client, which can bypass RLS
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/user/request-password-reset
router.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    // The regular client is fine here as we are not accessing protected data
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.SITE_URL}/reset-password`,
    });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Password reset email sent.' });
});


// All routes below require authentication
router.use(requireAuth);

// POST /api/user/delete-account
router.post('/delete-account', async (req, res) => {
    const { id } = req.user;

    // First, delete from the 'profiles' table
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', id);

    if (profileError) {
        console.error('Error deleting profile:', profileError);
        return res.status(500).json({ error: 'Failed to delete user profile.' });
    }

    // Then, delete the user from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
        console.error('Error deleting auth user:', authError);
        return res.status(500).json({ error: 'Failed to delete user from auth.' });
    }
    
    res.status(200).json({ message: 'Account deleted successfully.' });
});

// GET /api/user/export-dumps
router.get('/export-dumps', async (req, res) => {
    const { id } = req.user;

    const { data: entries, error } = await supabaseAdmin
        .from('journal_entries')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: true });

    if (error) {
        return res.status(500).json({ error: 'Failed to fetch user entries.' });
    }
    
    const filename = `minddump-export-${id}-${new Date().toISOString()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(JSON.stringify(entries, null, 2));
});

// POST /api/user/toggle-notifications
router.post('/toggle-notifications', async (req, res) => {
    const { id } = req.user;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'Invalid "enabled" property.' });
    }

    const { error } = await supabaseAdmin
        .from('profiles')
        .update({ notifications_enabled: enabled })
        .eq('id', id);

    if (error) {
        return res.status(500).json({ error: 'Failed to update notification settings.' });
    }

    res.status(200).json({ message: 'Notification settings updated.' });
});

// The following routes are proxies to Supabase Edge Functions
// This is not ideal, but we will keep it for now to match existing functionality.
// A better approach would be to replicate the logic of the edge functions here.

// POST /api/user/update-questions
router.post('/update-questions', async (req, res) => {
    try {
        const { entryId, questions } = req.body;
        // Basic validation
        if (!entryId || !Array.isArray(questions)) {
             return res.status(400).json({ error: 'Invalid input.' });
        }
        const response = await fetch(
            `${process.env.SUPABASE_URL}/functions/v1/update-questions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({ entryId, questions, userId: req.user.id }),
            }
        );
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/user/toggle-favorite
router.post('/toggle-favorite', async (req, res) => {
    try {
        const { entryId, question } = req.body;
        if (!entryId || !question) {
            return res.status(400).json({ error: 'Invalid input.' });
        }
        const response = await fetch(
            `${process.env.SUPABASE_URL}/functions/v1/toggle-favorite`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 
                },
                body: JSON.stringify({ entryId, question, userId: req.user.id }),
            }
        );
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;