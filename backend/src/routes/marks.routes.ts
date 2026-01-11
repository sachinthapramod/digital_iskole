import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireTeacher, requireAdminOrTeacher } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/exam/:examId', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Marks by exam - to be implemented' });
});

router.get('/student/:id', authenticateToken, (_req, res) => {
  res.json({ message: 'Student marks - to be implemented' });
});

router.post('/enter', requireTeacher, (_req, res) => {
  res.json({ message: 'Enter marks - to be implemented' });
});

router.put('/:id', requireTeacher, (_req, res) => {
  res.json({ message: 'Update mark - to be implemented' });
});

router.post('/upload-paper', requireTeacher, (_req, res) => {
  res.json({ message: 'Upload exam paper - to be implemented' });
});

router.get('/paper/:studentId/:examId', authenticateToken, (_req, res) => {
  res.json({ message: 'Get exam paper - to be implemented' });
});

router.delete('/paper/:studentId/:examId', requireTeacher, (_req, res) => {
  res.json({ message: 'Delete exam paper - to be implemented' });
});

router.get('/class/:id/summary', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Class marks summary - to be implemented' });
});

router.get('/report-card/:studentId', authenticateToken, (_req, res) => {
  res.json({ message: 'Report card - to be implemented' });
});

export default router;


