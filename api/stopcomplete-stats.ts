console.log('Current file path:', import.meta.url);
import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get, set } from 'firebase/database';

// Get the secret from environment variable
const secret = process.env.FIREBASE_SECRET || 'a7x92kd';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { playerName } = req.body;

      if (!playerName?.trim()) {
        return res.status(400).json({ error: 'Player name required' });
      }

      const statsRef = ref(db, `secure_beacons/${secret}/stats/${(playerName as string).replace(/[.#$[\]]/g, '_')}`);
      const statsSnapshot = await get(statsRef);

      if (!statsSnapshot.exists()) {
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
    } else if (req.method === 'PUT') {
      const { playerName, score } = req.body;

      if (!playerName?.trim() || typeof score !== 'number') {
        return res.status(400).json({ error: 'Player name and score required' });
      }

      const statsRef = ref(db, `secure_beacons/${secret}/stats/${playerName.replace(/[.#$[\]]/g, '_')}`);
      const statsSnapshot = await get(statsRef);

      const currentStats = statsSnapshot.exists() ? statsSnapshot.val() : {
        totalGames: 0,
        wins: 0,
        averageScore: 0,
        bestScore: 0,
        fastestFinish: 0
      };

      const newStats = {
        ...currentStats,
        totalGames: currentStats.totalGames + 1,
        bestScore: Math.max(currentStats.bestScore, score),
        averageScore: (currentStats.averageScore * currentStats.totalGames + score) / (currentStats.totalGames + 1)
      };

      await set(statsRef, newStats);

      return res.status(200).json({ success: true, stats: newStats });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('StopComplete Stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 