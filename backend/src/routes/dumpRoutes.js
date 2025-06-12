const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get all dumps for a user
router.get('/', auth, async (req, res) => {
  try {
    const { data: dumps, error } = await supabase
      .from('dumps')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(dumps);
  } catch (error) {
    console.error('Error fetching dumps:', error);
    res.status(500).json({ message: 'Error fetching dumps' });
  }
});

// Get a single dump
router.get('/:id', auth, async (req, res) => {
  try {
    const { data: dump, error } = await supabase
      .from('dumps')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!dump) {
      return res.status(404).json({ message: 'Dump not found' });
    }

    res.json(dump);
  } catch (error) {
    console.error('Error fetching dump:', error);
    res.status(500).json({ message: 'Error fetching dump' });
  }
});

// Create a new dump
router.post('/', auth, async (req, res) => {
  try {
    const { content, mood, tags } = req.body;

    const { data: dump, error } = await supabase
      .from('dumps')
      .insert([
        {
          user_id: req.user.id,
          content,
          mood,
          tags,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(dump);
  } catch (error) {
    console.error('Error creating dump:', error);
    res.status(500).json({ message: 'Error creating dump' });
  }
});

// Update a dump
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, mood, tags } = req.body;

    const { data: dump, error } = await supabase
      .from('dumps')
      .update({
        content,
        mood,
        tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!dump) {
      return res.status(404).json({ message: 'Dump not found' });
    }

    res.json(dump);
  } catch (error) {
    console.error('Error updating dump:', error);
    res.status(500).json({ message: 'Error updating dump' });
  }
});

// Delete a dump
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('dumps')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Dump deleted successfully' });
  } catch (error) {
    console.error('Error deleting dump:', error);
    res.status(500).json({ message: 'Error deleting dump' });
  }
});

module.exports = router; 