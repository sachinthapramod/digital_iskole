import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdminOrTeacher } from '../middleware/role.middleware';
import attendanceController from '../controllers/attendance.controller';

const router = Router();

router.use(authenticateToken);

// Get students by class (for teachers to see their class students)
router.get('/students', requireAdminOrTeacher, attendanceController.getStudentsByClass.bind(attendanceController));

// Get attendance by class and date
router.get('/', requireAdminOrTeacher, attendanceController.getAttendanceByClassAndDate.bind(attendanceController));

// Mark single attendance (admin and teachers can mark)
router.post('/mark', requireAdminOrTeacher, attendanceController.markAttendance.bind(attendanceController));

// Mark bulk attendance (for marking entire class at once) - admin and teachers can mark
router.post('/mark/bulk', requireAdminOrTeacher, attendanceController.markBulkAttendance.bind(attendanceController));

// Get student attendance stats
router.get('/student/:studentId/stats', authenticateToken, attendanceController.getAttendanceStats.bind(attendanceController));

// Get attendance history for a date range
router.get('/history', requireAdminOrTeacher, attendanceController.getAttendanceHistory.bind(attendanceController));

export default router;


