const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Development mode: allow dev-token for testing
    if (process.env.NODE_ENV === 'development' && token === 'dev-token') {
      req.user = { id: 1, email: 'dev@example.com' }; // Mock user for development
      return next();
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Add user to request object
    req.user = user;
    
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

    const token = authHeader.split('Bearer ')[1];
    
    // Development mode: allow dev-token for testing
    if (process.env.NODE_ENV === 'development' && token === 'dev-token') {
      req.user = { id: 1, email: 'dev@example.com' }; // Mock user for development
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    req.user = user && user.is_active ? user : null;
    
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
  1000, // 1000 requests per window (increased from 5)
  'Too many authentication attempts, please try again later'
);

const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5000, // 5000 requests per window (increased from 100)
  'Too many API requests, please try again later'
);

const calculationRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  200, // 200 calculations per minute (increased from 20)
  'Too many calculations, please slow down'
);

// Very generous rate limits for profile and stats endpoints
const profileStatsRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  1000, // 1000 requests per minute for profile/stats
  'Too many profile/stats requests, please slow down'
);

module.exports = {
  verifyToken,
  optionalAuth,
  authRateLimit,
  apiRateLimit,
  calculationRateLimit,
  profileStatsRateLimit
};
