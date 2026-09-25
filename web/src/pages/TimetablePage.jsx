import { useEffect, useState } from "react";
import { list, create, remove } from "../api";
import Modal from "../components/Modal";

const DAYS = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const DAY_COLORS = [
  "",
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
  "linear-gradient(135deg, #3b82f6, #2563eb)",
  "linear-gradient(135deg, #ef4444, #dc2626)",
];

export default function TimetablePage() {
  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    classroomId: "",
    subjectId: "",
    teacherId: "",
    dayOfWeek: "1",
    startTime: "08:00",
    endTime: "09:00",
    room: "",
  });

  function load() {
    setLoading(true);
    Promise.all([list("timetables"), list("classes"), list("subjects"), list("teachers")])
      .then(([t, c, s, te]) => {
        setRows(t);
        setClasses(c);
        setSubjects(s);
        setTeachers(te);
        if (te[0]) setForm((f) => ({ ...f, teacherId: te[0].id }));
      })
      .catch((e) => setError(e.response?.data?.message || "Erreur"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await create("timetables", { ...form, dayOfWeek: Number(form.dayOfWeek) });
      setModal(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer ce créneau ?")) return;
    try {
      await remove("timetables", id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  }

  const grouped = rows.reduce((acc, row) => {
    const day = row.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(row);
    return acc;
  }, {});

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">
            <span style={{ marginRight: 8 }}>🗓</span>Emploi du temps
          </h1>
          <p className="page-subtitle">Planning hebdomadaire des cours.</p>
        </div>
        <button id="add-timetable" onClick={() => setModal(true)} className="btn btn-primary">
          <span>＋</span> Ajouter un créneau
        </button>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-text">
          <span
            className="loading-spinner"
            style={{ borderColor: "rgba(99,102,241,0.3)", borderTopColor: "var(--clr-primary)" }}
          />
          Chargement du planning…
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {[1, 2, 3, 4, 5].map((day) => (
            <div key={day} className="timetable-day-card">
              <div className="timetable-day-header">
                <span
                  style={{
                    display: "inline-block",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: DAY_COLORS[day],
                    marginRight: 10,
                    verticalAlign: "middle",
                    lineHeight: "28px",
                    textAlign: "center",
                    fontSize: 12,
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  {day}
                </span>
                {DAYS[day]}
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 11,
                    color: "var(--clr-text-muted)",
                    fontWeight: 400,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  {(grouped[day] || []).length} cours
                </span>
              </div>

              {(grouped[day] || []).length ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Horaire</th>
                      <th>Matière</th>
                      <th>Classe</th>
                      <th>Salle</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[day].map((row) => (
                      <tr key={row.id}>
                        <td>
                          <span
                            style={{
                              background: "#ede9fe",
                              border: "1px solid #ddd6fe",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontFamily: "monospace",
                              color: "#5b21b6",
                            }}
                          >
                            {row.startTime} – {row.endTime}
                          </span>
                        </td>
                        <td>{row.subject?.name ?? "—"}</td>
                        <td>{row.classroom?.name ?? "—"}</td>
                        <td>{row.room ?? "—"}</td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="btn btn-danger-ghost"
                          >
                            🗑 Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p
                  style={{
                    padding: "16px 18px",
                    color: "var(--clr-text-muted)",
                    fontSize: 13,
                  }}
                >
                  Aucun cours programmé ce jour.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} title="Ajouter un créneau" onClose={() => setModal(false)}>
        <form onSubmit={submit}>
          {formError && <div className="alert-error">{formError}</div>}

          <div className="form-group">
            <label className="form-label">Jour</label>
            <select
              className="form-control"
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
              required
            >
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>{DAYS[d]}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Début</label>
              <input
                className="form-control"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fin</label>
              <input
                className="form-control"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Classe</label>
            <select
              className="form-control"
              value={form.classroomId}
              onChange={(e) => setForm({ ...form, classroomId: e.target.value })}
              required
            >
              <option value="">— Choisir —</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Matière</label>
            <select
              className="form-control"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              required
            >
              <option value="">— Choisir —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Enseignant</label>
            <select
              className="form-control"
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              required
            >
              <option value="">— Choisir —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user?.firstName} {t.user?.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Salle</label>
            <input
              className="form-control"
              placeholder="ex: Salle 101"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? (
                <>
                  <span className="loading-spinner" />
                  Enregistrement…
                </>
              ) : (
                "Enregistrer"
              )}
            </button>
            <button
              type="button"
              onClick={() => setModal(false)}
              className="btn btn-ghost"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
