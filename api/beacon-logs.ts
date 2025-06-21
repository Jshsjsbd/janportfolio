import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

const storagePath = path.resolve(process.cwd(), 'data/beacons.json');

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      if (!fs.existsSync(storagePath)) {
        console.log("📁 ملف التخزين غير موجود");
        return res.status(200).json({ entries: [], lastSent: 0 });
      }

      const data = fs.readFileSync(storagePath, 'utf-8');
      const parsed = JSON.parse(data);
      console.log("📦 تم قراءة البيانات:", parsed);
      return res.status(200).json(parsed);
    }

    if (req.method === "DELETE") {
      fs.writeFileSync(storagePath, JSON.stringify({ entries: [], lastSent: Date.now() }, null, 2));
      console.log("🗑️ تم مسح البيانات المخزنة");
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    console.error("❌ خطأ:", err);
    res.status(500).json({ error: "فشل في المعالجة" });
  }
}
