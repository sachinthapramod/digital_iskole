import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Exams list - to be implemented' });
});

router.post('/', requireAdminOrTeacher, (req, res) => {
  res.json({ message: 'Create exam - to be implemented' });
});

router.get('/:id', authenticateToken, (req, res) => {
  res.json({ message: 'Get exam - to be implemented' });
});

router.put('/:id', requireAdminOrTeacher, (req, res) => {
  res.json({ message: 'Update exam - to be implemented' });
});

router.delete('/:id', requireAdminOrTeacher, (req, res) => {
  res.json({ message: 'Delete exam - to be implemented' });
});

router.get('/upcoming', authenticateToken, (req, res) => {
  res.json({ message: 'Upcoming exams - to be implemented' });
});

router.get('/:id/results', requireAdminOrTeacher, (req, res) => {
  res.json({ message: 'Exam results - to be implemented' });
});

export default router;


