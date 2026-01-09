import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/grading', (req, res) => {
  res.json({ message: 'Get grading scale - to be implemented' });
});

router.put('/grading', requireAdmin, (req, res) => {
  res.json({ message: 'Update grading scale - to be implemented' });
});

router.get('/academic-years', requireAdmin, (req, res) => {
  res.json({ message: 'Academic years list - to be implemented' });
});

router.post('/academic-years', requireAdmin, (req, res) => {
  res.json({ message: 'Create academic year - to be implemented' });
});

router.put('/academic-years/:id', requireAdmin, (req, res) => {
  res.json({ message: 'Update academic year - to be implemented' });
});

router.delete('/academic-years/:id', requireAdmin, (req, res) => {
  res.json({ message: 'Delete academic year - to be implemented' });
});

router.patch('/academic-years/:id/set-current', requireAdmin, (req, res) => {
  res.json({ message: 'Set current academic year - to be implemented' });
});

router.get('/academic-years/current', (req, res) => {
  res.json({ message: 'Get current academic year - to be implemented' });
});

router.get('/preferences', (req, res) => {
  res.json({ message: 'Get preferences - to be implemented' });
});

router.put('/preferences', (req, res) => {
  res.json({ message: 'Update preferences - to be implemented' });
});

export default router;


