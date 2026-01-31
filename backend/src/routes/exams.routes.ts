import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdminOrTeacher } from '../middleware/role.middleware';
import examsController from '../controllers/exams.controller';

const router = Router();

router.use(authenticateToken);

// Get all exams
router.get('/', authenticateToken, examsController.getExams.bind(examsController));

// Create exam (admin or teacher)
router.post('/', requireAdminOrTeacher, examsController.createExam.bind(examsController));

// Get single exam
router.get('/:id', authenticateToken, examsController.getExam.bind(examsController));

// Update exam (admin or teacher)
router.put('/:id', requireAdminOrTeacher, examsController.updateExam.bind(examsController));

// Delete exam (admin or teacher)
router.delete('/:id', requireAdminOrTeacher, examsController.deleteExam.bind(examsController));

// Get upcoming exams
router.get('/upcoming', authenticateToken, (_req, res) => {
  res.json({ message: 'Upcoming exams - to be implemented' });
});

// Get exam results
router.get('/:id/results', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Exam results - to be implemented' });
});

export default router;


