import rateLimit from 'express-rate-limit';

// Authentication rate limiter (5 requests per 15 minutes)
export const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5', 10),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter (100 requests per minute)
export const generalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW_MS || '60000', 10), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || '100', 10),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter (10 requests per minute)
export const uploadRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS || '60000', 10), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || '10', 10),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many upload requests. Please try again later.',
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Report generation rate limiter (5 requests per 5 minutes)
export const reportRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_REPORT_WINDOW_MS || '300000', 10), // 5 minutes
  max: parseInt(process.env.RATE_LIMIT_REPORT_MAX || '5', 10),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many report generation requests. Please try again later.',
    },
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});


