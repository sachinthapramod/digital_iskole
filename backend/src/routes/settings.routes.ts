import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import settingsController from '../controllers/settings.controller';

const router = Router();

router.use(authenticateToken);

// Grading Scale Routes
router.get('/grading', settingsController.getGradingScale.bind(settingsController));
router.put('/grading', requireAdmin, settingsController.updateGradingScale.bind(settingsController));

// Academic Years Routes
router.get('/academic-years', settingsController.getAcademicYears.bind(settingsController));
router.get('/academic-years/current', settingsController.getCurrentAcademicYear.bind(settingsController));
router.post('/academic-years', requireAdmin, settingsController.createAcademicYear.bind(settingsController));
router.put('/academic-years/:id', requireAdmin, settingsController.updateAcademicYear.bind(settingsController));
router.patch('/academic-years/:id/set-current', requireAdmin, settingsController.setCurrentAcademicYear.bind(settingsController));
router.delete('/academic-years/:id', requireAdmin, settingsController.deleteAcademicYear.bind(settingsController));

// User Preferences Routes
router.get('/preferences', settingsController.getUserPreferences.bind(settingsController));
router.put('/preferences', settingsController.updateUserPreferences.bind(settingsController));

export default router;


