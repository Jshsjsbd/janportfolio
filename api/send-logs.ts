import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get, remove } from 'firebase/database';

const webhookUrl = "https://discord.com/api/webhooks/1385723017614721035/-cmB1QMyN6qJI_V4dcwWh3F9YdpV6K3ug-ocze8uGPmcFFxCdsaof0cm6JJfP34lhfUD";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const logsRef = ref(db, 'beacons');

  try {
    const snapshot = await get(logsRef);
    if (!snapshot.exists()) return res.status(200).json({ success: false, message: "No logs" });

    const data = snapshot.val();
    const entries = Object.values(data).map((item: any) => item.content);

    const message = `📦 **Beacon Logs (${entries.length})**\n\n` + entries.join("\n\n");

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message.slice(0, 2000) }) // Discord limit
    });

    await remove(logsRef);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error sending logs:", err);
    res.status(500).json({ success: false });
  }
}
