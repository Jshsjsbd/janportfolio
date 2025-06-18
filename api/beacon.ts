import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const source = req.query.source || 'unknown';

  console.log(`[BEACON] From IP: ${ip} | Source: ${source}`);

  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAokB9AcPjGgAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", pixel.length);
  res.status(200).end(pixel);
}
