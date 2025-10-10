import express, { Response } from 'express';
import Message from '../models/Message';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all users except current user
router.get('/users', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId } },
      { password: 0 }
    ).sort({ username: 1 });
    
    res.json(users);
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error: any) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;