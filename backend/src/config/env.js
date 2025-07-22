/**
 * Environment configuration and validation
 */

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_ID',
  'STRIPE_WEBHOOK_SECRET'
];

const optionalEnvVars = {
  'NODE_ENV': 'development',
  'PORT': '5000',
  'HOST': 'localhost',
  'SITE_URL': 'https://minddump.vercel.app',
  'FIREBASE_PROJECT_ID': '',
  'FIREBASE_CLIENT_EMAIL': '',
  'FIREBASE_PRIVATE_KEY': '',
  'GEMINI_API_KEY': '',
  'DAILY_CHECK_API_KEY': ''
};

// Validate required environment variables
const validateEnv = () => {
  const missing = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Get environment configuration
const getConfig = () => {
  validateEnv();
  
  return {
    // Supabase
    supabase: {
      url: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      anonKey: process.env.SUPABASE_ANON_KEY
    },
    
    // Stripe
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      priceId: process.env.STRIPE_PRICE_ID,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    
    // OpenAI
    // openai: {
    //   apiKey: process.env.OPENAI_API_KEY
    // },
    
    // Firebase (optional)
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      privateKey: process.env.FIREBASE_PRIVATE_KEY || ''
    },
    
    // Server
    server: {
      port: parseInt(process.env.PORT) || 5000,
      host: process.env.HOST || 'localhost',
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    
    // App
    app: {
      siteUrl: process.env.SITE_URL || 'http://localhost:3000'
    }
  };
};

module.exports = {
  validateEnv,
  getConfig
}; 