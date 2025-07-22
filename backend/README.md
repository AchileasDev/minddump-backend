# MindDump Backend

A modern, secure, and scalable backend API for the MindDump journaling application.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with Supabase
- **Premium Features**: Role-based access control for premium users
- **AI Integration**: OpenAI-powered text analysis and insights
- **Payment Processing**: Stripe integration for subscriptions
- **Real-time Notifications**: Firebase push notifications
- **Comprehensive Error Handling**: Consistent error responses and logging
- **Input Validation**: Robust validation and sanitization
- **Rate Limiting**: Built-in rate limiting for API protection

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.js                 # Environment configuration
│   ├── controllers/
│   │   ├── stripeController.js    # Stripe webhook handling
│   │   └── userController.js      # User management
│   ├── middleware/
│   │   ├── auth.js                # Authentication middleware
│   │   ├── errorHandler.js        # Global error handling
│   │   └── validation.js          # Input validation
│   ├── routes/
│   │   ├── aiRoutes.js            # AI analysis endpoints
│   │   ├── dumpRoutes.js          # Journal entries CRUD
│   │   ├── notificationsRoutes.js # Notification management
│   │   ├── statsRoutes.js         # User statistics
│   │   ├── stripeRoutes.js        # Payment processing
│   │   ├── userRoutes.js          # User management
│   │   └── weeklyStats.js         # Weekly statistics
│   ├── services/
│   │   └── notificationService.ts # Firebase notifications
│   ├── utils/
│   │   ├── aiUtils.js             # AI integration utilities
│   │   ├── notifications.ts       # Notification utilities
│   │   ├── promptUtils.js         # AI prompt generation
│   │   └── userRole.js            # User role utilities
│   └── server.js                  # Main server file
├── scripts/
│   └── sendScheduledNotifications.js # Scheduled notification script
├── package.json
└── README.md
```

## 🛠️ Setup

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account
- Stripe account
- OpenAI API key
- Firebase project (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   # Required
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PRICE_ID=your_stripe_price_id
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   OPENAI_API_KEY=your_openai_api_key
   
   # Optional
   NODE_ENV=development
   PORT=5000
   HOST=localhost
   SITE_URL=http://localhost:3000
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **user**: Basic access to journal entries
- **premium**: Access to AI features and advanced statistics
- **admin**: Full system access

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Journal Entries
- `GET /api/dumps` - Get all entries
- `GET /api/dumps/:id` - Get specific entry
- `POST /api/dumps` - Create new entry
- `PUT /api/dumps/:id` - Update entry
- `DELETE /api/dumps/:id` - Delete entry

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/delete-account` - Delete account
- `GET /api/users/export-data` - Export user data
- `POST /api/users/toggle-notifications` - Toggle notifications

### AI Features (Premium)
- `POST /api/ai/analyze` - Analyze text
- `POST /api/ai/analyze-dump` - Analyze journal entry
- `POST /api/ai/insights` - Generate insights from multiple entries
- `GET /api/ai/summary/weekly` - Weekly summary
- `POST /api/ai/reprocess` - Reprocess entries with AI

### Statistics
- `GET /api/stats/mood-history` - Mood history
- `GET /api/stats/keywords` - Keyword analysis (Premium)
- `GET /api/stats/weekly` - Weekly statistics (Premium)
- `POST /api/stats/start-trial` - Start premium trial

### Payments
- `POST /api/stripe/create-checkout-session` - Create subscription
- `GET /api/stripe/subscription-status` - Check subscription
- `POST /api/stripe/cancel-subscription` - Cancel subscription
- `POST /api/stripe/resume-subscription` - Resume subscription

### Notifications
- `GET /api/notifications/daily-check` - Check for notifications

## 🔒 Security Features

- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for allowed origins
- **Helmet Security**: Security headers and CSP
- **Error Handling**: Secure error responses (no sensitive data leaked)
- **Authentication**: JWT-based authentication with role-based access

## 🐛 Error Handling

All API responses follow a consistent format:

```json
{
  "success": true/false,
  "data": {...},
  "error": "error_type",
  "message": "Human readable message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📊 Logging

- **Development**: Detailed logging with Morgan
- **Production**: Structured logging for monitoring
- **Error Logging**: Comprehensive error tracking with stack traces

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production.

### Process Management
Use PM2 or similar for process management:

```bash
npm install -g pm2
pm2 start src/server.js --name minddump-backend
```

### Health Checks
Monitor the `/health` endpoint for uptime monitoring.

## 🔧 Development

### Running Tests
```bash
npm test
```

### Code Style
The project follows standard JavaScript conventions with ESLint.

### Database Migrations
Database schema is managed through Supabase migrations.

## 📝 Recent Improvements

### ✅ Fixed Issues
- **Authentication**: Consistent middleware usage across all routes
- **Database**: Migrated from MongoDB to Supabase
- **Error Handling**: Standardized error responses and logging
- **Validation**: Added comprehensive input validation
- **Security**: Enhanced security with proper CORS and rate limiting
- **Code Organization**: Cleaned up file structure and removed unused code

### 🔄 Improvements Made
- Added environment configuration validation
- Implemented proper error handling middleware
- Added input sanitization and validation
- Enhanced security with Helmet and CORS
- Standardized API response format
- Added comprehensive logging
- Improved code organization and documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 