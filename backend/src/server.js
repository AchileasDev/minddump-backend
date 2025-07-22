require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Only load config if environment variables are available
let config;
try {
  const { getConfig } = require('./config/env');
  config = getConfig();
} catch (error) {
  // Fallback config for build/deployment environments
  config = {
    server: { nodeEnv: process.env.NODE_ENV || 'production' },
    app: { siteUrl: process.env.SITE_URL || 'https://minddump.vercel.app' }
  };
}

// Conditionally load routes only if environment variables are available
let dumpRoutes, userRoutes, stripeRoutes, aiRoutes, weeklyStatsRoutes, statsRoutes, notificationsRoutes, handleStripeWebhook, errorHandler;

try {
  dumpRoutes = require('./routes/dumpRoutes');
  userRoutes = require('./routes/userRoutes');
  stripeRoutes = require('./routes/stripeRoutes');
  aiRoutes = require('./routes/aiRoutes');
  weeklyStatsRoutes = require('./routes/weeklyStats');
  statsRoutes = require('./routes/statsRoutes');
  notificationsRoutes = require('./routes/notificationsRoutes');
  const stripeController = require('./controllers/stripeController');
  handleStripeWebhook = stripeController.handleStripeWebhook;
  const errorHandlerModule = require('./middleware/errorHandler');
  errorHandler = errorHandlerModule.errorHandler;
} catch (error) {
  console.log('Routes not loaded due to missing environment variables:', error.message);
  // Create placeholder routes
  const express = require('express');
  const placeholderRouter = express.Router();
  placeholderRouter.get('*', (req, res) => {
    res.status(503).json({ error: 'Service unavailable', message: 'Environment not configured' });
  });
  
  dumpRoutes = placeholderRouter;
  userRoutes = placeholderRouter;
  stripeRoutes = placeholderRouter;
  aiRoutes = placeholderRouter;
  weeklyStatsRoutes = placeholderRouter;
  statsRoutes = placeholderRouter;
  notificationsRoutes = placeholderRouter;
  
  handleStripeWebhook = (req, res) => {
    res.status(503).json({ error: 'Service unavailable', message: 'Environment not configured' });
  };
  
  errorHandler = (err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error', message: err.message });
  };
}
const app = express();

app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      config.app.siteUrl,
      'https://minddump.vercel.app',
      'https://minddump-frontend.vercel.app',
      'https://minddump-git-main.vercel.app'
    ].filter(Boolean);
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

if (config.server.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'MindDump Backend is running',
    version: '1.0.0',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/dumps', dumpRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weekly-stats', weeklyStatsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api-docs', (req, res) => {
  res.json({
    message: 'MindDump API Documentation',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      apiHealth: 'GET /api/health',
      dumps: 'GET/POST/PUT/DELETE /api/dumps',
      users: 'GET/PUT /api/users',
      stripe: 'POST /api/stripe/*',
      ai: 'POST/GET /api/ai/*',
      stats: 'GET/POST /api/stats/*',
      notifications: 'GET /api/notifications/*'
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

module.exports = app; 