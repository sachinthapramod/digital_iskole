import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Teachers routes
router.get('/teachers', requireAdmin, (_req, res) => {
  res.json({ message: 'Teachers list - to be implemented' });
});

router.post('/teachers', requireAdmin, (_req, res) => {
  res.json({ message: 'Create teacher - to be implemented' });
});

router.get('/teachers/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Get teacher - to be implemented' });
});

router.put('/teachers/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Update teacher - to be implemented' });
});

router.delete('/teachers/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Delete teacher - to be implemented' });
});

router.get('/teachers/available', requireAdmin, (_req, res) => {
  res.json({ message: 'Available teachers - to be implemented' });
});

router.get('/teachers/:id/students', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Teacher students - to be implemented' });
});

// Students routes
router.get('/students', requireAdmin, (_req, res) => {
  res.json({ message: 'Students list - to be implemented' });
});

router.post('/students', requireAdmin, (_req, res) => {
  res.json({ message: 'Create student - to be implemented' });
});

router.get('/students/:id', authenticateToken, (_req, res) => {
  res.json({ message: 'Get student - to be implemented' });
});

router.put('/students/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Update student - to be implemented' });
});

router.delete('/students/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Delete student - to be implemented' });
});

router.get('/students/class/:classId', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Students by class - to be implemented' });
});

router.get('/students/:id/stats', authenticateToken, (_req, res) => {
  res.json({ message: 'Student stats - to be implemented' });
});

router.get('/students/:id/attendance', authenticateToken, (_req, res) => {
  res.json({ message: 'Student attendance - to be implemented' });
});

router.get('/students/:id/marks', authenticateToken, (_req, res) => {
  res.json({ message: 'Student marks - to be implemented' });
});

// Parents routes
router.get('/parents', requireAdmin, (_req, res) => {
  res.json({ message: 'Parents list - to be implemented' });
});

router.post('/parents', requireAdmin, (_req, res) => {
  res.json({ message: 'Create parent - to be implemented' });
});

router.get('/parents/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Get parent - to be implemented' });
});

router.put('/parents/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Update parent - to be implemented' });
});

router.delete('/parents/:id', requireAdmin, (_req, res) => {
  res.json({ message: 'Delete parent - to be implemented' });
});

router.get('/parents/:id/children', authenticateToken, (_req, res) => {
  res.json({ message: 'Parent children - to be implemented' });
});

router.post('/parents/:id/children', requireAdmin, (_req, res) => {
  res.json({ message: 'Link child - to be implemented' });
});

router.delete('/parents/:id/children/:studentId', requireAdmin, (_req, res) => {
  res.json({ message: 'Unlink child - to be implemented' });
});

export default router;


