import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get, remove } from 'firebase/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.FIREBASE_SECRET!;
  const logsRef = ref(db, `secure_beacons/${secret}/logs`);

  if (req.method === "GET") {
    try {
      const snapshot = await get(logsRef);
      if (!snapshot.exists()) return res.status(200).json({ entries: [] });

      const data = snapshot.val();
      const entries = Object.values(data).map((item: any) => item.content);
      res.status(200).json({ entries });
    } catch (err) {
      console.error("❌ Error fetching logs:", err);
      res.status(500).json({ error: "Error reading logs" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await remove(logsRef);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("❌ Error deleting logs:", err);
      res.status(500).json({ error: "Error deleting logs" });
    }
  }
}
