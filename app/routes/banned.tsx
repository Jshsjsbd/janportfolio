import { useEffect, useState } from "react";

export default function BannedPage() {
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    fetch("/api/ip-check")
      .then(res => {
        if (res.status === 403) {
          setIsBanned(true); // فعلاً متبند
        } else {
          window.location.href = "/home"; // مش متبند → نرجّعه
        }
      })
      .catch(err => {
        console.error("IP check failed", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p style={{ color: "white", padding: "2rem" }}>جارٍ التحقق...</p>;
  }

  if (!isBanned) return null;

  return (
    <div style={{ padding: "2rem", color: "red", fontFamily: "sans-serif", minHeight: "100vh", background: "#111" }}>
      <h1>🚫 تم حظرك</h1>
      <p>تم منعك من الوصول إلى هذا الموقع.</p>
    </div>
  );
}
