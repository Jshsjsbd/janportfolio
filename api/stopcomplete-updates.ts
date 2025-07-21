import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get } from 'firebase/database';

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
      const { roomId } = req.body;

      if (!roomId?.trim()) {
        return res.status(400).json({ error: 'Room ID required' });
      }

      const roomRef = ref(db, `secure_beacons/${secret}/rooms/${roomId}`);
      const roomSnapshot = await get(roomRef);

      if (!roomSnapshot.exists()) {
        return res.status(404).json({ error: 'Room not found' });
      }

      return res.status(200).json({ room: roomSnapshot.val() });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('StopComplete Updates API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 