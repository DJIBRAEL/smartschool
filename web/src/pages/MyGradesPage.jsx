import { useEffect, useState } from "react";
import { myGrades } from "../api";

export default function MyGradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    myGrades()
      .then(setGrades)
      .catch((e) => setError(e.response?.data?.message || "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  const average = grades.length
    ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(2)
    : null;

  const bySubject = grades.reduce((acc, g) => {
    const key = g.subject?.name || "Autre";
    if (!acc[key]) acc[key] = [];
    acc[key].push(g);
    return acc;
  }, {});

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="page-title"><span style={{ marginRight: 8 }}>📝</span>Mes notes</h1>
          <p className="page-subtitle">Résultats de toutes vos évaluations.</p>
        </div>
        {average && (
          <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", padding: "12px 20px", borderRadius: 12, textAlign: "center", boxShadow: "0 6px 20px rgba(99,102,241,0.3)" }}>
            <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>MOYENNE GÉNÉRALE</div>
            <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{average}<span style={{ fontSize: 14, opacity: 0.7 }}>/20</span></div>
          </div>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading-text"><span className="loading-spinner" style={{ borderColor: "rgba(99,102,241,0.3)", borderTopColor: "#6366f1" }} />Chargement…</div>
      ) : grades.length === 0 ? (
        <div className="data-table-wrap"><div className="data-table-empty"><div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>Aucune note disponible.</div></div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {Object.entries(bySubject).map(([subject, subGrades]) => {
            const avg = (subGrades.reduce((s, g) => s + g.score, 0) / subGrades.length).toFixed(1);
            return (
              <div key={subject} className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "#f8f9fc", borderBottom: "1px solid #e5e7eb" }}>
                  <span style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>📚 {subject}</span>
                  <span style={{ fontWeight: 700, color: Number(avg) >= 10 ? "#059669" : "#dc2626", fontSize: 14 }}>
                    Moy: {avg}/20
                  </span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Évaluation</th>
                      <th>Date</th>
                      <th>Note</th>
                      <th>Commentaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subGrades.map((g) => (
                      <tr key={g.id}>
                        <td>{g.evaluation?.title || "—"}</td>
                        <td>{g.evaluation?.date ? new Date(g.evaluation.date).toLocaleDateString("fr-FR") : "—"}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: g.score >= 10 ? "#059669" : "#dc2626", fontSize: 15 }}>
                            {g.score}<span style={{ fontSize: 11, color: "#9ca3af" }}>/20</span>
                          </span>
                        </td>
                        <td style={{ color: "#6b7280", fontStyle: g.comment ? "normal" : "italic" }}>
                          {g.comment || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
