import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireTeacher, requireAdminOrTeacher } from '../middleware/role.middleware';
import { uploadRateLimiter } from '../middleware/rateLimit.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticateToken);
router.use(uploadRateLimiter);

router.post('/profile-picture', uploadSingle, (req, res) => {
  res.json({ message: 'Upload profile picture - to be implemented' });
});

router.post('/exam-paper', requireTeacher, uploadSingle, (req, res) => {
  res.json({ message: 'Upload exam paper - to be implemented' });
});

router.post('/notice-attachment', requireAdminOrTeacher, uploadSingle, (req, res) => {
  res.json({ message: 'Upload notice attachment - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete file - to be implemented' });
});

router.get('/:id/signed-url', (req, res) => {
  res.json({ message: 'Get signed URL - to be implemented' });
});

export default router;


