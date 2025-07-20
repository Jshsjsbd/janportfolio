import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get, set } from 'firebase/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { playerName } = req.query;

      if (!playerName) {
        return res.status(400).json({ error: 'Player name required' });
      }

      const statsRef = ref(db, `stopcomplete/stats/${(playerName as string).replace(/[.#$[\]]/g, '_')}`);
      const statsSnapshot = await get(statsRef);

      if (!statsSnapshot.exists()) {
        // Return default stats for new players
        const defaultStats = {
          totalGames: 0,
          wins: 0,
          averageScore: 0,
          bestScore: 0,
          fastestFinish: 0
        };
        return res.status(200).json({ stats: defaultStats });
      }

      return res.status(200).json({ stats: statsSnapshot.val() });
    } else if (req.method === 'POST') {
      const { playerName, gameResult } = req.body;

      if (!playerName || !gameResult) {
        return res.status(400).json({ error: 'Player name and game result required' });
      }

      const statsRef = ref(db, `stopcomplete/stats/${playerName.replace(/[.#$[\]]/g, '_')}`);
      const statsSnapshot = await get(statsRef);

      let stats = statsSnapshot.exists() ? statsSnapshot.val() : {
        totalGames: 0,
        wins: 0,
        averageScore: 0,
        bestScore: 0,
        fastestFinish: 0
      };

      // Update stats based on game result
      stats.totalGames += 1;
      stats.bestScore = Math.max(stats.bestScore, gameResult.score);
      stats.averageScore = (stats.averageScore * (stats.totalGames - 1) + gameResult.score) / stats.totalGames;

      if (gameResult.position === 1) {
        stats.wins += 1;
      }

      if (gameResult.finishTime && (stats.fastestFinish === 0 || gameResult.finishTime < stats.fastestFinish)) {
        stats.fastestFinish = gameResult.finishTime;
      }

      await set(statsRef, stats);

      return res.status(200).json({ success: true, stats });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('StopComplete stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 