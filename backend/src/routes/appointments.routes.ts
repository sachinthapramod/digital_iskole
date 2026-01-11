import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireTeacher, requireParent } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', authenticateToken, (_req, res) => {
  res.json({ message: 'Appointments list - to be implemented' });
});

router.post('/', requireParent, (_req, res) => {
  res.json({ message: 'Create appointment - to be implemented' });
});

router.get('/:id', authenticateToken, (_req, res) => {
  res.json({ message: 'Get appointment - to be implemented' });
});

router.patch('/:id/status', requireTeacher, (_req, res) => {
  res.json({ message: 'Update appointment status - to be implemented' });
});

router.patch('/:id/cancel', requireParent, (_req, res) => {
  res.json({ message: 'Cancel appointment - to be implemented' });
});

router.get('/teacher', requireTeacher, (_req, res) => {
  res.json({ message: 'Teacher appointments - to be implemented' });
});

router.get('/parent', requireParent, (_req, res) => {
  res.json({ message: 'Parent appointments - to be implemented' });
});

router.get('/pending/count', authenticateToken, (_req, res) => {
  res.json({ message: 'Pending count - to be implemented' });
});

router.get('/available-slots', requireParent, (_req, res) => {
  res.json({ message: 'Available slots - to be implemented' });
});

export default router;


