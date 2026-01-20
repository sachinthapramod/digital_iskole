import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/role.middleware';
import usersController from '../controllers/users.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Teachers routes
router.get('/teachers', requireAdmin, usersController.getTeachers.bind(usersController));
router.post('/teachers', requireAdmin, usersController.createTeacher.bind(usersController));
router.get('/teachers/:id', requireAdmin, usersController.getTeacher.bind(usersController));
router.put('/teachers/:id', requireAdmin, usersController.updateTeacher.bind(usersController));
router.delete('/teachers/:id', requireAdmin, usersController.deleteTeacher.bind(usersController));

// Keep placeholder routes for future implementation
router.get('/teachers/available', requireAdmin, (_req, res) => {
  res.json({ message: 'Available teachers - to be implemented' });
});

router.get('/teachers/:id/students', requireAdminOrTeacher, (_req, res) => {
  res.json({ message: 'Teacher students - to be implemented' });
});

// Students routes
router.get('/students', requireAdmin, usersController.getStudents.bind(usersController));
router.post('/students', requireAdmin, usersController.createStudent.bind(usersController));
router.get('/students/:id', authenticateToken, usersController.getStudent.bind(usersController));
router.put('/students/:id', requireAdmin, usersController.updateStudent.bind(usersController));
router.delete('/students/:id', requireAdmin, usersController.deleteStudent.bind(usersController));

// Keep placeholder routes for future implementation
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
router.get('/parents', requireAdmin, usersController.getParents.bind(usersController));
router.post('/parents', requireAdmin, usersController.createParent.bind(usersController));
router.get('/parents/:id', requireAdmin, usersController.getParent.bind(usersController));
router.put('/parents/:id', requireAdmin, usersController.updateParent.bind(usersController));
router.delete('/parents/:id', requireAdmin, usersController.deleteParent.bind(usersController));

// Get parent's children (use "me" to get current user's children)
router.get('/parents/:id/children', authenticateToken, usersController.getParentChildren.bind(usersController));

router.post('/parents/:id/children', requireAdmin, (_req, res) => {
  res.json({ message: 'Link child - to be implemented' });
});

router.delete('/parents/:id/children/:studentId', requireAdmin, (_req, res) => {
  res.json({ message: 'Unlink child - to be implemented' });
});

export default router;


