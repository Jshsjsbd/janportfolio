import { useEffect } from "react";

export default function BannedPage() {
  useEffect(() => {
    fetch("/api/ip-check")
      .then(res => {
        if (res.status !== 403) {
          window.location.href = "/home"; // أو "/"
        }
      })
      .catch(err => {
        console.error("IP check failed", err);
      });
  }, []);

  return (
    <div style={{ padding: "2rem", color: "red", fontFamily: "sans-serif", minHeight: "100vh", background: "#111" }}>
      <h1>🚫 تم حظرك</h1>
      <p>تم منعك من الوصول إلى هذا الموقع.</p>
    </div>
  );
}
