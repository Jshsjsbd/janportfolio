import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const bannedIPs = ["41.130.243.2", "156.196.222.180"]; // ← حط هنا IPات الممنوعة
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (bannedIPs.includes(ip)) {
    return res.status(403).json({ banned: true });
  }

  res.status(200).json({ banned: false });
}
