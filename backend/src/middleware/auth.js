const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid token format' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });

  req.user = data.user;
  next();
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