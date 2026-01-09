import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Notices list - to be implemented' });
});

router.post('/', requireAdminOrTeacher, (req, res) => {
  res.json({ message: 'Create notice - to be implemented' });
});

router.get('/:id', authenticateToken, (req, res) => {
  res.json({ message: 'Get notice - to be implemented' });
});

router.put('/:id', requireAdminOrTeacher, (req, res) => {
  res.json({ message: 'Update notice - to be implemented' });
});

router.delete('/:id', requireAdminOrTeacher, (req, res) => {
  res.json({ message: 'Delete notice - to be implemented' });
});

router.get('/recent', authenticateToken, (req, res) => {
  res.json({ message: 'Recent notices - to be implemented' });
});

router.get('/user', authenticateToken, (req, res) => {
  res.json({ message: 'User notices - to be implemented' });
});

export default router;


