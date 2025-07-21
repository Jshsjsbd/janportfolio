console.log('Current file path:', import.meta.url);
import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get } from 'firebase/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.FIREBASE_SECRET!;
  const ip = (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown"
  ).replaceAll(".", "_"); // ← بنفس صيغة التخزين

  console.log("🔍 Checking IP:", ip);

  try {
    const bannedRef = ref(db, `secure_beacons/${secret}/banned/${ip}`);
    const snapshot = await get(bannedRef);

    if (snapshot.exists()) {
      console.log("🚫 This IP is banned");
      return res.status(403).json({ banned: true, ip });
    }

    console.log("✅ This IP is allowed");
    return res.status(200).json({ banned: false });
  } catch (err) {
    console.error("❌ IP check failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
