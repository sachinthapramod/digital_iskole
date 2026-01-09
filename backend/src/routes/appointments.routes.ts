import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireTeacher, requireParent } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Appointments list - to be implemented' });
});

router.post('/', requireParent, (req, res) => {
  res.json({ message: 'Create appointment - to be implemented' });
});

router.get('/:id', authenticateToken, (req, res) => {
  res.json({ message: 'Get appointment - to be implemented' });
});

router.patch('/:id/status', requireTeacher, (req, res) => {
  res.json({ message: 'Update appointment status - to be implemented' });
});

router.patch('/:id/cancel', requireParent, (req, res) => {
  res.json({ message: 'Cancel appointment - to be implemented' });
});

router.get('/teacher', requireTeacher, (req, res) => {
  res.json({ message: 'Teacher appointments - to be implemented' });
});

router.get('/parent', requireParent, (req, res) => {
  res.json({ message: 'Parent appointments - to be implemented' });
});

router.get('/pending/count', authenticateToken, (req, res) => {
  res.json({ message: 'Pending count - to be implemented' });
});

router.get('/available-slots', requireParent, (req, res) => {
  res.json({ message: 'Available slots - to be implemented' });
});

export default router;


