import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { myGrades, myAttendances, myHomeworks, myTimetableTeacher, stats } from "../api";

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANTS VISUELS LÉGERS (SVG & CSS fluides, cliquables & interactifs)
// ─────────────────────────────────────────────────────────────────────────────

// Jauge circulaire SVG auto-centrée et proportionnelle, cliquable
function CircularGauge({ percent, size = 96, strokeWidth = 9, color = "#10b981", label, onClick, title }) {
  const safePercent = Math.min(100, Math.max(0, percent || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div
      onClick={onClick}
      title={title}
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = "scale(1.06)")}
      onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = "scale(1)")}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
          {safePercent}%
        </span>
        {label && <span style={{ fontSize: 9.5, color: "#64748b", fontWeight: 600, marginTop: 3 }}>{label}</span>}
      </div>
    </div>
  );
}

// Histogramme de répartition des notes cliquable
function GradeDistributionHistogram({ distribution = [], onBarClick }) {
  const navigate = useNavigate();
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const handleClick = (item) => {
    if (onBarClick) {
      onBarClick(item);
    } else {
      navigate("/grades");
    }
  };

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#334155" }}>Distribution des moyennes</span>
        <button
          type="button"
          onClick={() => navigate("/grades")}
          title="Consulter le carnet de notes"
          style={{
            fontSize: 11,
            color: "#4f46e5",
            background: "#eef2ff",
            padding: "3px 8px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e7ff")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#eef2ff")}
        >
          <span>Voir notes</span>
          <span>→</span>
        </button>
      </div>

      {/* Barres verticales cliquables */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110, paddingBottom: 6, borderBottom: "1px solid #f1f5f9" }}>
        {distribution.map((item, idx) => {
          const heightPercent = Math.max(12, Math.round((item.count / maxCount) * 100));
          return (
            <div
              key={idx}
              onClick={() => handleClick(item)}
              title={`${item.label} : ${item.count} élève(s) (${item.percent}%) — Cliquer pour voir les notes`}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                justifyContent: "flex-end",
                minWidth: 0,
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: item.color, marginBottom: 3 }}>
                {item.count}
              </span>
              <div
                style={{
                  width: "100%",
                  maxWidth: 34,
                  height: `${heightPercent}%`,
                  background: `linear-gradient(180deg, ${item.color}, ${item.color}cc)`,
                  borderRadius: "5px 5px 2px 2px",
                  transition: "height 0.5s ease",
                  boxShadow: `0 3px 8px ${item.color}25`,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: "#64748b",
                  fontWeight: 600,
                  marginTop: 6,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}
              >
                {item.label.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Légende horizontale avec pastilles cliquables */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", marginTop: 10 }}>
        {distribution.map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(item)}
            title="Cliquer pour voir les notes de cette tranche"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "#64748b",
              cursor: "pointer",
              padding: "2px 6px",
              borderRadius: 4,
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
            <span>{item.label.split(" ")[0]} : <strong>{item.percent}%</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ADMINISTRATEUR (Vue d'ensemble Complète & Équilibrée)
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const loadStats = () => {
    setRefreshing(true);
    stats()
      .then((res) => {
        setData(res);
        setError("");
      })
      .catch((e) => setError(e.message || "Erreur de chargement"))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  // Données prêtes avec valeurs par défaut stables
  const s = data || {
    students: 0,
    teachers: 0,
    classes: 0,
    pendingInvoices: 0,
    subjects: 0,
    academic: {
      averageGrade: 14.5,
      totalGrades: 0,
      successRate: 90,
      highestGrade: 18,
      lowestGrade: 10,
      distribution: [],
      subjectPerformance: [],
    },
    attendance: {
      presenceRate: 95,
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      justifiedAbsences: 0,
      unjustifiedAbsences: 0,
    },
    financial: {
      totalBilled: 0,
      totalCollected: 0,
      totalPending: 0,
      collectionRate: 100,
      paidInvoicesCount: 0,
      pendingInvoicesCount: 0,
    },
    classesDistribution: [],
    recentActivities: [],
  };

  const studentTeacherRatio = s.teachers > 0 ? (s.students / s.teachers).toFixed(1) : s.students;

  // 4 Cartes KPI Principales (Grille 4 x 1 ou 2 x 2 équilibrée sans débordement)
  const kpiCards = [
    {
      label: "Élèves Inscrits",
      value: s.students,
      sub: `Ratio : ${studentTeacherRatio} él./prof`,
      badge: "100% actifs",
      badgeColor: "#10b981",
      path: "/students",
      icon: "👨‍🎓",
      gradient: "linear-gradient(135deg, #6366f1, #4f46e5)",
      glow: "rgba(99,102,241,0.2)",
    },
    {
      label: "Corps Enseignant",
      value: s.teachers,
      sub: `${s.classes} classes actives`,
      badge: "Actifs",
      badgeColor: "#6366f1",
      path: "/teachers",
      icon: "👩‍🏫",
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      glow: "rgba(16,185,129,0.2)",
    },
    {
      label: "Moyenne Générale",
      value: `${s.academic?.averageGrade ?? 14.5}/20`,
      sub: `Réussite : ${s.academic?.successRate ?? 90}%`,
      badge: s.academic?.averageGrade >= 14 ? "Excellent" : "Satisfaisant",
      badgeColor: "#8b5cf6",
      path: "/grades",
      icon: "🎓",
      gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      glow: "rgba(139,92,246,0.2)",
    },
    {
      label: "Taux de Présence",
      value: `${s.attendance?.presenceRate ?? 95}%`,
      sub: `${s.attendance?.absent ?? 0} absence(s)`,
      badge: s.attendance?.presenceRate >= 90 ? "Assiduité optimale" : "À surveiller",
      badgeColor: s.attendance?.presenceRate >= 90 ? "#059669" : "#d97706",
      path: "/attendance",
      icon: "⏱️",
      gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
      glow: "rgba(6,182,212,0.2)",
    },
  ];

  // 8 Raccourcis rapides
  const shortcuts = [
    { label: "Élèves", path: "/students", icon: "👨‍🎓", desc: "Inscriptions & dossiers" },
    { label: "Enseignants", path: "/teachers", icon: "👩‍🏫", desc: "Corps professoral" },
    { label: "Classes", path: "/classes", icon: "🏫", desc: "Niveaux & groupes" },
    { label: "Matières", path: "/subjects", icon: "📚", desc: "Coefficients" },
    { label: "Notes & Moyennes", path: "/grades", icon: "📝", desc: "Relevés & bulletins" },
    { label: "Assiduité & Appel", path: "/attendance", icon: "✅", desc: "Présences & absences" },
    { label: "Frais & Factures", path: "/invoices", icon: "💰", desc: "Scolarité & reçus" },
    { label: "Emploi du temps", path: "/timetable", icon: "🗓", desc: "Planning des cours" },
  ];

  return (
    <div className="page-content" style={{ boxSizing: "border-box", width: "100%", maxWidth: 1350, margin: "0 auto" }}>
      {/* ─── BANNIÈRE HERO SUPÉRIEURE ────────────────────────────────────────── */}
      <div className="dashboard-hero">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, position: "relative", zIndex: 2 }}>
          <div style={{ minWidth: 260, flex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, marginBottom: 8, backdropFilter: "blur(4px)" }}>
              <span>🏫 SmartSchool</span>
              <span>•</span>
              <span style={{ textTransform: "capitalize" }}>{todayStr}</span>
              <span>•</span>
              <span style={{ color: "#4ade80" }}>● En ligne</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.4px" }}>
              {greeting}, {user.firstName || "Administrateur"} 👋
            </h1>
            <p style={{ margin: "4px 0 0", opacity: 0.85, fontSize: 13, maxWidth: 500 }}>
              Pilotage académique, assiduité et finances en temps réel de votre établissement.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={loadStats}
              disabled={refreshing}
              className="btn"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "8px 14px",
                fontSize: 12.5,
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <span style={{ display: "inline-block", transform: refreshing ? "rotate(360deg)" : "none", transition: "transform 0.5s ease" }}>
                🔄
              </span>
              {refreshing ? "Actualisation…" : "Actualiser"}
            </button>
            <Link
              to="/students"
              className="btn"
              style={{
                background: "#ffffff",
                color: "#312e81",
                fontWeight: 700,
                padding: "8px 14px",
                fontSize: 12.5,
                borderRadius: 8,
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              ➕ Nouvel élève
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#dc2626", marginBottom: 18, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ─── 4 CARTES KPI PRINCIPALES (PARFAITEMENT ÉQUILIBRÉES) ─────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginBottom: 22 }}>
        {kpiCards.map((card) => (
          <Link
            key={card.label}
            to={card.path}
            className="kpi-card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: card.gradient,
                  boxShadow: `0 4px 12px ${card.glow}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 19,
                }}
              >
                {card.icon}
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: card.badgeColor,
                  background: `${card.badgeColor}15`,
                  padding: "2px 7px",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                }}
              >
                {card.badge}
              </span>
            </div>

            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#64748b", marginBottom: 3 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.4px" }}>
                {card.value}
              </div>
              <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 3 }}>
                {card.sub}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ─── VUE D'ENSEMBLE & STATISTIQUES MULTI-ONGLETS ──────────────────────── */}
      <div className="card" style={{ padding: "20px 22px", marginBottom: 22, overflow: "hidden" }}>
        {/* Barre de titre et onglets */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: 14,
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200 }}>
            <span style={{ fontSize: 20 }}>📊</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                Vue d'Ensemble & Statistiques
              </h2>
              <p style={{ margin: 0, fontSize: 11.5, color: "#64748b" }}>
                Indicateurs de performance et analyse de l'établissement
              </p>
            </div>
          </div>

          <div style={{ display: "flex", background: "#f1f5f9", padding: 3, borderRadius: 10, gap: 3, flexWrap: "wrap" }}>
            {[
              { id: "overview", label: "Vue Globale", icon: "🌐" },
              { id: "academic", label: "Académique", icon: "🎓" },
              { id: "attendance", label: "Assiduité", icon: "⏱️" },
              { id: "finance", label: "Trésorerie", icon: "💳" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`dashboard-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── ONGLET 1 : VUE GLOBALE ────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {/* Colonne Gauche : Distribution des Notes */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 18px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🎯</span>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>Niveau Académique</span>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "2px 7px", borderRadius: 6 }}>
                  Moyenne : {s.academic?.averageGrade ?? 14.5}/20
                </span>
              </div>
              <GradeDistributionHistogram distribution={s.academic?.distribution || []} />
            </div>

            {/* Colonne Droite : Assiduité & Bilan Financier */}
            <div style={{ display: "grid", gap: 14 }}>
              {/* Carte Assiduité */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>⏱️</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Assiduité des cours</span>
                  </div>
                  <Link
                    to="/attendance"
                    title="Ouvrir le module Assiduité & Appel"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#059669",
                      background: "#ecfdf5",
                      padding: "2px 7px",
                      borderRadius: 6,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#d1fae5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#ecfdf5")}
                  >
                    <span>{s.attendance?.presenceRate ?? 95}% Présents</span>
                    <span>→</span>
                  </Link>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <CircularGauge
                    percent={s.attendance?.presenceRate ?? 95}
                    size={84}
                    strokeWidth={8}
                    color="#10b981"
                    label="Présents"
                    onClick={() => navigate("/attendance")}
                    title="Cliquer pour voir la feuille d'appel et assiduité"
                  />
                  <div style={{ display: "grid", gap: 6, flex: 1, minWidth: 0 }}>
                    <Link
                      to="/attendance"
                      title="Cliquer pour filtrer les présences"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        textDecoration: "none",
                        color: "inherit",
                        padding: "3px 6px",
                        borderRadius: 6,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
                        Présences
                      </span>
                      <strong style={{ color: "#0f172a" }}>{s.attendance?.present ?? 0} →</strong>
                    </Link>
                    <Link
                      to="/attendance"
                      title="Cliquer pour voir les retards"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        textDecoration: "none",
                        color: "inherit",
                        padding: "3px 6px",
                        borderRadius: 6,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b" }} />
                        Retards
                      </span>
                      <strong style={{ color: "#0f172a" }}>{s.attendance?.late ?? 0} →</strong>
                    </Link>
                    <Link
                      to="/attendance"
                      title="Cliquer pour examiner les absences"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        textDecoration: "none",
                        color: "inherit",
                        padding: "3px 6px",
                        borderRadius: 6,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
                        Absences
                      </span>
                      <strong style={{ color: "#dc2626" }}>{s.attendance?.absent ?? 0} →</strong>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Carte Recouvrement Financier Cliquable */}
              <Link
                to="/invoices"
                title="Cliquer pour gérer les factures et le recouvrement"
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  background: "#f8fafc",
                  borderRadius: 12,
                  padding: "14px 16px",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#f59e0b";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(245,158,11,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>💰</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Frais de Scolarité</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", background: "#fffbeb", padding: "2px 7px", borderRadius: 6 }}>
                    {s.financial?.collectionRate ?? 0}% Recouvré →
                  </span>
                </div>

                {/* Barre de progression segmentée */}
                <div style={{ height: 9, background: "#e2e8f0", borderRadius: 5, overflow: "hidden", display: "flex", marginBottom: 8 }}>
                  <div
                    style={{
                      width: `${s.financial?.collectionRate ?? 0}%`,
                      background: "linear-gradient(90deg, #10b981, #059669)",
                    }}
                    title={`Encaissé : ${s.financial?.collectionRate ?? 0}%`}
                  />
                  <div
                    style={{
                      width: `${100 - (s.financial?.collectionRate ?? 0)}%`,
                      background: "#ef4444",
                    }}
                    title={`Restant : ${100 - (s.financial?.collectionRate ?? 0)}%`}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#475569" }}>
                  <span>Encaissé : <strong style={{ color: "#059669" }}>{(s.financial?.totalCollected ?? 0).toLocaleString("fr-FR")} FCFA</strong></span>
                  <span>Dû : <strong style={{ color: "#dc2626" }}>{(s.financial?.totalPending ?? 0).toLocaleString("fr-FR")} FCFA</strong></span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* ── ONGLET 2 : ANALYSE ACADÉMIQUE DÉTAILLÉE ───────────────────────── */}
        {activeTab === "academic" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                  Moyennes par Matière
                </h3>
                <Link to="/grades" style={{ fontSize: 11, color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>
                  Consulter →
                </Link>
              </div>
              {s.academic?.subjectPerformance?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {s.academic.subjectPerformance.map((sub, idx) => (
                    <Link
                      key={idx}
                      to="/grades"
                      title={`Voir le carnet de notes en ${sub.name}`}
                      style={{
                        display: "block",
                        textDecoration: "none",
                        color: "inherit",
                        padding: "6px 8px",
                        borderRadius: 8,
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600, color: "#334155" }}>{sub.name}</span>
                        <span style={{ fontWeight: 800, color: sub.average >= 14 ? "#059669" : sub.average >= 10 ? "#3b82f6" : "#dc2626" }}>
                          {sub.average} / 20 →
                        </span>
                      </div>
                      <div style={{ height: 7, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${(sub.average / 20) * 100}%`,
                            height: "100%",
                            background: sub.average >= 14 ? "#10b981" : sub.average >= 10 ? "#6366f1" : "#ef4444",
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: 12.5 }}>Aucune note enregistrée pour le moment.</p>
              )}
            </div>

            <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                  Indicateurs Académiques Clés
                </h3>
                <Link to="/grades" style={{ fontSize: 11, color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>
                  Détails →
                </Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Link
                  to="/grades"
                  title="Cliquer pour voir les meilleures notes"
                  style={{
                    background: "#ffffff",
                    padding: "12px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#10b981";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ fontSize: 11, color: "#64748b" }}>Note maximale →</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>
                    {s.academic?.highestGrade ?? 20} / 20
                  </div>
                </Link>
                <Link
                  to="/grades"
                  title="Cliquer pour voir les statistiques d'admissibilité"
                  style={{
                    background: "#ffffff",
                    padding: "12px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#6366f1";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ fontSize: 11, color: "#64748b" }}>Taux de réussite →</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#6366f1" }}>
                    {s.academic?.successRate ?? 90}%
                  </div>
                </Link>
              </div>
              <div style={{ marginTop: 14 }}>
                <GradeDistributionHistogram distribution={s.academic?.distribution || []} />
              </div>
            </div>
          </div>
        )}

        {/* ── ONGLET 3 : ASSIDUITÉ ─────────────────────────────────────────── */}
        {activeTab === "attendance" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                Jauge Globale de Présence
              </h3>
              <CircularGauge
                percent={s.attendance?.presenceRate ?? 95}
                size={110}
                strokeWidth={10}
                color="#10b981"
                label="Présents"
                onClick={() => navigate("/attendance")}
                title="Cliquer pour ouvrir le module Assiduité & Appel"
              />
              <p style={{ fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 12, maxWidth: 280 }}>
                {s.attendance?.presenceRate >= 90
                  ? "Assiduité globale exemplaire."
                  : "Attention requise : surveillez les élèves avec retards répétés."}
              </p>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                  Décompte des Appels
                </h3>
                <Link to="/attendance" style={{ fontSize: 11, color: "#059669", textDecoration: "none", fontWeight: 600 }}>
                  Feuille d'appel →
                </Link>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { label: "Séances en présence", value: s.attendance?.present ?? 0, color: "#10b981", icon: "✅" },
                  { label: "Retards signalés", value: s.attendance?.late ?? 0, color: "#f59e0b", icon: "⏰" },
                  { label: "Absences justifiées", value: s.attendance?.justifiedAbsences ?? 0, color: "#3b82f6", icon: "📄" },
                  { label: "Absences non justifiées", value: s.attendance?.unjustifiedAbsences ?? 0, color: "#ef4444", icon: "⚠️" },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    to="/attendance"
                    title={`Cliquer pour consulter : ${item.label}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      textDecoration: "none",
                      color: "inherit",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.color;
                      e.currentTarget.style.transform = "translateX(3px)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{item.icon}</span>
                      <span style={{ fontSize: 12.5, color: "#334155" }}>{item.label}</span>
                    </div>
                    <strong style={{ fontSize: 14, color: item.color }}>{item.value} →</strong>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ONGLET 4 : FINANCES ──────────────────────────────────────────── */}
        {activeTab === "finance" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div style={{ background: "#f8fafc", padding: "18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                  Bilan de Recouvrement
                </h3>
                <Link to="/invoices" style={{ fontSize: 11, color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
                  Voir factures →
                </Link>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <Link
                  to="/invoices"
                  title="Cliquer pour voir l'ensemble des factures émises"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    background: "#ffffff",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#6366f1";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ fontSize: 11, color: "#64748b" }}>Montant Total Émis →</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                    {(s.financial?.totalBilled ?? 0).toLocaleString("fr-FR")} FCFA
                  </div>
                </Link>
                <Link
                  to="/invoices"
                  title="Cliquer pour voir les règlements perçus"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    background: "#ffffff",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #bbf7d0",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#10b981";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#bbf7d0";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>Total Encaissé →</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#059669" }}>
                    {(s.financial?.totalCollected ?? 0).toLocaleString("fr-FR")} FCFA
                  </div>
                </Link>
                <Link
                  to="/invoices"
                  title="Cliquer pour voir les créances et impayés"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    background: "#ffffff",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #fecaca",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#ef4444";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#fecaca";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>Reste à Recouvrer →</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#dc2626" }}>
                    {(s.financial?.totalPending ?? 0).toLocaleString("fr-FR")} FCFA
                  </div>
                </Link>
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: "18px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                Factures & Actions
              </h3>
              <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                <Link
                  to="/invoices"
                  title="Voir les factures payées"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12.5,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#10b981")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                >
                  <span style={{ color: "#334155" }}>Factures soldées</span>
                  <strong style={{ color: "#059669" }}>{s.financial?.paidInvoicesCount ?? 0} →</strong>
                </Link>
                <Link
                  to="/invoices"
                  title="Voir les factures impayées ou en retard"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12.5,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ef4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                >
                  <span style={{ color: "#334155" }}>Factures en attente</span>
                  <strong style={{ color: "#dc2626" }}>{s.financial?.pendingInvoicesCount ?? 0} →</strong>
                </Link>
              </div>
              <Link
                to="/invoices"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", textDecoration: "none", fontSize: 13, padding: "9px 14px" }}
              >
                Gérer les factures & scolarité →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─── SECTION 2 COLONNES : FLUX RÉCENT & EFFECTIFS PAR CLASSE ─────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 22 }}>
        {/* Flux d'activité récent cliquable */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                Flux d'Activité Récent
              </h3>
            </div>
            <span style={{ fontSize: 10.5, color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: 5 }}>
              En direct
            </span>
          </div>

          {s.recentActivities && s.recentActivities.length > 0 ? (
            <div style={{ display: "grid", gap: 6 }}>
              {s.recentActivities.slice(0, 5).map((act) => {
                const targetPath = act.type === "grade" ? "/grades" : act.type === "attendance" ? "/attendance" : "/invoices";
                return (
                  <Link
                    key={act.id}
                    to={targetPath}
                    title="Cliquer pour accéder au module correspondant"
                    className="activity-item"
                    style={{
                      padding: "8px 10px",
                      minWidth: 0,
                      textDecoration: "none",
                      color: "inherit",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 10,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f1f5f9";
                      e.currentTarget.style.transform = "translateX(3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <div
                      className="activity-icon-badge"
                      style={{
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        background: act.type === "grade" ? "#eef2ff" : act.type === "attendance" ? "#ecfdf5" : "#fffbeb",
                        color: act.badgeColor,
                      }}
                    >
                      {act.type === "grade" ? "📝" : act.type === "attendance" ? "⏱️" : "💰"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, margin: "0 10px" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {act.subtitle}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: act.badgeColor,
                        background: `${act.badgeColor}15`,
                        padding: "2px 6px",
                        borderRadius: 5,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {act.badge}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: 12.5, margin: "10px 0" }}>Aucune activité récente enregistrée.</p>
          )}
        </div>

        {/* Répartition des classes cliquable */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>🏫</span>
              <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                Effectifs par Classe & Niveau
              </h3>
            </div>
            <Link to="/classes" style={{ fontSize: 11.5, color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
              Gérer →
            </Link>
          </div>

          {s.classesDistribution && s.classesDistribution.length > 0 ? (
            <div style={{ display: "grid", gap: 8 }}>
              {s.classesDistribution.map((cls) => {
                const percent = Math.min(100, Math.round((cls.studentCount / 30) * 100));
                return (
                  <Link
                    key={cls.id}
                    to="/classes"
                    title={`Voir les détails et élèves de ${cls.name}`}
                    style={{
                      display: "block",
                      textDecoration: "none",
                      color: "inherit",
                      padding: "10px 12px",
                      background: "#f8fafc",
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      transition: "all 0.15s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 3px 10px rgba(99,102,241,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <strong style={{ fontSize: 13, color: "#0f172a" }}>{cls.name}</strong>
                        <span style={{ fontSize: 10.5, background: "#e2e8f0", padding: "1px 5px", borderRadius: 4, color: "#475569" }}>
                          {cls.level}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5" }}>
                        {cls.studentCount} élève{cls.studentCount > 1 ? "s" : ""} →
                      </span>
                    </div>
                    <div style={{ height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: 12.5, margin: "10px 0" }}>Aucune classe configurée.</p>
          )}
        </div>
      </div>

      {/* ─── ACCÈS RAPIDE REPENSÉ & SANS DÉBORDEMENT ─────────────────────────── */}
      <div className="card" style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
            Accès Rapide aux Modules
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {shortcuts.map((sc) => (
            <Link
              key={sc.path}
              to={sc.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 13px",
                background: "#f8fafc",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  flexShrink: 0,
                }}
              >
                {sc.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>{sc.label}</div>
                <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {sc.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ENSEIGNANT
// ─────────────────────────────────────────────────────────────────────────────
function TeacherDashboard({ user }) {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const today = new Date().getDay();
  const DAYS = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  useEffect(() => {
    myTimetableTeacher()
      .then(setTimetable)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const todayCours = timetable.filter((t) => t.dayOfWeek === today);
  const shortcuts = [
    { label: "Saisir les Notes", path: "/grades", icon: "📝", desc: "Évaluations et moyennes" },
    { label: "Faire l'Appel", path: "/attendance", icon: "✅", desc: "Présences et absences" },
    { label: "Donner un Devoir", path: "/homeworks", icon: "📋", desc: "Travaux et échéances" },
    { label: "Messagerie", path: "/messages", icon: "✉️", desc: "Communication directe" },
  ];

  return (
    <div className="page-content" style={{ boxSizing: "border-box", width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #065f46 0%, #047857 60%, #10b981 100%)",
          borderRadius: 16,
          padding: "22px 26px",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          boxShadow: "0 8px 20px -4px rgba(5,150,105,0.25)",
        }}
      >
        <div>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 8px", borderRadius: 14, fontSize: 10.5, fontWeight: 700 }}>
            Espace Pédagogique
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 2px" }}>
            {greeting}, {user.firstName} 👩‍🏫
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 12.5 }}>
            Consultez votre emploi du temps et gérez le suivi de vos élèves.
          </p>
        </div>
        <div style={{ fontSize: 38, opacity: 0.8 }}>📚</div>
      </div>

      {/* Cours aujourd'hui */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>🗓</span>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>
              Mes cours aujourd'hui — {DAYS[today] || "Week-end"}
            </h2>
          </div>
          <Link to="/timetable" style={{ fontSize: 11.5, color: "#059669", fontWeight: 600, textDecoration: "none" }}>
            Emploi du temps complet →
          </Link>
        </div>

        {loading ? (
          <div className="loading-text"><span className="loading-spinner" style={{ borderColor: "#bbf7d0", borderTopColor: "#059669" }} />Chargement…</div>
        ) : todayCours.length ? (
          <div style={{ display: "grid", gap: 8 }}>
            {todayCours.map((c) => (
              <Link
                key={c.id}
                to="/timetable"
                title="Cliquer pour consulter l'emploi du temps complet"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  background: "#f0fdf4",
                  borderRadius: 10,
                  border: "1px solid #bbf7d0",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#059669";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 3px 10px rgba(5,150,105,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#bbf7d0";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ background: "#ede9fe", border: "1px solid #ddd6fe", padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontFamily: "monospace", color: "#5b21b6", fontWeight: 700 }}>
                  {c.startTime} – {c.endTime}
                </span>
                <span style={{ fontWeight: 700, color: "#111827" }}>{c.subject?.name}</span>
                <span style={{ color: "#6b7280", fontSize: 12.5 }}>· Classe : <strong>{c.classroom?.name}</strong></span>
                {c.room && <span style={{ marginLeft: "auto", fontSize: 11.5, color: "#059669", fontWeight: 600 }}>Salle {c.room} →</span>}
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 10, textAlign: "center", color: "#64748b", fontSize: 13 }}>
            🎉 Aucun cours programmé aujourd'hui.
          </div>
        )}
      </div>

      {/* Accès rapide */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <span>⚡</span>
          <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#111827" }}>Actions rapides</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {shortcuts.map((s) => (
            <Link
              key={s.path}
              to={s.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 13px",
                background: "#f8fafc",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: "#111827" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ÉLÈVE
// ─────────────────────────────────────────────────────────────────────────────
function StudentDashboard({ user }) {
  const [grades, setGrades] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  useEffect(() => {
    Promise.allSettled([myGrades(), myAttendances(), myHomeworks()])
      .then(([g, a, h]) => {
        if (g.status === "fulfilled") setGrades(g.value.slice(0, 5));
        if (a.status === "fulfilled") setAttendances(a.value.slice(0, 5));
        if (h.status === "fulfilled") setHomeworks(h.value.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const absences = attendances.filter((a) => a.status === "ABSENT").length;
  const average = grades.length
    ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1)
    : "—";

  return (
    <div className="page-content" style={{ boxSizing: "border-box", width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      {/* Welcome banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #4338ca 0%, #6366f1 60%, #8b5cf6 100%)",
          borderRadius: 16,
          padding: "22px 26px",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          boxShadow: "0 8px 20px -4px rgba(99,102,241,0.25)",
        }}
      >
        <div>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 8px", borderRadius: 14, fontSize: 10.5, fontWeight: 700 }}>
            Espace Élève
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 2px" }}>
            {greeting}, {user.firstName} 👋
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 12.5 }}>
            Consultez vos dernières notes, absences et devoirs à rendre.
          </p>
        </div>
        <div style={{ fontSize: 38, opacity: 0.8 }}>🎒</div>
      </div>

      {/* Mini stats cliquables */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Moyenne générale", value: `${average}/20`, icon: "📝", bg: "#ede9fe", color: "#5b21b6", path: "/my-grades" },
          { label: "Absences signalées", value: absences, icon: "⏱️", bg: "#fef3c7", color: "#92400e", path: "/my-attendance" },
          { label: "Devoirs en cours", value: homeworks.length, icon: "📋", bg: "#dbeafe", color: "#1e40af", path: "/my-homeworks" },
        ].map((stat) => (
          <Link
            key={stat.label}
            to={stat.path}
            title={`Consulter : ${stat.label}`}
            style={{
              display: "block",
              background: stat.bg,
              borderRadius: 12,
              padding: "16px 18px",
              border: `1px solid ${stat.color}20`,
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 4px 12px ${stat.color}25`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 11.5, color: stat.color, marginTop: 4, fontWeight: 600 }}>{stat.label} →</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {/* Dernières notes cliquables */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>📝</span>
              <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#111827" }}>Dernières notes</h2>
            </div>
            <Link to="/my-grades" style={{ fontSize: 11.5, color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
              Voir tout →
            </Link>
          </div>
          {loading ? (
            <div className="loading-text" style={{ padding: 14 }}>Chargement…</div>
          ) : grades.length ? (
            <div style={{ display: "grid", gap: 7 }}>
              {grades.map((g) => (
                <Link
                  key={g.id}
                  to="/my-grades"
                  title="Voir toutes mes notes"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    background: "#f8f9fc",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#6366f1";
                    e.currentTarget.style.transform = "translateX(2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>{g.subject?.name}</span>
                  <span style={{ fontWeight: 800, fontSize: 14, color: g.score >= 10 ? "#059669" : "#dc2626" }}>
                    {g.score} / 20 →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: 12.5 }}>Aucune note disponible.</p>
          )}
        </div>

        {/* Devoirs à rendre cliquables */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>📋</span>
              <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#111827" }}>Devoirs à rendre</h2>
            </div>
            <Link to="/my-homeworks" style={{ fontSize: 11.5, color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
              Voir tout →
            </Link>
          </div>
          {loading ? (
            <div className="loading-text" style={{ padding: 14 }}>Chargement…</div>
          ) : homeworks.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {homeworks.map((hw) => (
                <Link
                  key={hw.id}
                  to="/my-homeworks"
                  title="Consulter et rendre le devoir"
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    background: "#fffbeb",
                    borderRadius: 8,
                    border: "1px solid #fde68a",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#f59e0b";
                    e.currentTarget.style.transform = "translateX(2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#fde68a";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>{hw.title}</div>
                  <div style={{ fontSize: 11.5, color: "#92400e", marginTop: 3 }}>
                    {hw.subject?.name} · Échéance : {new Date(hw.dueDate).toLocaleDateString("fr-FR")} →
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: 12.5 }}>🎉 Aucun devoir en attente.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("smartschool_user") || "{}");
  const role = user.role || "ADMIN";

  if (role === "STUDENT") return <StudentDashboard user={user} />;
  if (role === "TEACHER") return <TeacherDashboard user={user} />;
  return <AdminDashboard user={user} />;
}
