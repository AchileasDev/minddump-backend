# Firebase Push Notifications Setup Guide

This guide will help you set up Firebase Push Notifications for the MindDump web app.

## Prerequisites

1. A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
2. Node.js and npm installed
3. Access to your Supabase database

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "minddump-v1")
4. Follow the setup wizard

### 1.2 Enable Cloud Messaging
1. In your Firebase project, go to **Project Settings** (gear icon)
2. Go to the **Cloud Messaging** tab
3. Generate a new **Web Push certificate** (VAPID key)
4. Copy the **VAPID key** - you'll need this for the frontend

### 1.3 Get Web App Configuration
1. In **Project Settings** > **General** tab
2. Scroll down to "Your apps" section
3. Click the web app icon (</>) to add a web app
4. Register your app with a nickname (e.g., "MindDump Web")
5. Copy the Firebase configuration object

### 1.4 Generate Service Account Key
1. In **Project Settings** > **Service accounts** tab
2. Click "Generate new private key"
3. Download the JSON file
4. Keep this file secure - it contains sensitive credentials

## Step 2: Environment Variables

### Frontend (.env.local)
Add these variables to your `frontend/.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Backend (.env)
Add these variables to your `backend/.env` file:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Other existing variables...
```

## Step 3: Database Schema Update

Make sure your Supabase `profiles` table has the `fcm_token` column:

```sql
-- Add FCM token column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS fcm_token TEXT,
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
```

## Step 4: Testing the Setup

### 4.1 Start the Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4.2 Test the Notification System
1. Open your app in a browser
2. Go to `/account` page
3. Click "Enable Notifications" when prompted
4. Grant notification permission
5. Click "Send Test Notification" to verify it works

## Step 5: Production Deployment

### 5.1 Update Environment Variables
- Set `NEXT_PUBLIC_API_BASE_URL` to your production backend URL
- Ensure all Firebase keys are properly set in your hosting platform

### 5.2 Service Worker
The service worker (`firebase-messaging-sw.js`) is already configured and will be automatically served from the `/public` directory.

### 5.3 HTTPS Requirement
Push notifications require HTTPS in production. Make sure your hosting platform provides SSL certificates.

## Troubleshooting

### Common Issues

1. **"Firebase messaging is not supported"**
   - Check if you're using HTTPS (required for notifications)
   - Ensure the browser supports Push API

2. **"VAPID key not found"**
   - Verify `NEXT_PUBLIC_FIREBASE_VAPID_KEY` is set correctly
   - Check that the VAPID key was generated in Firebase Console

3. **"Firebase Admin SDK not initialized"**
   - Verify backend environment variables are set
   - Check that the service account JSON was parsed correctly

4. **"Invalid token" errors**
   - Tokens expire and need to be refreshed
   - Users need to re-enable notifications if tokens become invalid

### Debug Steps

1. Check browser console for errors
2. Verify Firebase configuration in browser console
3. Check backend logs for Firebase Admin SDK errors
4. Test with a fresh browser session

## Security Notes

- Never commit `.env` files to version control
- Keep Firebase service account keys secure
- Use environment variables for all sensitive configuration
- Regularly rotate VAPID keys in production

## Additional Features

The notification system includes:
- Daily reminders for users who haven't journaled in 3+ days
- Test notifications for verification
- Foreground and background message handling
- Click actions to open the app
- Proper error handling and user feedback

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure Firebase project is properly configured
4. Test with a different browser to isolate issues 