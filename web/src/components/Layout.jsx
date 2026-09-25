import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// ─── Navigation par rôle ──────────────────────────────────────────────────────

const ADMIN_SECTIONS = [
  {
    label: "Vue générale",
    links: [
      { label: "Dashboard", path: "/dashboard", icon: "⊞" },
    ],
  },
  {
    label: "Gestion scolaire",
    links: [
      { label: "Années scolaires", path: "/school-years", icon: "📅" },
      { label: "Classes", path: "/classes", icon: "🏫" },
      { label: "Élèves", path: "/students", icon: "👨‍🎓" },
      { label: "Enseignants", path: "/teachers", icon: "👩‍🏫" },
      { label: "Matières", path: "/subjects", icon: "📚" },
    ],
  },
  {
    label: "Activités",
    links: [
      { label: "Emploi du temps", path: "/timetable", icon: "🗓" },
      { label: "Notes", path: "/grades", icon: "📝" },
      { label: "Absences", path: "/attendance", icon: "✅" },
      { label: "Devoirs", path: "/homeworks", icon: "📋" },
    ],
  },
  {
    label: "Administration",
    links: [
      { label: "Finances", path: "/invoices", icon: "💰" },
      { label: "Messagerie", path: "/messages", icon: "✉️" },
    ],
  },
];

const TEACHER_SECTIONS = [
  {
    label: "Mon espace",
    links: [
      { label: "Tableau de bord", path: "/dashboard", icon: "⊞" },
      { label: "Mon emploi du temps", path: "/timetable", icon: "🗓" },
    ],
  },
  {
    label: "Gestion de cours",
    links: [
      { label: "Notes", path: "/grades", icon: "📝" },
      { label: "Absences", path: "/attendance", icon: "✅" },
      { label: "Devoirs", path: "/homeworks", icon: "📋" },
    ],
  },
  {
    label: "Communication",
    links: [
      { label: "Messagerie", path: "/messages", icon: "✉️" },
    ],
  },
];

const STUDENT_SECTIONS = [
  {
    label: "Mon espace",
    links: [
      { label: "Tableau de bord", path: "/dashboard", icon: "⊞" },
      { label: "Emploi du temps", path: "/my-timetable", icon: "🗓" },
    ],
  },
  {
    label: "Mes résultats",
    links: [
      { label: "Mes notes", path: "/my-grades", icon: "📝" },
      { label: "Mes absences", path: "/my-attendance", icon: "✅" },
      { label: "Mes devoirs", path: "/my-homeworks", icon: "📋" },
    ],
  },
  {
    label: "Communication",
    links: [
      { label: "Messagerie", path: "/messages", icon: "✉️" },
    ],
  },
];

// ─── Badge de rôle ────────────────────────────────────────────────────────────
const ROLE_META = {
  ADMIN: { label: "Administrateur", color: "#6366f1", bg: "#ede9fe" },
  SUPER_ADMIN: { label: "Super Admin", color: "#4f46e5", bg: "#e0e7ff" },
  TEACHER: { label: "Enseignant", color: "#059669", bg: "#d1fae5" },
  STUDENT: { label: "Élève", color: "#d97706", bg: "#fef3c7" },
  ACCOUNTANT: { label: "Comptable", color: "#0369a1", bg: "#e0f2fe" },
};

function getSections(role) {
  if (role === "STUDENT") return STUDENT_SECTIONS;
  if (role === "TEACHER") return TEACHER_SECTIONS;
  return ADMIN_SECTIONS; // ADMIN, SUPER_ADMIN, etc.
}

// ─── Composant ────────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const nav = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fermer la sidebar sur mobile lors du changement de page
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);
  const user = JSON.parse(localStorage.getItem("smartschool_user") || "{}");
  const role = user.role || "ADMIN";
  const roleMeta = ROLE_META[role] || ROLE_META.ADMIN;
  const sections = getSections(role);

  function logout() {
    localStorage.clear();
    nav("/login");
  }

  const initials = [user.firstName?.[0], user.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "A";

  // Titre de la page courante
  const allLinks = sections.flatMap((s) => s.links);
  const currentLink = allLinks.find((l) => location.pathname === l.path);
  const pageTitle = currentLink ? currentLink.label : "Administration";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Mobile Backdrop ── */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <button 
          className="sidebar-collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title="Réduire/Agrandir"
        >
          {isCollapsed ? "»" : "«"}
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <div className="sidebar-logo-icon">S</div>
            <div>
              <div className="sidebar-logo-title">SmartSchool</div>
              <div className="sidebar-logo-subtitle">Gérer • Enseigner • Réussir</div>
            </div>
          </div>
          {/* Badge rôle */}
          <div className="sidebar-role-badge"
            style={{
              marginTop: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: roleMeta.bg,
              color: roleMeta.color,
              borderRadius: 99,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {role === "ADMIN" || role === "SUPER_ADMIN" ? "🛡️" : role === "TEACHER" ? "👩‍🏫" : "👨‍🎓"}
            <span>{roleMeta.label}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
                  title={isCollapsed ? link.label : ""}
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  <span className="sidebar-link-text">{link.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              marginBottom: 8,
              background: "#f8f9fc",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>{user.email}</div>
            </div>
          </div>
          <button onClick={logout} className="sidebar-logout-btn" title={isCollapsed ? "Déconnexion" : ""}>
            <span className="sidebar-link-icon">🚪</span>
            <span className="sidebar-link-text">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className={`main-wrapper ${isCollapsed ? "collapsed" : ""}`}>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              ☰
            </button>
            <div className="topbar-title">{pageTitle}</div>
          </div>
          <div className="topbar-user">
            <div style={{ textAlign: "right" }}>
              <div className="topbar-user-name">
                {user.firstName} {user.lastName}
              </div>
              <div className="topbar-user-role"
                style={{ color: roleMeta.color, fontWeight: 600 }}
              >
                {roleMeta.label}
              </div>
            </div>
            <div className="topbar-avatar">{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", minWidth: 0, width: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

