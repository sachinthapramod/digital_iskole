import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalRateLimiter } from './middleware/rateLimit.middleware';
import logger from './utils/logger';

// Load environment variables from backend/.env
// Try multiple possible paths to find .env file
const envPath = path.resolve(process.cwd(), '.env');
const envPathAlt = path.resolve(__dirname, '../.env');
const finalEnvPath = fs.existsSync(envPath) ? envPath : envPathAlt;
dotenv.config({ path: finalEnvPath });

// Import routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import academicRoutes from './routes/academic.routes';
import attendanceRoutes from './routes/attendance.routes';
import examsRoutes from './routes/exams.routes';
import marksRoutes from './routes/marks.routes';
import appointmentsRoutes from './routes/appointments.routes';
import noticesRoutes from './routes/notices.routes';
import notificationsRoutes from './routes/notifications.routes';
import reportsRoutes from './routes/reports.routes';
import settingsRoutes from './routes/settings.routes';
import uploadRoutes from './routes/upload.routes';

const app: Express = express();

// Security middleware
app.use(helmet());
// CORS: allow frontend origin(s). Use comma-separated list for multiple (e.g. production + preview).
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const corsOrigins = corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);
app.use(
  cors({
    origin: corsOrigins.length > 1 ? (origin, cb) => {
      if (!origin || corsOrigins.includes(origin)) cb(null, true);
      else cb(null, corsOrigins[0]);
    } : corsOrigins[0] || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Root: friendly response when visiting backend URL in browser
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Digital Iskole API',
    docs: 'Use /health for health check. API routes are under /api (e.g. /api/auth/login).',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
const apiBasePath = process.env.API_BASE_URL?.replace(/^https?:\/\/[^/]+/, '') || '/api';

// API root: friendly response when visiting backend API base URL (e.g. GET /api)
app.get(apiBasePath, (_req, res) => {
  res.json({
    success: true,
    message: 'Digital Iskole API',
    docs: 'Use /health for health check. Endpoints: auth, users, academic, attendance, exams, marks, appointments, notices, notifications, reports, settings, upload.',
    timestamp: new Date().toISOString(),
  });
});
app.get(`${apiBasePath}/`, (_req, res) => {
  res.json({
    success: true,
    message: 'Digital Iskole API',
    docs: 'Use /health for health check. Endpoints: auth, users, academic, attendance, exams, marks, appointments, notices, notifications, reports, settings, upload.',
    timestamp: new Date().toISOString(),
  });
});

app.use(`${apiBasePath}/auth`, authRoutes);
app.use(`${apiBasePath}/users`, generalRateLimiter, usersRoutes);
app.use(`${apiBasePath}/academic`, generalRateLimiter, academicRoutes);
app.use(`${apiBasePath}/attendance`, generalRateLimiter, attendanceRoutes);
app.use(`${apiBasePath}/exams`, generalRateLimiter, examsRoutes);
app.use(`${apiBasePath}/marks`, generalRateLimiter, marksRoutes);
app.use(`${apiBasePath}/appointments`, generalRateLimiter, appointmentsRoutes);
app.use(`${apiBasePath}/notices`, generalRateLimiter, noticesRoutes);
app.use(`${apiBasePath}/notifications`, generalRateLimiter, notificationsRoutes);
app.use(`${apiBasePath}/reports`, generalRateLimiter, reportsRoutes);
app.use(`${apiBasePath}/settings`, generalRateLimiter, settingsRoutes);
app.use(`${apiBasePath}/upload`, generalRateLimiter, uploadRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;


