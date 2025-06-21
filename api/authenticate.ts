import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { password } = req.body;

  if (password === process.env.SECRET_PASSWORD) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ success: false, message: "Wrong password" });
}
