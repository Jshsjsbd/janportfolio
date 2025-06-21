import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

const storagePath = path.resolve('/tmp/storage.json');
const webhookUrl = "https://discord.com/api/webhooks/1385879633068687382/U-jTEIVNuVEOYCL6hbx0oRMnhm49kJBqAeh_d1yX0ziE37E92lXpuu8tjJMG-dypj1UL";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  if (!fs.existsSync(storagePath)) {
    return res.status(400).json({ success: false, error: "لا يوجد بيانات لإرسالها." });
  }

  try {
    const { entries, lastSent } = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));

    if (!entries || entries.length === 0) {
      return res.status(400).json({ success: false, error: "لا يوجد محتوى." });
    }

    const fullMessage = `📡 **Manual Beacon Log Dump:**\n\n${entries.join('\n\n')}`.slice(0, 2000);

    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: fullMessage }),
    });

    if (!webhookRes.ok) {
      return res.status(500).json({ success: false, error: "فشل في الإرسال إلى Discord." });
    }

    fs.writeFileSync(storagePath, JSON.stringify({ entries: [], lastSent: Date.now() }));
    return res.status(200).json({ success: true });

  } catch (e) {
    return res.status(500).json({ success: false, error: "خطأ غير متوقع." });
  }
}
