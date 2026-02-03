import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdminOrTeacher } from '../middleware/role.middleware';
import { uploadRateLimiter } from '../middleware/rateLimit.middleware';
import { uploadSingle } from '../middleware/upload.middleware';
import { uploadExamPaper } from '../utils/examPaperStorage';
import logger from '../utils/logger';

const router = Router();

router.use(authenticateToken);
router.use(uploadRateLimiter);

router.post('/profile-picture', uploadSingle, (_req, res) => {
  res.json({ message: 'Upload profile picture - to be implemented' });
});

router.post('/exam-paper', requireAdminOrTeacher, uploadSingle, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file as { buffer?: Buffer; originalname?: string; mimetype?: string } | undefined;
    const studentId = req.body?.studentId as string | undefined;
    const examId = req.body?.examId as string | undefined;

    const buffer = file?.buffer;
    if (!file || !buffer) {
      res.status(400).json({ message: 'No file uploaded. Send multipart/form-data with field "file".' });
      return;
    }
    if (!studentId || !examId) {
      res.status(400).json({ message: 'Missing studentId or examId. Send in form body.' });
      return;
    }

    const url = await uploadExamPaper(
      studentId,
      examId,
      file.originalname || 'exam-paper',
      buffer,
      file.mimetype || 'application/octet-stream'
    );
    res.json({ url });
  } catch (err: unknown) {
    logger.error('Exam paper upload error:', err);
    next(err);
  }
});

router.post('/notice-attachment', requireAdminOrTeacher, uploadSingle, (_req, res) => {
  res.json({ message: 'Upload notice attachment - to be implemented' });
});

router.delete('/:id', (_req, res) => {
  res.json({ message: 'Delete file - to be implemented' });
});

router.get('/:id/signed-url', (_req, res) => {
  res.json({ message: 'Get signed URL - to be implemented' });
});

export default router;


