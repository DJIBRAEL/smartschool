import { useEffect, useState } from "react";
import { myAttendances } from "../api";

const STATUS_META = {
  PRESENT: { label: "Présent", cls: "status-present", icon: "✅" },
  ABSENT:  { label: "Absent",  cls: "status-absent",  icon: "❌" },
  LATE:    { label: "Retard",  cls: "status-late",    icon: "⏰" },
  EXCUSED: { label: "Excusé", cls: "status-excused",  icon: "📄" },
};

export default function MyAttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    myAttendances()
      .then(setRecords)
      .catch((e) => setError(e.response?.data?.message || "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  const absences = records.filter((r) => r.status === "ABSENT").length;
  const retards  = records.filter((r) => r.status === "LATE").length;
  const excuses  = records.filter((r) => r.status === "EXCUSED").length;

  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title"><span style={{ marginRight: 8 }}>✅</span>Mes absences</h1>
        <p className="page-subtitle">Historique de votre assiduité.</p>
      </div>

      {/* Mini stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total absences", value: absences, bg: "#fee2e2", color: "#991b1b", icon: "❌" },
          { label: "Retards", value: retards, bg: "#fef3c7", color: "#92400e", icon: "⏰" },
          { label: "Excusés", value: excuses, bg: "#ede9fe", color: "#5b21b6", icon: "📄" },
          { label: "Présences", value: records.filter(r => r.status === "PRESENT").length, bg: "#d1fae5", color: "#065f46", icon: "✅" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: stat.bg, borderRadius: 12, padding: "16px 18px", border: `1px solid ${stat.color}22` }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 11.5, color: stat.color, marginTop: 4, opacity: 0.8 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="data-table-wrap">
        {loading ? (
          <div className="loading-text">
            <span className="loading-spinner" style={{ borderColor: "rgba(99,102,241,0.3)", borderTopColor: "#6366f1" }} />
            Chargement…
          </div>
        ) : records.length === 0 ? (
          <div className="data-table-empty"><div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>Aucune absence enregistrée.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Statut</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const meta = STATUS_META[r.status] || {};
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{new Date(r.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                    <td><span className={`badge ${meta.cls}`}>{meta.icon} {meta.label}</span></td>
                    <td style={{ color: "#6b7280", fontStyle: r.note ? "normal" : "italic" }}>{r.note || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
