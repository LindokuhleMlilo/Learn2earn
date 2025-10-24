// pages/api/reward.js
import { mintTokens } from '../../lib/contract';
import { getDB } from '../../lib/database';
import lessonsData from '../../data/lessons.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, lessonId, answers } = req.body;

    // Validate input
    if (!walletAddress || !lessonId || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the lesson
    const lesson = lessonsData.lessons.find(l => l.id === lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Validate quiz answers
    const isPassed = validateQuizAnswers(lesson.quiz, answers);
    
    if (!isPassed) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quiz failed. Please try again.' 
      });
    }

    const db = await getDB();

    // Get or create user
    let user = await db.get('SELECT * FROM users WHERE wallet_address = ?', [walletAddress]);
    if (!user) {
      const result = await db.run('INSERT INTO users (wallet_address) VALUES (?)', [walletAddress]);
      user = { id: result.lastID, wallet_address: walletAddress };
    }

    // Check if lesson already completed
    const existingCompletion = await db.get(
      'SELECT * FROM completed_lessons WHERE user_id = ? AND lesson_id = ?',
      [user.id, lessonId]
    );

    if (existingCompletion) {
      return res.status(400).json({
        error: 'Lesson already completed'
      });
    }

    // Mint tokens
    const mintResult = await mintTokens(
  walletAddress, 
  ethers.parseUnits(lesson.reward.toString(), 18),
  lessonId
    );

    if (!mintResult.success) {
      return res.status(500).json({
        error: 'Failed to mint tokens: ' + mintResult.error
      });
    }

    // Record completion
    await db.run(
      `INSERT INTO completed_lessons (user_id, lesson_id, reward_amount, transaction_hash) 
       VALUES (?, ?, ?, ?)`,
      [user.id, lessonId, lesson.reward, mintResult.transactionHash]
    );

    // Update user balance
    await updateUserBalance(db, user.id);

    res.status(200).json({
      success: true,
      message: `Congratulations! You earned ${lesson.reward} L2E tokens.`,
      transactionHash: mintResult.transactionHash,
      rewardAmount: lesson.reward,
      blockNumber: mintResult.blockNumber
    });

  } catch (error) {
    console.error('Reward API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function validateQuizAnswers(quiz, userAnswers) {
  return quiz.every((question, index) => {
    return userAnswers[index] === question.correctAnswer;
  });
}

async function updateUserBalance(db, userId) {
  const completedLessons = await db.all(
    'SELECT SUM(reward_amount) as total FROM completed_lessons WHERE user_id = ?',
    [userId]
  );
  
  const totalBalance = completedLessons[0].total || 0;
  
  await db.run(
    `INSERT OR REPLACE INTO user_balances (user_id, balance) 
     VALUES (?, ?)`,
    [userId, totalBalance]
  );
}