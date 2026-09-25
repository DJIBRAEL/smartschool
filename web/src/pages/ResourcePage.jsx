import { useEffect, useState, useCallback } from "react";
import { list, listUsers, create, update, remove } from "../api";
import Modal from "../components/Modal";
import StudentCardModal from "../components/StudentCardModal";

const configs = {
  students: {
    title: "Élèves",
    icon: "👨‍🎓",
    resource: "students",
    columns: [["matricule", "Matricule"], ["user.firstName", "Prénom"], ["user.lastName", "Nom"], ["user.email", "Email"]],
    fields: [
      { key: "firstName", label: "Prénom", type: "text", required: true },
      { key: "lastName", label: "Nom", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "matricule", label: "Matricule", type: "text", required: true },
      { key: "password", label: "Mot de passe", type: "password", createOnly: true, default: "Student@123" },
      { key: "photoBase64", label: "Photo de l'élève (Optionnel)", type: "file", accept: "image/*" },
    ],
  },
  teachers: {
    title: "Enseignants",
    icon: "👩‍🏫",
    resource: "teachers",
    columns: [["user.firstName", "Prénom"], ["user.lastName", "Nom"], ["user.email", "Email"]],
    fields: [
      { key: "firstName", label: "Prénom", type: "text", required: true },
      { key: "lastName", label: "Nom", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "password", label: "Mot de passe", type: "password", createOnly: true, default: "Teacher@123" },
    ],
  },
  classes: {
    title: "Classes",
    icon: "🏫",
    resource: "classes",
    columns: [["name", "Classe"], ["level", "Niveau"], ["schoolYear.label", "Année"]],
    fields: [
      { key: "name", label: "Nom de la classe (ex: 6ème A)", type: "text", required: true },
      { key: "level", label: "Niveau (ex: Collège / Lycée / 6ème)", type: "text", required: true },
      { key: "schoolYearId", label: "Année scolaire", type: "select", optionsFrom: "schoolYears", labelKey: "label", required: true },
    ],
  },
  schoolYears: {
    title: "Années scolaires",
    icon: "📅",
    resource: "schoolYears",
    columns: [["label", "Année scolaire"], ["startDate", "Date de début"], ["endDate", "Date de fin"]],
    fields: [
      { key: "label", label: "Libellé (ex: 2025-2026)", type: "text", required: true },
      { key: "startDate", label: "Date de début", type: "date", required: true },
      { key: "endDate", label: "Date de fin", type: "date", required: true },
    ],
  },
  subjects: {
    title: "Matières",
    icon: "📚",
    resource: "subjects",
    columns: [["name", "Matière"], ["coefficient", "Coefficient"]],
    fields: [
      { key: "name", label: "Nom", type: "text", required: true },
      { key: "coefficient", label: "Coefficient", type: "number", default: 1 },
    ],
  },
  grades: {
    title: "Notes",
    icon: "📝",
    resource: "grades",
    columns: [["student.user.lastName", "Élève"], ["subject.name", "Matière"], ["score", "Note"]],
    fields: [
      { key: "studentId", label: "Élève", type: "select", optionsFrom: "students", labelKey: "user.lastName", required: true },
      { key: "subjectId", label: "Matière", type: "select", optionsFrom: "subjects", labelKey: "name", required: true },
      { key: "evaluationId", label: "Évaluation", type: "select", optionsFrom: "evaluations", labelKey: "title", required: true },
      { key: "score", label: "Note", type: "number", required: true },
      { key: "comment", label: "Commentaire", type: "text" },
    ],
  },
  attendance: {
    title: "Absences",
    icon: "✅",
    resource: "attendances",
    columns: [["student.user.lastName", "Élève"], ["date", "Date"], ["status", "Statut"]],
    fields: [
      { key: "studentId", label: "Élève", type: "select", optionsFrom: "students", labelKey: "user.lastName", required: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "status", label: "Statut", type: "select", options: [["PRESENT", "Présent"], ["ABSENT", "Absent"], ["LATE", "Retard"], ["EXCUSED", "Excusé"]], required: true },
      { key: "note", label: "Note", type: "text" },
    ],
  },
  homeworks: {
    title: "Devoirs",
    icon: "📋",
    resource: "homeworks",
    columns: [["title", "Titre"], ["subject.name", "Matière"], ["classroom.name", "Classe"], ["dueDate", "Échéance"]],
    fields: [
      { key: "title", label: "Titre", type: "text", required: true },
      { key: "description", label: "Description", type: "text" },
      { key: "subjectId", label: "Matière", type: "select", optionsFrom: "subjects", labelKey: "name", required: true },
      { key: "classroomId", label: "Classe", type: "select", optionsFrom: "classes", labelKey: "name", required: true },
      { key: "dueDate", label: "Échéance", type: "date", required: true },
    ],
  },
  invoices: {
    title: "Finances",
    icon: "💰",
    resource: "invoices",
    columns: [["label", "Facture"], ["amount", "Montant"], ["status", "Statut"], ["dueDate", "Échéance"]],
    fields: [
      { key: "studentId", label: "Élève", type: "select", optionsFrom: "students", labelKey: "user.lastName", required: true },
      { key: "label", label: "Libellé", type: "text", required: true },
      { key: "amount", label: "Montant (FCFA)", type: "number", required: true },
      { key: "dueDate", label: "Échéance", type: "date", required: true },
      { key: "status", label: "Statut", type: "select", options: [["UNPAID", "Impayé"], ["PARTIAL", "Partiel"], ["PAID", "Payé"]], default: "UNPAID" },
    ],
  },
  messages: {
    title: "Messagerie",
    icon: "✉️",
    resource: "messages",
    columns: [["sender.email", "Expéditeur"], ["receiver.email", "Destinataire"], ["content", "Message"], ["sentAt", "Date"]],
    fields: [
      { key: "receiverId", label: "Destinataire", type: "select", optionsFrom: "users", labelKey: "email", required: true },
      { key: "content", label: "Message", type: "textarea", required: true },
    ],
  },
};

