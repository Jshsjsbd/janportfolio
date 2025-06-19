import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const publicIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const source = req.query.source || "unknown";
  const localIP = req.query.local_ip || "N/A";

  console.log(`[BEACON] Source: ${source}`);
  console.log(`  🌐 Public IP: ${publicIP}`);
  console.log(`  🖥️ Local IP: ${localIP}`);
  console.log(`  📱 User-Agent: ${userAgent}`);

  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAokB9AcPjGgAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", pixel.length);
  res.status(200).end(pixel);
}
