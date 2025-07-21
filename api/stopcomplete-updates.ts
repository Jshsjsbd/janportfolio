console.log('Current file path:', import.meta.url);
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
        console.error('[stopcomplete-updates] No roomId provided');
        return res.status(400).json({ error: 'Room ID required' });
      }

      const roomPath = `secure_beacons/${secret}/rooms/${roomId}`;
      console.log(`[stopcomplete-updates] Looking for room at path: ${roomPath}`);
      const roomRef = ref(db, roomPath);
      const roomSnapshot = await get(roomRef);

      if (!roomSnapshot.exists()) {
        console.error(`[stopcomplete-updates] Room not found for roomId: ${roomId} at path: ${roomPath}`);
        return res.status(404).json({ error: 'Room not found' });
      }

      console.log(`[stopcomplete-updates] Room found for roomId: ${roomId}`);
      return res.status(200).json({ room: roomSnapshot.val() });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[stopcomplete-updates] API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 