function value(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? "—";
}

function optionLabel(item, labelKey) {
  if (labelKey.includes(".")) return value(item, labelKey);
  return item[labelKey] ?? item.id;
}

function rowToForm(row, fields) {
  const form = {};
  for (const f of fields) {
    if (f.key === "firstName" || f.key === "lastName" || f.key === "email") {
      form[f.key] = row.user?.[f.key] ?? "";
    } else if (f.key === "photoBase64") {
      const url = row.user?.photoUrl;
      form[f.key] = url ? (url.startsWith("http") ? url : `http://localhost:3001${url}`) : "";
    } else if (f.type === "date" && row[f.key]) {
      form[f.key] = new Date(row[f.key]).toISOString().slice(0, 10);
    } else {
      form[f.key] = row[f.key] ?? f.default ?? "";
    }
  }
  return form;
}

function emptyForm(fields) {
  const form = {};
  for (const f of fields) form[f.key] = f.default ?? "";
  return form;
}

function StatusBadge({ col, val }) {
  const statusMap = {
    PRESENT: { cls: "status-present", label: "Présent" },
    ABSENT: { cls: "status-absent", label: "Absent" },
    LATE: { cls: "status-late", label: "Retard" },
    EXCUSED: { cls: "status-excused", label: "Excusé" },
    PAID: { cls: "status-paid", label: "Payé" },
    UNPAID: { cls: "status-unpaid", label: "Impayé" },
    PARTIAL: { cls: "status-partial", label: "Partiel" },
  };
  const s = statusMap[val];
  if (s) {
    return (
      <span className={`badge ${s.cls}`}>{s.label}</span>
    );
  }
  return <span>{String(val)}</span>;
}

