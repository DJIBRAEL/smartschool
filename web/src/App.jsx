import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResourcePage from "./pages/ResourcePage";
import TimetablePage from "./pages/TimetablePage";

// Pages Élèves
import MyGradesPage from "./pages/MyGradesPage";
import MyAttendancePage from "./pages/MyAttendancePage";
import MyHomeworksPage from "./pages/MyHomeworksPage";
import MyTimetablePage from "./pages/MyTimetablePage";

// ─── Composant de protection de route par rôle ────────────────────────────────

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("smartschool_token");
  const user = JSON.parse(localStorage.getItem("smartschool_user") || "{}");

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Layout>
        <div className="page-content" style={{ textAlign: "center", paddingTop: 80 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⛔</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Accès refusé</h1>
          <p style={{ color: "#6b7280" }}>Vous n'avez pas la permission d'accéder à cette page.</p>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
}

// ─── Groupes de rôles ──────────────────────────────────────────────────────────

const ADMIN_ONLY = ["ADMIN", "SUPER_ADMIN", "ACCOUNTANT"];
const STAFF_ONLY = ["ADMIN", "SUPER_ADMIN", "TEACHER"];
const STUDENT_ONLY = ["STUDENT"];
const ALL_ROLES = ["ADMIN", "SUPER_ADMIN", "TEACHER", "STUDENT", "ACCOUNTANT"];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard (Vue gérée dynamiquement en interne) */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={ALL_ROLES}><Dashboard /></ProtectedRoute>} />

        {/* Administration & Données globales (Admin seulement) */}
        <Route path="/students" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ResourcePage type="students" /></ProtectedRoute>} />
        <Route path="/teachers" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ResourcePage type="teachers" /></ProtectedRoute>} />
        <Route path="/school-years" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ResourcePage type="schoolYears" /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ResourcePage type="classes" /></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ResourcePage type="subjects" /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ResourcePage type="invoices" /></ProtectedRoute>} />

        {/* Gestion Pédagogique (Admin + Teachers) */}
        <Route path="/grades" element={<ProtectedRoute allowedRoles={STAFF_ONLY}><ResourcePage type="grades" /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute allowedRoles={STAFF_ONLY}><ResourcePage type="attendance" /></ProtectedRoute>} />
        <Route path="/homeworks" element={<ProtectedRoute allowedRoles={STAFF_ONLY}><ResourcePage type="homeworks" /></ProtectedRoute>} />
        <Route path="/timetable" element={<ProtectedRoute allowedRoles={STAFF_ONLY}><TimetablePage /></ProtectedRoute>} />

        {/* Messagerie globale */}
        <Route path="/messages" element={<ProtectedRoute allowedRoles={ALL_ROLES}><ResourcePage type="messages" /></ProtectedRoute>} />

        {/* Espace personnel Élève */}
        <Route path="/my-grades" element={<ProtectedRoute allowedRoles={STUDENT_ONLY}><MyGradesPage /></ProtectedRoute>} />
        <Route path="/my-attendance" element={<ProtectedRoute allowedRoles={STUDENT_ONLY}><MyAttendancePage /></ProtectedRoute>} />
        <Route path="/my-homeworks" element={<ProtectedRoute allowedRoles={STUDENT_ONLY}><MyHomeworksPage /></ProtectedRoute>} />
        <Route path="/my-timetable" element={<ProtectedRoute allowedRoles={STUDENT_ONLY}><MyTimetablePage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
