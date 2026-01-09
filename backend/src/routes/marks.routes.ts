import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacher, requireAdminOrTeacher } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/exam/:examId', requireAdminOrTeacher, (req, res) => {
  res.json({ message: 'Marks by exam - to be implemented' });
});

router.get('/student/:id', authenticateToken, (req, res) => {
  res.json({ message: 'Student marks - to be implemented' });
});

router.post('/enter', requireTeacher, (req, res) => {
  res.json({ message: 'Enter marks - to be implemented' });
});

router.put('/:id', requireTeacher, (req, res) => {
  res.json({ message: 'Update mark - to be implemented' });
});

router.post('/upload-paper', requireTeacher, (req, res) => {
  res.json({ message: 'Upload exam paper - to be implemented' });
});

router.get('/paper/:studentId/:examId', authenticateToken, (req, res) => {
  res.json({ message: 'Get exam paper - to be implemented' });
});

router.delete('/paper/:studentId/:examId', requireTeacher, (req, res) => {
  res.json({ message: 'Delete exam paper - to be implemented' });
});

router.get('/class/:id/summary', requireAdminOrTeacher, (req, res) => {
  res.json({ message: 'Class marks summary - to be implemented' });
});

router.get('/report-card/:studentId', authenticateToken, (req, res) => {
  res.json({ message: 'Report card - to be implemented' });
});

export default router;


