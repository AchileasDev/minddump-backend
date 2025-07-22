const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Admin Client using service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware: requireAuth
const requireAuth = async (req, res, next) => {
  // Get token from Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'No authentication token provided' 
    });
  }

  try {
    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Invalid or expired authentication token' 
      });
    }

    // Fetch the user's profile from the 'profiles' table to get the role and other details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ 
        error: 'Profile not found',
        message: 'User profile not found' 
      });
    }

    // Attach the full user profile (including role) to the request object
    req.user = profile;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Authentication failed due to an unexpected error' 
    });
  }
};

// Middleware: requirePremium
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Authentication required to check premium status' 
    });
  }
  
  if (req.user.role !== 'premium') {
    return res.status(403).json({ 
      error: 'Premium required',
      message: 'Premium access required for this feature' 
    });
  }
  next();
};

// Middleware: requireAdmin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Authentication required to check admin status' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin required',
      message: 'Admin access required for this feature' 
    });
  }
  next();
};

module.exports = { requireAuth, requirePremium, requireAdmin }; 