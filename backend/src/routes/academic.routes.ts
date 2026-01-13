import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/role.middleware';
import classesController from '../controllers/classes.controller';
import subjectsController from '../controllers/subjects.controller';

const router = Router();

router.use(authenticateToken);

// Classes routes
router.get('/classes', requireAdminOrTeacher, classesController.getClasses.bind(classesController));
router.post('/classes', requireAdmin, classesController.createClass.bind(classesController));
router.get('/classes/:id', requireAdminOrTeacher, classesController.getClass.bind(classesController));
router.put('/classes/:id', requireAdmin, classesController.updateClass.bind(classesController));
router.delete('/classes/:id', requireAdmin, classesController.deleteClass.bind(classesController));

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
router.get('/subjects', requireAdminOrTeacher, subjectsController.getSubjects.bind(subjectsController));
router.post('/subjects', requireAdmin, subjectsController.createSubject.bind(subjectsController));
router.get('/subjects/:id', requireAdminOrTeacher, subjectsController.getSubject.bind(subjectsController));
router.put('/subjects/:id', requireAdmin, subjectsController.updateSubject.bind(subjectsController));
router.delete('/subjects/:id', requireAdmin, subjectsController.deleteSubject.bind(subjectsController));

export default router;


