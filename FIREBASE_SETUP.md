# Firebase Setup Guide

## Quick Setup (Recommended for Development)

The application is configured to work in **development mode** without requiring a real Firebase project. The authentication will use mock tokens and the backend will handle user management.

### Option 1: Use Development Mode (No Firebase Required)

1. The app is already configured to work in development mode
2. Set `REACT_APP_NODE_ENV=development` in your `.env` file
3. The app will use mock authentication tokens
4. All user data is managed by the backend API

### Option 2: Set Up Real Firebase Project

If you want to use real Firebase authentication:

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Name it `ai-eco-impact-calculator` (or any name you prefer)

2. **Enable Authentication:**
   - In the Firebase Console, go to "Authentication" > "Sign-in method"
   - Enable "Email/Password" authentication
   - Optionally enable "Google" and "GitHub" providers

3. **Get Configuration:**
   - Go to "Project Settings" > "General" > "Your apps"
   - Click "Add app" > "Web app" (</> icon)
   - Copy the configuration object

4. **Update Environment Variables:**
   - Update `client/.env` with your Firebase configuration:
   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

5. **Configure Authentication Domain:**
   - In Firebase Console > Authentication > Settings
   - Add `localhost:3000` to authorized domains

## Current Configuration

The app is currently configured with these default values:
- **Project ID:** `ai-eco-impact-calculator`
- **Auth Domain:** `ai-eco-impact-calculator.firebaseapp.com`

## Troubleshooting

### "Firebase not initialized" Error

This error occurs when:
1. The Firebase project doesn't exist
2. The configuration is incorrect
3. Network connectivity issues

**Solutions:**
1. **Use Development Mode:** Set `REACT_APP_NODE_ENV=development` in your `.env` file
2. **Create Firebase Project:** Follow Option 2 above
3. **Check Network:** Ensure you have internet connectivity

### Development Mode Features

When `REACT_APP_NODE_ENV=development`:
- Uses mock authentication tokens (`dev-token`)
- All authentication is handled by the backend
- No real Firebase connection required
- Perfect for local development and testing

## Environment Variables

### Client (.env)
```env
# Firebase Configuration (optional in development)
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Development Configuration
REACT_APP_NODE_ENV=development
REACT_APP_API_URL=http://localhost:5001
```

### Server (.env)
```env
# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
```

## Next Steps

1. **For Development:** The app should work immediately with the current configuration
2. **For Production:** Set up a real Firebase project following Option 2
3. **For Testing:** Use development mode with mock authentication

The application is designed to work seamlessly in both development and production modes!
