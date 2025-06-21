import { useState } from "react";
import Head from "next/head";

export default function SecretPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [pass, setPass] = useState("");

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

  const tryUnlock = async () => {
    const res = await fetch("/api/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: pass }),
    });

    const data = await res.json();
    if (data.success) {
      setUnlocked(true);
    } else {
      alert("❌ كلمة السر غلط");
    }
  };

  return (
    <>
      <Head>
        <title>🚫 ممنوع</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(120deg, #181b22 0%, #2b3244 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            background: "rgba(34, 40, 49, 0.85)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            borderRadius: "18px",
            padding: "2.5rem 2rem",
            maxWidth: 480,
            width: "100%",
            color: "#ebeef5",
            border: "1.5px solid rgba(45, 212, 191, 0.18)",
            backdropFilter: "blur(8px)",
            margin: "2rem 0",
          }}
        >
          {!unlocked ? (
            <>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8, color: "#11ffd6", letterSpacing: 1 }}>
                🔒 الصفحة محمية
              </h2>
              <p style={{ marginBottom: 16, color: "#bebec6" }}>أدخل كلمة المرور للدخول:</p>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="كلمة السر"
                  style={{
                    padding: "0.7rem 1rem",
                    borderRadius: 8,
                    border: "1.5px solid #2dd4bf",
                    background: "#181b22",
                    color: "#ebeef5",
                    outline: "none",
                    fontSize: 16,
                    width: "60%",
                    boxShadow: "0 1px 4px 0 rgba(17,255,214,0.04)",
                  }}
                />
                <button
                  onClick={tryUnlock}
                  style={{
                    background: "linear-gradient(90deg, #11ffd6 0%, #6366f1 100%)",
                    color: "#181b22",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: 8,
                    padding: "0.7rem 1.5rem",
                    cursor: "pointer",
                    fontSize: 16,
                    boxShadow: "0 2px 8px 0 rgba(17,255,214,0.08)",
                    transition: "transform 0.1s",
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  دخول
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: "2.1rem", fontWeight: 900, color: "#11ffd6", marginBottom: 8, letterSpacing: 1 }}>
                Secret Control Page 🕵️
              </h1>
              <p style={{ marginBottom: 20, color: "#bebec6" }}>
                Here you can control the beacon logs.
              </p>

              <div style={{ display: "flex", gap: 12, marginBottom: 18, justifyContent: "center", alignItems: "center" }}>
                <button
                  onClick={fetchLogs}
                  style={{
                    background: "#22282a",
                    color: "#11ffd6",
                    border: "1.5px solid #11ffd6",
                    borderRadius: 8,
                    padding: "0.6rem 1.2rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 15,
                    transition: "background 0.2s, color 0.2s, transform 0.1s",
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                >📄 Show Logs</button>
                <button
                  onClick={sendLogs}
                  style={{
                    background: "linear-gradient(90deg, #11ffd6 0%, #6366f1 100%)",
                    color: "#181b22",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.6rem 1.2rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 15,
                    boxShadow: "0 2px 8px 0 rgba(17,255,214,0.08)",
                    transition: "transform 0.1s",
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                >📤 Send To Discord</button>
                <button
                  onClick={clearLogs}
                  style={{
                    background: "#181b22",
                    color: "#ff6b81",
                    border: "1.5px solid #ff6b81",
                    borderRadius: 8,
                    padding: "0.6rem 1.2rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 15,
                    transition: "background 0.2s, color 0.2s, transform 0.1s",
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                >🗑️ Delete Logs</button>
              </div>

              {status && <p style={{ color: "#2dd4bf", fontWeight: 700, marginBottom: 12 }}><strong>{status}</strong></p>}

              {logs.length > 0 && (
                <div style={{
                  backgroundColor: "#181b22",
                  padding: "1rem",
                  borderRadius: "10px",
                  border: "1.5px solid #2dd4bf",
                  marginTop: 10,
                  boxShadow: "0 1px 8px 0 rgba(17,255,214,0.04)"
                }}>
                  <h3 style={{ color: "#11ffd6", marginBottom: 10 }}>📦 البيانات المخزنة:</h3>
                  <ul style={{ maxHeight: 260, overflowY: "auto", paddingRight: 8 }}>
                    {logs.map((log, idx) => (
                      <li key={idx} style={{
                        marginBottom: "1rem",
                        whiteSpace: "pre-wrap",
                        color: "#ebeef5",
                        borderBottom: "1px solid #23272f",
                        paddingBottom: 8
                      }}>
                        {log}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
