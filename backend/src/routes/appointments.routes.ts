import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireParent, requireAdminOrTeacher } from '../middleware/role.middleware';
import appointmentsController from '../controllers/appointments.controller';

const router = Router();

router.use(authenticateToken);

// Get all appointments (filtered by role)
router.get('/', appointmentsController.getAppointments.bind(appointmentsController));

// Get single appointment
router.get('/:id', appointmentsController.getAppointment.bind(appointmentsController));

// Create appointment (Parent only)
router.post('/', requireParent, appointmentsController.createAppointment.bind(appointmentsController));

// Update appointment status (Teacher/Admin only)
router.patch('/:id/status', requireAdminOrTeacher, appointmentsController.updateAppointmentStatus.bind(appointmentsController));

// Cancel appointment (Parent only)
router.patch('/:id/cancel', requireParent, appointmentsController.cancelAppointment.bind(appointmentsController));

// Get pending count
router.get('/pending/count', appointmentsController.getPendingCount.bind(appointmentsController));

// Available slots (to be implemented)
router.get('/available-slots', requireParent, (_req, res) => {
  res.json({ message: 'Available slots - to be implemented' });
});

export default router;



