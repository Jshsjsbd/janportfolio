import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

const webhookUrl = "https://discord.com/api/webhooks/1385723017614721035/-cmB1QMyN6qJI_V4dcwWh3F9YdpV6K3ug-ocze8uGPmcFFxCdsaof0cm6JJfP34lhfUD";
const storagePath = path.resolve(process.cwd(), 'data/beacons.json');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!fs.existsSync(storagePath)) {
      console.log("📁 ملف التخزين غير موجود");
      return res.status(200).json({ success: false, reason: "no-file" });
    }

    const rawData = fs.readFileSync(storagePath, 'utf-8');
    const parsed = JSON.parse(rawData);
    const entries = parsed.entries || [];

    if (entries.length === 0) {
      console.log("🟡 لا توجد بيانات لإرسالها");
      return res.status(200).json({ success: false, reason: "no-entries" });
    }

    console.log("📨 جاري إرسال عدد:", entries.length);

    for (const entry of entries) {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: entry.slice(0, 1900) }),
      });

      if (!response.ok) {
        console.error("❌ فشل في الإرسال:", response.status, await response.text());
        return res.status(500).json({ success: false, reason: "discord-error" });
      }
    }

    // ✅ بعد الإرسال: مسح الملف
    fs.writeFileSync(storagePath, JSON.stringify({ entries: [], lastSent: Date.now() }, null, 2));
    console.log("✅ تم الإرسال ومسح البيانات");

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ خطأ أثناء الإرسال:", err);
    res.status(500).json({ success: false, reason: "internal-error" });
  }
}
