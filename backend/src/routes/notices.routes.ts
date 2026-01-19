import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import noticesController from '../controllers/notices.controller';

const router = Router();

router.use(authenticateToken);

// Get all notices (filtered by target audience if provided)
router.get('/', authenticateToken, noticesController.getNotices.bind(noticesController));

// Get single notice
router.get('/:id', authenticateToken, noticesController.getNotice.bind(noticesController));

// Create notice (admin only)
router.post('/', requireAdmin, noticesController.createNotice.bind(noticesController));

// Update notice (admin only)
router.put('/:id', requireAdmin, noticesController.updateNotice.bind(noticesController));

// Delete notice (admin only)
router.delete('/:id', requireAdmin, noticesController.deleteNotice.bind(noticesController));

// Recent notices (to be implemented)
router.get('/recent', authenticateToken, (_req, res) => {
  res.json({ message: 'Recent notices - to be implemented' });
});

// User notices (to be implemented)
router.get('/user', authenticateToken, (_req, res) => {
  res.json({ message: 'User notices - to be implemented' });
});

export default router;


