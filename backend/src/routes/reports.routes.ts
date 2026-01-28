import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { reportRateLimiter } from '../middleware/rateLimit.middleware';
import reportsController from '../controllers/reports.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', reportsController.list.bind(reportsController));

router.get('/my', reportsController.my.bind(reportsController));

router.get('/:id', reportsController.get.bind(reportsController));

router.get('/:id/download', reportsController.download.bind(reportsController));

router.delete('/:id', reportsController.remove.bind(reportsController));

// Generate student report (admin, teacher, parent - with authorization checks in controller)
router.post('/student', reportRateLimiter, reportsController.generateStudent.bind(reportsController));

router.post('/class', requireAdmin, reportRateLimiter, reportsController.generateClass.bind(reportsController));

router.post('/school', requireAdmin, reportRateLimiter, reportsController.generateSchool.bind(reportsController));

router.get('/:id/status', (_req, res) => {
  res.json({ message: 'Report status - to be implemented' });
});

export default router;


