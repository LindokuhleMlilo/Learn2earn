// pages/api/user.js
import { getDB } from '../../lib/database';
import { getBalance } from '../../lib/contract';
import lessonsData from '../../data/lessons.json';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const db = await getDB();

    // Get user data
    const user = await db.get('SELECT * FROM users WHERE wallet_address = ?', [walletAddress]);
    
    if (!user) {
      return res.status(200).json({
        totalLessonsCompleted: 0,
        totalRewardsEarned: 0,
        transactionHistory: [],
        tokenBalance: '0'
      });
    }

    // Get completed lessons with details
    const completedLessons = await db.all(
      `SELECT cl.lesson_id, cl.reward_amount, cl.transaction_hash, cl.completed_at 
       FROM completed_lessons cl 
       WHERE cl.user_id = ? 
       ORDER BY cl.completed_at DESC`,
      [user.id]
    );

    // Get on-chain token balance
    const tokenBalance = await getBalance(walletAddress);

    // Build transaction history
    const transactionHistory = completedLessons.map(cl => {
      const lesson = lessonsData.lessons.find(l => l.id === cl.lesson_id);
      return {
        lessonName: lesson ? lesson.title : 'Unknown Lesson',
        rewardAmount: cl.reward_amount,
        transactionHash: cl.transaction_hash,
        completedAt: cl.completed_at
      };
    });

    const totalLessonsCompleted = completedLessons.length;
    const totalRewardsEarned = completedLessons.reduce((sum, cl) => sum + cl.reward_amount, 0);

    res.status(200).json({
      totalLessonsCompleted,
      totalRewardsEarned,
      transactionHistory,
      tokenBalance
    });

  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}