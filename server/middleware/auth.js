const admin = require('firebase-admin');
const { User } = require('../models');

// Initialize Firebase Admin (will be configured in main server file)
let firebaseAdmin = null;

const initializeFirebase = (serviceAccount) => {
  if (!firebaseAdmin) {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return firebaseAdmin;
};

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!firebaseAdmin) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    // Verify the ID token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    
    // Get or create user in our database
    let user = await User.findOne({ where: { firebase_uid: decodedToken.uid } });
    
    if (!user) {
      // Create new user
      user = await User.create({
        firebase_uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || null,
        avatar_url: decodedToken.picture || null,
        last_login: new Date()
      });
    } else {
      // Update last login
      await user.update({ last_login: new Date() });
    }

    // Add user to request object
    req.user = user;
    req.firebaseUser = decodedToken;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional authentication middleware (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!firebaseAdmin) {
      req.user = null;
      return next();
    }

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ where: { firebase_uid: decodedToken.uid } });
    
    req.user = user;
    req.firebaseUser = decodedToken;
    
    next();
  } catch (error) {
    // If token is invalid, continue without user
    req.user = null;
    next();
  }
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many authentication attempts, please try again later'
);

const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many API requests, please try again later'
);

const calculationRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  20, // 20 calculations per minute
  'Too many calculations, please slow down'
);

module.exports = {
  initializeFirebase,
  verifyToken,
  optionalAuth,
  authRateLimit,
  apiRateLimit,
  calculationRateLimit
};
