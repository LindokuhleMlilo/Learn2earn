// pages/api/lessons.js
import lessonsData from '../../data/lessons.json';
import { getDB } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(200).json({
        lessons: lessonsData.lessons.map(lesson => ({
          ...lesson,
          completed: false,
          quiz: undefined // Remove quiz answers from public endpoint
        }))
      });
    }

    const db = await getDB();
    
    // Get user's completed lessons
    const user = await db.get('SELECT * FROM users WHERE wallet_address = ?', [walletAddress]);
    let completedLessons = [];
    
    if (user) {
      completedLessons = await db.all(
        'SELECT lesson_id FROM completed_lessons WHERE user_id = ?',
        [user.id]
      );
    }

    const completedLessonIds = completedLessons.map(cl => cl.lesson_id);

    const lessonsWithProgress = lessonsData.lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      completed: completedLessonIds.includes(lesson.id),
      reward: lesson.reward
    }));

    res.status(200).json({ lessons: lessonsWithProgress });

  } catch (error) {
    console.error('Lessons API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}