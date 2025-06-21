import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

const storagePath = path.resolve('/tmp/storage.json');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  switch (req.method) {
    case "GET": {
      if (!fs.existsSync(storagePath)) {
        return res.status(200).json({ entries: [], lastSent: 0 });
      }

      try {
        const data = fs.readFileSync(storagePath, 'utf-8');
        const parsed = JSON.parse(data);
        return res.status(200).json(parsed);
      } catch (e) {
        return res.status(500).json({ error: "فشل في قراءة البيانات." });
      }
    }

    case "DELETE": {
      try {
        if (fs.existsSync(storagePath)) {
          fs.unlinkSync(storagePath);
        }
        return res.status(200).json({ success: true });
      } catch (e) {
        return res.status(500).json({ error: "فشل في حذف البيانات." });
      }
    }

    default:
      res.setHeader("Allow", "GET, DELETE");
      return res.status(405).end("Method Not Allowed");
  }
}