export default function ResourcePage({ type }) {
  const c = configs[type] || configs.students;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [cardStudent, setCardStudent] = useState(null);
  const [form, setForm] = useState(emptyForm(c.fields));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [options, setOptions] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    list(c.resource)
      .then(setRows)
      .catch((e) => setError(e.response?.data?.message || "Erreur"))
      .finally(() => setLoading(false));
  }, [c.resource]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const needed = c.fields.filter((f) => f.optionsFrom).map((f) => f.optionsFrom);
    const unique = [...new Set(needed)];
    if (!unique.length) return;
    Promise.all(
      unique.map(async (res) => {
        if (res === "users") return [res, await listUsers()];
        return [res, await list(res)];
      })
    ).then((pairs) => setOptions(Object.fromEntries(pairs))).catch(() => {});
  }, [type]);

  function openCreate() {
    setForm(emptyForm(c.fields));
    setFormError("");
    setModal({ mode: "create" });
  }

  function openEdit(row) {
    setForm(rowToForm(row, c.fields));
    setFormError("");
    setModal({ mode: "edit", id: row.id });
  }

  async function submitForm(e) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = { ...form };
    for (const f of c.fields) {
      if (f.type === "number" && payload[f.key] !== "") payload[f.key] = Number(payload[f.key]);
      if (f.type === "date" && payload[f.key]) payload[f.key] = new Date(payload[f.key]).toISOString();
      if (modal.mode === "edit" && f.createOnly) delete payload[f.key];
    }
    try {
      if (modal.mode === "create") await create(c.resource, payload);
      else await update(c.resource, modal.id, payload);
      setModal(null);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    if (!confirm("Supprimer cet élément ?")) return;
    try {
      await remove(c.resource, row.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  }

  function renderField(f) {
    if (modal?.mode === "edit" && f.createOnly) return null;
    const val = form[f.key] ?? "";

    if (f.type === "select" && f.options) {
      return (
        <div key={f.key} className="form-group">
          <label className="form-label">{f.label}</label>
          <select
            className="form-control"
            value={val}
            required={f.required}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          >
            <option value="">— Choisir —</option>
            {f.options.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      );
    }

    if (f.type === "select" && f.optionsFrom) {
      const opts = options[f.optionsFrom] || [];
      return (
        <div key={f.key} className="form-group">
          <label className="form-label">{f.label}</label>
          <select
            className="form-control"
            value={val}
            required={f.required}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          >
            <option value="">— Choisir —</option>
            {opts.map((item) => (
              <option key={item.id} value={item.id}>{optionLabel(item, f.labelKey)}</option>
            ))}
          </select>
        </div>
      );
    }

    if (f.type === "textarea") {
      return (
        <div key={f.key} className="form-group">
          <label className="form-label">{f.label}</label>
          <textarea
            className="form-control"
            value={val}
            required={f.required}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          />
        </div>
      );
    }

    if (f.type === "file") {
      return (
        <div key={f.key} className="form-group">
          <label className="form-label">{f.label}</label>
          {val && (
            <div style={{ marginBottom: 10 }}>
              <img src={val} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "50%", border: "2px solid #e5e7eb" }} />
            </div>
          )}
          <input
            className="form-control"
            type="file"
            accept={f.accept}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setForm({ ...form, [f.key]: reader.result });
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
      );
    }

    return (
      <div key={f.key} className="form-group">
        <label className="form-label">{f.label}</label>
        <input
          className="form-control"
          type={f.type}
          value={val}
          required={f.required && !(modal?.mode === "edit" && f.createOnly)}
          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
        />
      </div>
    );
  }

  // Check if a column value is a status
  const isStatusCol = (col) =>
    col === "status" || col.endsWith(".status");

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">
            <span style={{ marginRight: 8 }}>{c.icon}</span>
            {c.title}
          </h1>
          <p className="page-subtitle">Gestion des {c.title.toLowerCase()}.</p>
        </div>
        <button id={`add-${type}`} onClick={openCreate} className="btn btn-primary">
          <span>＋</span> Ajouter
        </button>
      </div>

      {/* Table */}
      <div className="data-table-wrap">
        {error ? (
          <div className="alert-error" style={{ margin: 16 }}>{error}</div>
        ) : loading ? (
          <div className="loading-text">
            <span className="loading-spinner" style={{ borderColor: "rgba(99,102,241,0.3)", borderTopColor: "var(--clr-primary)" }} />
            Chargement…
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {c.columns.map((col) => (
                  <th key={col[0]}>{col[1]}</th>
                ))}
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id}>
                    {c.columns.map((col) => {
                      const raw = value(row, col[0]);
                      const isDate =
                        col[0].toLowerCase().includes("date") ||
                        col[0].endsWith("At");
                      const isStatus = isStatusCol(col[0]);
                      return (
                        <td key={col[0]}>
                          {isStatus ? (
                            <StatusBadge col={col[0]} val={raw} />
                          ) : isDate && raw !== "—" ? (
                            new Date(raw).toLocaleDateString("fr-FR")
                          ) : (
                            String(raw)
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {type === "students" && (
                        <button onClick={() => setCardStudent(row)} className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: "12.5px", background: "transparent", color: "#6366f1", border: "none" }} title="Voir la carte d'identité">
                          🪪 Carte
                        </button>
                      )}
                      <button onClick={() => openEdit(row)} className="btn btn-edit-ghost">
                        ✏️ Modifier
                      </button>
                      <button onClick={() => handleDelete(row)} className="btn btn-danger-ghost">
                        🗑 Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={c.columns.length + 1} className="data-table-empty">
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                    Aucune donnée disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={!!modal}
        title={
          modal?.mode === "create"
            ? `Ajouter — ${c.title}`
            : `Modifier — ${c.title}`
        }
        onClose={() => setModal(null)}
      >
        <form onSubmit={submitForm}>
          {formError && <div className="alert-error">{formError}</div>}
          {c.fields.map(renderField)}
          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
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
              onClick={() => setModal(null)}
              className="btn btn-ghost"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Carte d'identité Élève */}
      {cardStudent && (
        <StudentCardModal student={cardStudent} onClose={() => setCardStudent(null)} />
      )}
    </div>
  );
}
