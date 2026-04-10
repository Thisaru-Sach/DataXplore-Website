// src/pages/admin/AdminRoot.jsx
// Password gate + shared layout for all /admin/* routes.
// Uses React Router <Outlet /> so child routes render inside
// the sidebar layout automatically.

import { useState }                    from "react";
import { Outlet, Link, useLocation,
         useNavigate }                 from "react-router-dom";
import "./Admin.css";

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD;

export default function AdminRoot() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("admin_authed") === "true"
  );

  function login(ok) {
    setAuthed(ok);
    if (ok) sessionStorage.setItem("admin_authed", "true");
  }

  function logout() {
    setAuthed(false);
    sessionStorage.removeItem("admin_authed");
  }

  if (!authed) return <AdminLogin onLogin={login} />;
  return <AdminLayout onLogout={logout} />;
}

// ── Password gate ──────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pass,  setPass]  = useState("");
  const [error, setError] = useState("");

  function attempt(e) {
    e.preventDefault();
    if (pass === ADMIN_PASS) {
      onLogin(true);
    } else {
      setError("Incorrect password.");
      setPass("");
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
          />
          {error && <div className="adm-login-error">{error}</div>}
          <button type="submit">Login →</button>
        </form>
        <Link to="/" className="adm-back">← Back to website</Link>
      </div>
    </div>
  );
}

// ── Sidebar layout — wraps all admin child pages ───────────
function AdminLayout({ onLogout }) {
  const loc = useLocation();

  function isActive(path) {
    return loc.pathname === path || loc.pathname.startsWith(path + "/");
  }

  return (
    <div className="adm-wrap">
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-brand">
          ⬡ DataXplore
          <small>Admin</small>
        </div>
        <nav className="adm-nav">
          <Link
            to="/admin"
            className={`adm-link ${loc.pathname === "/admin" ? "adm-link--active" : ""}`}
          >
            📋 Teams
          </Link>
          <Link
            to="/admin/submissions"
            className={`adm-link ${isActive("/admin/submissions") ? "adm-link--active" : ""}`}
          >
            📁 Submissions
          </Link>
        </nav>
        <div className="adm-sidebar-footer">
          <Link to="/" className="adm-site-link">← Back to site</Link>
          <button className="adm-logout" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      {/* Child page renders here */}
      <main className="adm-main">
        <Outlet />
      </main>
    </div>
  );
}