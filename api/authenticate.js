// api/authenticate.js
export default function handler(req, res) {
    // السماح بـ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
    return res.status(200).end();
    }

    if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { password } = req.body;

    if (password === process.env.SECRET_PASSWORD) {
    return res.status(200).json({ success: true });
    }

    return res.status(401).json({ success: false, message: "Wrong password" });
}