import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateToken);

// Classes routes
router.get('/classes', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Classes list - to be implemented' });
});

router.post('/classes', requireAdmin, (_req, res) => {
  res.json({ message: 'Create class - to be implemented' });
});

router.get('/classes/:id', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Get class - to be implemented' });
});

router.put('/classes/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Update class - to be implemented' });
});

router.delete('/classes/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Delete class - to be implemented' });
});

router.get('/classes/:id/students', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Class students - to be implemented' });
});

router.get('/classes/:id/stats', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Class stats - to be implemented' });
});

router.post('/classes/:id/assign-teacher', requireAdmin, (_req, res) => {
  res.json({ message: 'Assign teacher - to be implemented' });
});

// Subjects routes
router.get('/subjects', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Subjects list - to be implemented' });
});

router.post('/subjects', requireAdmin, (_req, res) => {
  res.json({ message: 'Create subject - to be implemented' });
});

router.get('/subjects/:id', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Get subject - to be implemented' });
});

router.put('/subjects/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Update subject - to be implemented' });
});

router.delete('/subjects/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Delete subject - to be implemented' });
});

router.get('/subjects/grade/:grade', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Subjects by grade - to be implemented' });
});

export default router;


