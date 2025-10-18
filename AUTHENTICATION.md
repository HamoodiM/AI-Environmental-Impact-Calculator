# Authentication System

## Overview

The AI Environmental Impact Calculator uses a robust authentication system built on Firebase Authentication with backend API integration. This hybrid approach provides secure user management while maintaining data persistence through our custom backend.

## Architecture

### Firebase Authentication
- **Purpose**: Handles user authentication, registration, and session management
- **Services Used**: 
  - Email/Password authentication
  - Google OAuth
  - GitHub OAuth
  - Password reset functionality

### Backend API Integration
- **Purpose**: Manages user profiles, preferences, and application data
- **Benefits**: 
  - Full control over data structure
  - Custom business logic
  - Better performance and reliability
  - No Firestore connection issues

## Key Features

### ✅ Secure Authentication
- Firebase Authentication for secure user management
- JWT token-based API authentication
- Automatic token refresh and validation

### ✅ Multiple Sign-in Methods
- Email and password registration/login
- Google OAuth integration
- GitHub OAuth integration
- Password reset functionality

### ✅ User Profile Management
- Backend API handles all user data
- Real-time profile updates
- User preferences management
- Statistics and analytics tracking

### ✅ Error Handling
- Graceful error handling for all authentication operations
- User-friendly error messages
- Automatic retry mechanisms

## Technical Implementation

### Firebase Configuration
```javascript
// Firebase is configured for authentication only
// Firestore is intentionally disabled to prevent connection issues
export const auth = getAuth(app);
export const db = null; // Disabled for reliability
```

### Authentication Context
The `AuthContext` provides a centralized authentication state management system:

```javascript
const {
  // State
  currentUser,     // Firebase user object
  userProfile,     // Backend user profile
  loading,         // Loading state
  error,           // Error state
  
  // Authentication methods
  signup,          // Register new user
  login,           // Sign in with email/password
  signInWithGoogle, // Google OAuth
  signInWithGithub, // GitHub OAuth
  resetPassword,   // Password reset
  
  // Profile management
  updateProfile,   // Update user profile
  updatePreferences, // Update user preferences
  getUserStats,    // Get user statistics
} = useAuth();
```

## Security Features

### Token Management
- Automatic JWT token generation and validation
- Secure token storage and transmission
- Development mode token bypass for testing

### Data Protection
- All sensitive operations require authentication
- User data is isolated and protected
- Secure API endpoints with proper authorization

## Development vs Production

### Development Mode
- Uses `dev-token` for API authentication
- Simplified authentication flow
- Enhanced debugging and logging

### Production Mode
- Full Firebase Authentication integration
- Secure JWT token validation
- Production-grade security measures

## Error Handling

The authentication system includes comprehensive error handling:

- **Network Errors**: Automatic retry with user feedback
- **Authentication Errors**: Clear error messages and recovery options
- **API Errors**: Graceful degradation and fallback mechanisms

## Usage Examples

### Basic Authentication
```javascript
import { useAuth } from '../contexts/AuthContext';

function LoginComponent() {
  const { login, error, loading } = useAuth();
  
  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // User is now authenticated
    } catch (error) {
      // Handle authentication error
    }
  };
}
```

### Social Authentication
```javascript
const { signInWithGoogle, signInWithGithub } = useAuth();

// Google sign-in
await signInWithGoogle();

// GitHub sign-in
await signInWithGithub();
```

### Profile Management
```javascript
const { updateProfile, updatePreferences } = useAuth();

// Update user profile
await updateProfile({ name: 'New Name' });

// Update preferences
await updatePreferences({ theme: 'dark' });
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Firebase configuration
   - Verify API endpoints are accessible
   - Ensure proper environment variables

2. **Token Issues**
   - Clear browser cache and cookies
   - Check network connectivity
   - Verify backend API status

3. **Profile Loading Issues**
   - Check backend API connectivity
   - Verify user permissions
   - Review API response format

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Social login providers (LinkedIn, Twitter)
- [ ] Advanced user analytics
- [ ] Role-based access control
- [ ] Session management improvements

## Contributing

When working with the authentication system:

1. Always test in both development and production modes
2. Follow the established error handling patterns
3. Update documentation for any new features
4. Ensure backward compatibility with existing user data

---

*This authentication system provides a solid foundation for secure user management while maintaining flexibility for future enhancements.*
