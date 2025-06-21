import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, push } from 'firebase/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const publicIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const source = req.query.source || "unknown";
  const localIP = req.query.local_ip || "N/A";
  const bannedIPs = ["41.130.243.2"];
  const forwardedFor = req.headers["x-forwarded-for"] as string;
  const ip = forwardedFor?.split(",")[0].trim() || "unknown";

  if (bannedIPs.includes(ip)) {
    return res.status(403).send("🚫 Access denied.");
  }

  const content = `📡 **Beacon Detected**
> 🌐 **Public IP:** ${publicIP}
> 🖥️ **Local IP:** ${localIP}
> 📍 **Source:** ${source}
> 🧭 **User-Agent:** \`${userAgent}\``;

  const secret = process.env.FIREBASE_SECRET!;
  await push(ref(db, `secure_beacons/${secret}`), {
    content,
    timestamp: Date.now()
  });

  console.log("✅ Beacon stored in Firebase");

  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAokB9AcPjGgAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", pixel.length);
  res.status(200).end(pixel);
}
