import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

const storagePath = path.resolve('/tmp/beacons.json');

function readStorage() {
  if (!fs.existsSync(storagePath)) {
    return { entries: [], lastSent: 0 };
  }

  try {
    const data = fs.readFileSync(storagePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { entries: [], lastSent: 0 };
  }
}

function writeStorage(entries: string[], lastSent: number) {
  fs.writeFileSync(storagePath, JSON.stringify({ entries, lastSent }, null, 2));
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const publicIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const source = req.query.source || "unknown";
  const localIP = req.query.local_ip || "N/A";

  const content = `> 🌐 **Public IP:** ${publicIP}
> 🖥️ **Local IP:** ${localIP}
> 📍 **Source:** ${source}
> 🧭 **User-Agent:** \`${userAgent}\``;

  const { entries, lastSent } = readStorage();
  entries.push(content);
  writeStorage(entries, lastSent);

  console.log("📥 Beacon stored to /tmp/beacons.json");

  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAokB9AcPjGgAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", pixel.length);
  res.status(200).end(pixel);
}
