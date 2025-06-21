import { useState, useEffect } from "react";
import Head from "next/head";

export default function SecretPage() {
  // ... حالات الباسورد + unlocked + logs كما بالسابق ...
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

  // حالات الـ banned IPs
  const [bannedIps, setBannedIps] = useState<string[]>([]);
  const [ipInput, setIpInput] = useState("");
  const [ipStatus, setIpStatus] = useState<string | null>(null);

  // جلب الـ IPs عند الفتح
  useEffect(() => {
    if (!unlocked) return;
    fetch("/api/banned-ips")
      .then(res => res.json())
      .then(data => setBannedIps(Array.isArray(data.ips) ? data.ips : []))
      .catch(() => setIpStatus("❌ خطأ في جلب الـ IPs"));
  }, [unlocked]);

  const addIp = async () => {
    const ip = ipInput.trim();
    if (!ip) return alert("Enter a valid IP");
    if (bannedIps.includes(ip)) return setIpStatus("⚠️ This IP Is Already Banned");

    const res = await fetch("/api/banned-ips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    });
    if (res.ok) {
      setBannedIps(prev => [...prev, ip]);
      setIpStatus("✅ Done Adding The IP");
      setIpInput("");
    } else {
      setIpStatus("❌ Cannot Add The IP");
    }
  };

  const removeIp = async () => {
    const ip = ipInput.trim();
    if (!ip) return alert("أدخل IP صحيح");
    if (!bannedIps.includes(ip)) return setIpStatus("⚠️ This IP Is Not Banned");

    const res = await fetch("/api/banned-ips", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    });
    if (res.ok) {
      setBannedIps(prev => prev.filter(x => x !== ip));
      setIpStatus("✅ Done Removing The IP");
      setIpInput("");
    } else {
      setIpStatus("❌ Cannot Remove The IP");
    }
  };

  return (
    <>
      <Head>
        <title>🚫 ممنوع</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{ /* نفس ستايل الخلفية والـ container */ minHeight: "100vh", background: "linear-gradient(120deg, #181b22 0%, #2b3244 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ /* نفس الكارت */ background: "rgba(34, 40, 49, 0.85)", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", borderRadius: "18px", padding: "2.5rem 2rem", maxWidth: 480, width: "100%", color: "#ebeef5", border: "1.5px solid rgba(45, 212, 191, 0.18)", backdropFilter: "blur(8px)", margin: "2rem 0" }}>
          
          {!unlocked ? (
            // ... كود شاشة الباسورد كما فوق ...
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
              <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                {/* ... كود الـ logs كما عندك ... */}

                {/* 👇 الجزء الجديد: Form إدارة الـ IPs */}
                <h2 style={{ fontSize: "2rem", color: "#11ffd6" }}>❌ IPs Control Panel</h2>
                <div style={{ display: "flex", gap: 20, marginTop: 30, flexDirection: "column" }}>
                    <div style={{width: "100%"}}>
                        <input
                        type="text"
                        value={ipInput}
                        onChange={e => setIpInput(e.target.value)}
                        placeholder="Write The IP"
                        style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: 8, border: "1.5px solid #2dd4bf", background: "#181b22", color: "#ebeef5", fontSize: 16, width: "100%" }}
                        />
                    </div>
                    <div style={{display: "flex", flexDirection: "row", gap: 20}}>
                        <button
                        onClick={addIp}
                        style={{
                            background: "#11ffd6",
                            color: "black",
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
                        >➕ Add IP</button>
                        <button
                        onClick={removeIp}
                        style={{
                            background: "#ff6b81",
                            color: "black",
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
                        >➖ Remove IP</button>
                    </div>
                </div>
                {ipStatus && <p style={{ marginTop: 8, color: "#2dd4bf", fontWeight: 700 }}>{ipStatus}</p>}

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#181b22",
                  padding: "1rem",
                  borderRadius: "10px",
                  border: "1.5px solid #2dd4bf",
                  marginTop: 50,
                  boxShadow: "0 1px 8px 0 rgba(17,255,214,0.04)",
                  width: "100%"
                }}>
                    <p style={{ color: "#bebec6" }}>Banned IPs :</p>
                    <ul style={{ maxHeight: 260, overflowY: "auto", paddingRight: 8 }}>
                        {bannedIps.map((ip, i) => (
                        <li key={i} style={{ padding: "4px 0", color: "#ebeef5", borderBottom: "1px solid #23272f", whiteSpace: "pre-wrap" }}>{ip}</li>
                        ))}
                    </ul>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
