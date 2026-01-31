import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdminOrTeacher } from '../middleware/role.middleware';
import noticesController from '../controllers/notices.controller';

const router = Router();

router.use(authenticateToken);

// Get all notices (filtered by target audience if provided)
router.get('/', authenticateToken, noticesController.getNotices.bind(noticesController));

// Get single notice
router.get('/:id', authenticateToken, noticesController.getNotice.bind(noticesController));

// Create notice (admin or teacher; admin can create any, teachers create as themselves)
router.post('/', requireAdminOrTeacher, noticesController.createNotice.bind(noticesController));

// Update notice (admin: any; teacher: own only)
router.put('/:id', requireAdminOrTeacher, noticesController.updateNotice.bind(noticesController));

// Delete notice (admin: any; teacher: own only)
router.delete('/:id', requireAdminOrTeacher, noticesController.deleteNotice.bind(noticesController));

// Recent notices (to be implemented)
router.get('/recent', authenticateToken, (_req, res) => {
  res.json({ message: 'Recent notices - to be implemented' });
});

// User notices (to be implemented)
router.get('/user', authenticateToken, (_req, res) => {
  res.json({ message: 'User notices - to be implemented' });
});

export default router;


