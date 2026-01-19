import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import notificationsController from '../controllers/notifications.controller';

const router = Router();

router.use(authenticateToken);

// Get all notifications for the authenticated user
router.get('/', notificationsController.getNotifications.bind(notificationsController));

// Get unread count
router.get('/unread/count', notificationsController.getUnreadCount.bind(notificationsController));

// Mark notification as read
router.patch('/:id/read', notificationsController.markAsRead.bind(notificationsController));

// Mark all notifications as read
router.patch('/read-all', notificationsController.markAllAsRead.bind(notificationsController));

// Delete notification
router.delete('/:id', notificationsController.deleteNotification.bind(notificationsController));

// Delete all read notifications
router.delete('/read/all', notificationsController.deleteAllRead.bind(notificationsController));

// Recent notifications (to be implemented)
router.get('/recent', (_req, res) => {
  res.json({ message: 'Recent notifications - to be implemented' });
});

// Subscribe to push (to be implemented)
router.post('/subscribe', (_req, res) => {
  res.json({ message: 'Subscribe to push - to be implemented' });
});

// Unsubscribe from push (to be implemented)
router.post('/unsubscribe', (_req, res) => {
  res.json({ message: 'Unsubscribe from push - to be implemented' });
});

export default router;


