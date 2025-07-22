const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validateRequired, sanitizeInput } = require('../middleware/validation');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Apply authentication to all routes
router.use(requireAuth);

// Get all dumps for a user
router.get('/', async (req, res, next) => {
  try {
    const { data: dumps, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dumps:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error fetching journal entries' 
      });
    }

    res.json({
      success: true,
      data: dumps,
      count: dumps.length
    });
  } catch (error) {
    next(error);
  }
});

// Get a single dump
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Entry ID is required' 
      });
    }

    const { data: dump, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Not found',
          message: 'Journal entry not found' 
        });
      }
      console.error('Error fetching dump:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error fetching journal entry' 
      });
    }

    res.json({
      success: true,
      data: dump
    });
  } catch (error) {
    next(error);
  }
});

// Create a new dump
router.post('/', sanitizeInput, validateRequired(['content']), async (req, res, next) => {
  try {
    const { content, mood, tags } = req.body;

    // Validate content length
    if (content.length > 10000) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Content is too long (maximum 10,000 characters)' 
      });
    }

    const { data: dump, error } = await supabase
      .from('journal_entries')
      .insert([
        {
          user_id: req.user.id,
          content,
          mood: mood || 'neutral',
          tags: tags || [],
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating dump:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error creating journal entry' 
      });
    }

    res.status(201).json({
      success: true,
      data: dump,
      message: 'Journal entry created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Update a dump
router.put('/:id', sanitizeInput, validateRequired(['content']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, mood, tags } = req.body;

    if (!id) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Entry ID is required' 
      });
    }

    // Validate content length
    if (content.length > 10000) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Content is too long (maximum 10,000 characters)' 
      });
    }

    const { data: dump, error } = await supabase
      .from('journal_entries')
      .update({
        content,
        mood: mood || 'neutral',
        tags: tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Not found',
          message: 'Journal entry not found' 
        });
      }
      console.error('Error updating dump:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error updating journal entry' 
      });
    }

    res.json({
      success: true,
      data: dump,
      message: 'Journal entry updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete a dump
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Entry ID is required' 
      });
    }

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error deleting dump:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error deleting journal entry' 
      });
    }

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 