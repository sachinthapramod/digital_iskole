import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', (_req, res) => {
  res.json({ message: 'Notifications list - to be implemented' });
});

router.get('/unread/count', (_req, res) => {
  res.json({ message: 'Unread count - to be implemented' });
});

router.patch('/:id/read', (_req, res) => {
  res.json({ message: 'Mark as read - to be implemented' });
});

router.patch('/read-all', (_req, res) => {
  res.json({ message: 'Mark all as read - to be implemented' });
});

router.delete('/:id', (_req, res) => {
  res.json({ message: 'Delete notification - to be implemented' });
});

router.delete('/all', (_req, res) => {
  res.json({ message: 'Delete all notifications - to be implemented' });
});

router.get('/recent', (_req, res) => {
  res.json({ message: 'Recent notifications - to be implemented' });
});

router.post('/subscribe', (_req, res) => {
  res.json({ message: 'Subscribe to push - to be implemented' });
});

router.post('/unsubscribe', (_req, res) => {
  res.json({ message: 'Unsubscribe from push - to be implemented' });
});

export default router;


