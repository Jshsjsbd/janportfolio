import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get, push } from 'firebase/database';
import { UAParser } from "ua-parser-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("📥 Beacon API triggered");

  const publicIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const forwardedFor = req.headers["x-forwarded-for"] as string;
  const ip = forwardedFor?.split(",")[0].trim() || "unknown";
  const userAgent = req.headers["user-agent"] || "unknown";
  const source = req.query.source || "unknown";
  const localIP = req.query.local_ip || "N/A";

  console.log("🌐 IP:", ip, "| Source:", source);

  const secret = process.env.FIREBASE_SECRET!;
  console.log("🔐 Secret used:", secret);

  // جلب قائمة الايبيهات المحظورة
  const bannedRef = ref(db, `secure_beacons/${secret}/banned`);
  const snapshot = await get(bannedRef);
  const bannedIPs = snapshot.exists() ? Object.keys(snapshot.val()!) : [];
  console.log("🚫 Banned IPs:", bannedIPs);

  if (bannedIPs.includes(ip)) {
    console.log("🚫 IP محظور. منع الوصول.");
    return res.status(403).send("🚫 Access denied.");
  }

  // تحليل الـ User-Agent للحصول على نوع الجهاز
  const parser = new UAParser(userAgent);
  const deviceModel = parser.getDevice().model || "Unknown";
  const deviceVendor = parser.getDevice().vendor || "";
  const finalModel = deviceVendor ? `${deviceVendor} ${deviceModel}` : deviceModel;

  const content = `📡 **Beacon Detected**
> 🌐 **Public IP:** ${publicIP}
> 🖥️ **Local IP:** ${localIP}
> 📍 **Source:** ${source}
> 🧭 **User-Agent:** \`${userAgent}\`
> 📱 **Model:** ${finalModel}`;

  console.log("🌟 Logging beacon:", content);
  await push(ref(db, `secure_beacons/${secret}/logs`), {
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
