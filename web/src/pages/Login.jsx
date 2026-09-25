import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

export default function Login() {
  const [email, setEmail] = useState("admin@smartschool.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { role } = await login(email, password);
      nav("/dashboard");
    } catch (e) {
      setError(e.response?.data?.message || "Connexion impossible. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Hero side */}
      <div className="login-hero">
        <div className="login-hero-content">
          <div className="login-hero-logo">
            <div className="login-hero-logo-icon">S</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
                SmartSchool
              </div>
              <div style={{ fontSize: 12, color: "var(--clr-text-muted)", marginTop: 2 }}>
                Plateforme éducative
              </div>
            </div>
          </div>

          <div className="login-hero-title">
            Gérez votre<br />établissement<br />avec style.
          </div>
          <div className="login-hero-tagline">Gérer • Enseigner • Réussir</div>
          <p className="login-hero-desc">
            Une plateforme moderne pour piloter élèves, enseignants, notes, absences, devoirs et finances en toute simplicité.
          </p>

          <div className="login-hero-features">
            {[
              "Gestion complète des élèves & enseignants",
              "Emploi du temps hebdomadaire",
              "Suivi des notes et absences",
              "Tableau de bord en temps réel",
            ].map((f) => (
              <div key={f} className="login-hero-feature">
                <div className="login-hero-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="login-form-side">
        <div className="login-form-box">
          <div className="login-form-heading">Bon retour 👋</div>
          <div className="login-form-subheading">
            Connectez-vous à votre espace SmartSchool.
          </div>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Adresse email</label>
              <input
                id="login-email"
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" htmlFor="login-password">Mot de passe</label>
              <input
                id="login-password"
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  Connexion en cours…
                </>
              ) : (
                "Se connecter →"
              )}
            </button>
          </form>

          <div className="alert-info" style={{ marginTop: 20 }}>
            <strong>Démo :</strong> admin@smartschool.local / Admin@123
          </div>
        </div>
      </div>
    </div>
  );
}
