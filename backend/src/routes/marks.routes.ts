import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdminOrTeacher } from '../middleware/role.middleware';
import marksController from '../controllers/marks.controller';

const router = Router();

router.use(authenticateToken);

// Get marks by exam
router.get('/exam/:examId', requireAdminOrTeacher, marksController.getMarksByExam.bind(marksController));

// Get students for marks entry
router.get('/students', requireAdminOrTeacher, marksController.getStudentsForMarksEntry.bind(marksController));

// Enter marks (admin and teachers can enter)
router.post('/enter', requireAdminOrTeacher, marksController.enterMarks.bind(marksController));

// Update mark (admin and teachers can update)
router.put('/:id', requireAdminOrTeacher, marksController.updateMark.bind(marksController));

// Get student marks
router.get('/student/:id', authenticateToken, marksController.getStudentMarks.bind(marksController));

// Upload exam paper (to be implemented)
router.post('/upload-paper', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Upload exam paper - to be implemented' });
});

// Get exam paper (to be implemented)
router.get('/paper/:studentId/:examId', authenticateToken, (_req, res) => {
  res.json({ message: 'Get exam paper - to be implemented' });
});

// Delete exam paper (to be implemented)
router.delete('/paper/:studentId/:examId', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Delete exam paper - to be implemented' });
});

// Class marks summary (to be implemented)
router.get('/class/:id/summary', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Class marks summary - to be implemented' });
});

// Report card (to be implemented)
router.get('/report-card/:studentId', authenticateToken, (_req, res) => {
  res.json({ message: 'Report card - to be implemented' });
});

export default router;


