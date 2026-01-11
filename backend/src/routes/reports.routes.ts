import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/role.middleware';
import { reportRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.use(authenticateToken);
router.use(reportRateLimiter);

router.get('/', (_req, res) => {
  res.json({ message: 'Reports list - to be implemented' });
});

router.get('/:id', (_req, res) => {
  res.json({ message: 'Get report - to be implemented' });
});

router.post('/student', (_req, res) => {
  res.json({ message: 'Generate student report - to be implemented' });
});

router.post('/class', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Generate class report - to be implemented' });
});

router.post('/school', requireAdmin, (_req, res) => {
  res.json({ message: 'Generate school report - to be implemented' });
});

router.get('/:id/download', (_req, res) => {
  res.json({ message: 'Download report - to be implemented' });
});

router.delete('/:id', (_req, res) => {
  res.json({ message: 'Delete report - to be implemented' });
});

router.get('/:id/status', (_req, res) => {
  res.json({ message: 'Report status - to be implemented' });
});

router.get('/my', (_req, res) => {
  res.json({ message: 'My reports - to be implemented' });
});

export default router;


