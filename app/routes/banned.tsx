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
            fontSize: "2rem",
          }}
        >
            Your Ip Is Banned 🚫
        </div>
    </div>
  );
}
