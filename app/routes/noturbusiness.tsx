import { useState } from "react";
import Head from "next/head";

export default function SecretPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [pass, setPass] = useState("");

  const PASSWORD = "N07 UR 8U51N355"; // ← غيّرها لباسورد سري تحبه

  const fetchLogs = async () => {
    setStatus("📥 جاري تحميل البيانات...");
    const res = await fetch("/api/beacon-logs");
    const data = await res.json();
    setLogs(Array.isArray(data.entries) ? data.entries : []);
    setStatus(null);
  };

  const sendLogs = async () => {
    setStatus("📤 جاري إرسال البيانات...");
    const res = await fetch("/api/send-logs", { method: "POST" });
    const data = await res.json();
    setStatus(data.success ? "✅ تم الإرسال بنجاح!" : "❌ فشل في الإرسال.");
    setLogs([]);
  };

  const clearLogs = async () => {
    const confirm = window.confirm("هل أنت متأكد من مسح جميع البيانات المخزنة؟");
    if (!confirm) return;
    await fetch("/api/beacon-logs", { method: "DELETE" });
    setLogs([]);
    setStatus("🗑️ تم المسح.");
  };

  return (
    <>
      <Head>
        <title>🚫 ممنوع</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {!unlocked ? (
        <div style={{ padding: "2rem", background: "#111", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <h2>🔒 الصفحة محمية</h2>
          <p>أدخل كلمة المرور للدخول:</p>
          <input
            type="text"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="كلمة السر"
            style={{ padding: "0.5rem", marginRight: "1rem" }}
          />
          <button
            onClick={() => {
              if (pass === PASSWORD) {
                setUnlocked(true);
              } else {
                alert("❌ كلمة السر غلط");
              }
            }}
          >
            دخول
          </button>
        </div>
      ) : (
        <div style={{ padding: "2rem", fontFamily: "sans-serif", backgroundColor: "#111", color: "#eee", minHeight: "100vh" }}>
          <h1>🕵️ صفحة التحكم السرية</h1>
          <p style={{ marginBottom: "1rem" }}>
            هنا تقدر تشوف، تبعت، أو تمسح كل بيانات الـ Beacon المخزنة.
          </p>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <button onClick={fetchLogs}>📄 عرض البيانات</button>
            <button onClick={sendLogs}>📤 إرسال إلى Discord</button>
            <button onClick={clearLogs}>🗑️ مسح الكل</button>
          </div>

          {status && <p><strong>{status}</strong></p>}

          {logs.length > 0 && (
            <div style={{ backgroundColor: "#222", padding: "1rem", borderRadius: "8px" }}>
              <h3>📦 البيانات المخزنة:</h3>
              <ul>
                {logs.map((log, idx) => (
                  <li key={idx} style={{ marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
                    {log}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}
