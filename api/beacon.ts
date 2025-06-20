// ملف beacon.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const webhookUrl = "https://discord.com/api/webhooks/1385723017614721035/-cmB1QMyN6qJI_V4dcwWh3F9YdpV6K3ug-ocze8uGPmcFFxCdsaof0cm6JJfP34lhfUD";

let queue: string[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const publicIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const source = req.query.source || "unknown";
  const localIP = req.query.local_ip || "N/A";

  const content = `📡 **Beacon Detected**
> 🌐 **Public IP:** ${publicIP}
> 🖥️ **Local IP:** ${localIP}
> 📍 **Source:** ${source}
> 🧭 **User-Agent:** \`${userAgent}\``;

  // أضف المحتوى في Queue بدل ما تبعته فوري
  queue.push(content);

  // كل 30 ثانية ابعت كل اللي في الـ queue مرة واحدة
  if (queue.length === 1) {
    setTimeout(async () => {
      const joinedContent = queue.join("\n\n");
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: joinedContent.slice(0, 2000) }), // حدود Discord
      });
      queue = []; // صفّي بعد الإرسال
    }, 30000); // 30 ثانية
  }

  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAokB9AcPjGgAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", pixel.length);
  res.status(200).end(pixel);
}
