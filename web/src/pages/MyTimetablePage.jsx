import { useEffect, useState } from "react";
import { myTimetable } from "../api";

const DAYS = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const DAY_COLORS = [
  "",
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
  "linear-gradient(135deg, #3b82f6, #2563eb)",
  "linear-gradient(135deg, #ef4444, #dc2626)",
];

export default function MyTimetablePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    myTimetable()
      .then(setRows)
      .catch((e) => setError(e.response?.data?.message || "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  const grouped = rows.reduce((acc, row) => {
    const day = row.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(row);
    return acc;
  }, {});

  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title"><span style={{ marginRight: 8 }}>🗓</span>Mon emploi du temps</h1>
        <p className="page-subtitle">Votre planning de cours hebdomadaire.</p>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-text"><span className="loading-spinner" style={{ borderColor: "rgba(99,102,241,0.3)", borderTopColor: "var(--clr-primary)" }} />Chargement du planning…</div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {[1, 2, 3, 4, 5].map((day) => (
            <div key={day} className="timetable-day-card">
              <div className="timetable-day-header">
                <span style={{ display: "inline-block", width: 28, height: 28, borderRadius: "50%", background: DAY_COLORS[day], marginRight: 10, verticalAlign: "middle", lineHeight: "28px", textAlign: "center", fontSize: 12, color: "#fff", fontWeight: 700 }}>
                  {day}
                </span>
                {DAYS[day]}
                <span style={{ marginLeft: 8, fontSize: 11, color: "#9ca3af", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                  {(grouped[day] || []).length} cours
                </span>
              </div>

              {(grouped[day] || []).length ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Horaire</th>
                      <th>Matière</th>
                      <th>Salle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[day].map((row) => (
                      <tr key={row.id}>
                        <td style={{ width: 140 }}>
                          <span style={{ background: "#ede9fe", border: "1px solid #ddd6fe", padding: "3px 8px", borderRadius: 6, fontSize: 12, fontFamily: "monospace", color: "#5b21b6" }}>
                            {row.startTime} – {row.endTime}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: "#111827" }}>{row.subject?.name ?? "—"}</td>
                        <td style={{ color: "#6b7280" }}>{row.room ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ padding: "16px 18px", color: "#9ca3af", fontSize: 13 }}>Aucun cours ce jour.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
