// src/pages/admin/AdminRoot.jsx
// Password gate + shared layout for all /admin/* routes.
// Password is stored in sessionStorage so api calls can send it
// to the server for re-validation on every request.
import { useState }          from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import "./Admin.css";

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD; // still used for quick client check

export default function AdminRoot() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("admin_authed") === "true"
  );

  function login(password) {
    setAuthed(true);
    sessionStorage.setItem("admin_authed",  "true");
    // ✅ Store password so api/admin.js can re-validate every request
    sessionStorage.setItem("admin_password", password);
  }

  function logout() {
    setAuthed(false);
    sessionStorage.removeItem("admin_authed");
    sessionStorage.removeItem("admin_password");
  }

  if (!authed) return <AdminLogin onLogin={login} />;
  return <AdminLayout onLogout={logout} />;
}

// ── Password gate ──────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pass,  setPass]  = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function attempt(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Hit the server to check — the client-side VITE_ADMIN_PASSWORD
    // check is removed so the real password is never in the bundle.
    try {
      const res = await fetch("/api/admin", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass, action: "get_teams", payload: {} }),
      });

      if (res.ok) {
        onLogin(pass);
      } else {
        setError("Incorrect password.");
        setPass("");
      }
    } catch {
      setError("Could not connect to server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <div className="adm-login-logo">⬡ DataXplore</div>
        <h1>Admin Dashboard</h1>
        <p>Statistics Society — University of Sri Jayewardenepura</p>
        <form onSubmit={attempt}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            autoFocus
            disabled={loading}
          />
          {error && <div className="adm-login-error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Checking…" : "Login →"}
          </button>
        </form>
        <Link to="/" className="adm-back">← Back to website</Link>
      </div>
    </div>
  );
}

// ── Sidebar layout ─────────────────────────────────────────
function AdminLayout({ onLogout }) {
  const loc = useLocation();

  function isActive(path) {
    return loc.pathname === path || loc.pathname.startsWith(path + "/");
  }

  return (
    <div className="adm-wrap">
      <aside className="adm-sidebar">
        <div className="adm-brand">⬡ DataXplore<small>Admin</small></div>
        <nav className="adm-nav">
          <Link to="/admin" className={`adm-link ${loc.pathname === "/admin" ? "adm-link--active" : ""}`}>
            📋 Teams
          </Link>
          <Link to="/admin/submissions" className={`adm-link ${isActive("/admin/submissions") ? "adm-link--active" : ""}`}>
            📁 Submissions
          </Link>
        </nav>
        <div className="adm-sidebar-footer">
          <Link to="/" className="adm-site-link">← Back to site</Link>
          <button className="adm-logout" onClick={onLogout}>Logout</button>
        </div>
      </aside>
      <main className="adm-main">
        <Outlet />
      </main>
    </div>
  );
}