import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Check if running on serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV;

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Only create logs directory and file transports if NOT on serverless
const transports: winston.transport[] = [
  // Write all logs to console (works everywhere)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    ),
  }),
];

// Only add file transports if NOT on serverless (can't write files in serverless)
if (!isServerless) {
  const logsDir = path.join(process.cwd(), 'logs');
  
  // Create logs directory if it doesn't exist (only in non-serverless environments)
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Write all logs with level 'error' and below to error.log
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
      })
    );
    
    // Write all logs to combined.log
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
      })
    );
  } catch (error) {
    // If we can't create logs directory, just use console transport
    console.warn('Could not create logs directory, using console transport only:', error);
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'digital-iskole-backend' },
  transports,
});

// If we're not in production, log to the console with simpler format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

export default logger;


