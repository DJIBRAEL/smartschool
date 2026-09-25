import { useEffect, useState } from "react";
import { myHomeworks } from "../api";

export default function MyHomeworksPage() {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    myHomeworks()
      .then(setHomeworks)
      .catch((e) => setError(e.response?.data?.message || "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const upcoming = homeworks.filter((h) => new Date(h.dueDate) >= today);
  const past = homeworks.filter((h) => new Date(h.dueDate) < today);

  function DaysLeft({ dueDate }) {
    const diff = Math.ceil((new Date(dueDate) - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return <span style={{ color: "#9ca3af", fontSize: 11 }}>Terminé</span>;
    if (diff === 0) return <span style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Aujourd'hui !</span>;
    if (diff <= 2) return <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Dans {diff} jour{diff > 1 ? "s" : ""}</span>;
    return <span style={{ background: "#d1fae5", color: "#065f46", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Dans {diff} jours</span>;
  }

  function HwCard({ hw }) {
    const isPast = new Date(hw.dueDate) < today;
    return (
      <div style={{ background: isPast ? "#f9fafb" : "#ffffff", border: `1px solid ${isPast ? "#e5e7eb" : "#ddd6fe"}`, borderRadius: 12, padding: "16px 20px", opacity: isPast ? 0.7 : 1, display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 40, height: 40, background: isPast ? "#f3f4f6" : "#ede9fe", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          📋
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#111827", fontSize: 14, marginBottom: 4 }}>{hw.title}</div>
          {hw.description && <div style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 6 }}>{hw.description}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, background: "#ede9fe", color: "#5b21b6", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>{hw.subject?.name}</span>
            <span style={{ fontSize: 12, background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>{hw.classroom?.name}</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Échéance : {new Date(hw.dueDate).toLocaleDateString("fr-FR")}</span>
            <DaysLeft dueDate={hw.dueDate} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title"><span style={{ marginRight: 8 }}>📋</span>Mes devoirs</h1>
        <p className="page-subtitle">Tous vos travaux à effectuer.</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading-text"><span className="loading-spinner" style={{ borderColor: "rgba(99,102,241,0.3)", borderTopColor: "#6366f1" }} />Chargement…</div>
      ) : homeworks.length === 0 ? (
        <div className="data-table-wrap"><div className="data-table-empty"><div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>Aucun devoir pour le moment !</div></div>
      ) : (
        <div style={{ display: "grid", gap: 24 }}>
          {upcoming.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#5b21b6", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span>⏳</span> À rendre ({upcoming.length})
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {upcoming.map((hw) => <HwCard key={hw.id} hw={hw} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span>✔️</span> Passés ({past.length})
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {past.map((hw) => <HwCard key={hw.id} hw={hw} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
