# MindDump Backend Deployment Guide

## Vercel Deployment

This backend is configured for deployment on Vercel.

### Prerequisites

1. Vercel account
2. All environment variables configured
3. Supabase project set up
4. Stripe account configured

### Environment Variables Required

#### Required Variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PRICE_ID` - Your Stripe price ID for subscriptions
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

#### Optional Variables:
- `NODE_ENV` - Set to "production" for production
- `PORT` - Port number (Vercel sets this automatically)
- `HOST` - Host (Vercel sets this automatically)
- `SITE_URL` - Frontend URL (default: https://minddump.vercel.app)
- `FIREBASE_PROJECT_ID` - Firebase project ID for notifications
- `FIREBASE_CLIENT_EMAIL` - Firebase client email
- `FIREBASE_PRIVATE_KEY` - Firebase private key
- `GEMINI_API_KEY` - Google Gemini API key
- `DAILY_CHECK_API_KEY` - API key for daily check endpoint

### Deployment Steps

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd backend
   vercel --prod
   ```

4. **Set Environment Variables:**
   - Go to Vercel Dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all required variables

5. **Redeploy after setting environment variables:**
   ```bash
   vercel --prod
   ```

### API Endpoints

After deployment, your API will be available at:
- Health Check: `https://your-project.vercel.app/health`
- API Docs: `https://your-project.vercel.app/api-docs`
- All API endpoints: `https://your-project.vercel.app/api/*`

### CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)
- `https://minddump.vercel.app` (production)
- `https://minddump-frontend.vercel.app` (production)
- `https://minddump-git-main.vercel.app` (production)

### Troubleshooting

1. **Environment Variables Missing:**
   - Check Vercel Dashboard > Settings > Environment Variables
   - Ensure all required variables are set

2. **CORS Errors:**
   - Update CORS configuration in `src/server.js`
   - Add your frontend domain to allowed origins

3. **Database Connection Issues:**
   - Verify Supabase credentials
   - Check Supabase project status

4. **Stripe Webhook Issues:**
   - Update webhook URL in Stripe Dashboard
   - Verify webhook secret

### Local Development

For local development:
```bash
cd backend
npm install
npm run dev
```

The server will start on `http://localhost:5000` 