import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalRateLimiter } from './middleware/rateLimit.middleware';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

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
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
const apiBasePath = process.env.API_BASE_URL?.replace(/^https?:\/\/[^/]+/, '') || '/api';

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


