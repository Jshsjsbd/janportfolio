import type { VercelRequest, VercelResponse } from "@vercel/node";
// @ts-ignore
import { db } from "./firebase.js";
import { ref, get, set, update, remove } from "firebase/database";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.FIREBASE_SECRET!;
  const bannedRef = ref(db, `secure_beacons/${secret}/banned`);

  if (req.method === "GET") {
    try {
      const snapshot = await get(bannedRef);
      const data = snapshot.exists() ? snapshot.val() : {};
      const ips = Object.keys(data || {});
      return res.status(200).json({ ips });
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch banned IPs" });
    }
  }

  if (req.method === "POST") {
    const { ip } = req.body;
    if (!ip || typeof ip !== "string") return res.status(400).json({ error: "Invalid IP" });

    try {
      await update(bannedRef, { [ip]: true });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to add IP" });
    }
  }

  if (req.method === "DELETE") {
    const { ip } = req.body;
    if (!ip || typeof ip !== "string") return res.status(400).json({ error: "Invalid IP" });

    try {
      await remove(ref(db, `secure_beacons/${secret}/banned/${ip}`));
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to remove IP" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
