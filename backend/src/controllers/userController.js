const { createClient } = require('@supabase/supabase-js');
const { AppError } = require('../middleware/errorHandler');

// Initialize Supabase Admin Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription_status: user.subscription_status,
        trial_ends_at: user.trial_ends_at,
        notifications_enabled: user.notifications_enabled,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name && !email) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'At least one field (name or email) is required' 
      });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();

    // Check if email is already in use by another user
    if (email) {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .neq('id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking email uniqueness:', checkError);
        return res.status(500).json({ 
          error: 'Database error',
          message: 'Error checking email availability' 
        });
      }

      if (existingUser) {
        return res.status(400).json({ 
          error: 'Email already in use',
          message: 'This email is already registered by another user' 
        });
      }
    }

    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error updating user profile' 
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete user's journal entries first
    const { error: entriesError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('user_id', userId);

    if (entriesError) {
      console.error('Error deleting user entries:', entriesError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error deleting user data' 
      });
    }

    // Delete user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error deleting user profile' 
      });
    }

    // Delete user from auth (this should be done by the frontend or a separate admin function)
    // For now, we'll just delete the profile and let the frontend handle auth deletion

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Export user data
const exportData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all user's journal entries
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching user entries:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error fetching user data' 
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error fetching user profile' 
      });
    }

    const exportData = {
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        created_at: profile.created_at
      },
      journal_entries: entries,
      export_date: new Date().toISOString(),
      total_entries: entries.length
    };

    const filename = `minddump-export-${userId}-${new Date().toISOString().split('T')[0]}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    next(error);
  }
};

// Toggle notifications
const toggleNotifications = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    const userId = req.user.id;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Enabled must be a boolean value' 
      });
    }

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ notifications_enabled: enabled })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating notification settings:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error updating notification settings' 
      });
    }

    res.status(200).json({
      success: true,
      data: { notifications_enabled: updatedUser.notifications_enabled },
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, subscription_status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error fetching users' 
      });
    }

    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    next(error);
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!role || !['user', 'premium', 'admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Valid role (user, premium, or admin) is required' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'User ID is required' 
      });
    }

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Not found',
          message: 'User not found' 
        });
      }
      console.error('Error updating user role:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error updating user role' 
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User role updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  exportData,
  toggleNotifications,
  getAllUsers,
  updateUserRole
}; 