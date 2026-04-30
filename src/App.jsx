// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ── Public pages ───────────────────────────────────────────
import Home from "./pages/Home";
import Submit from "./pages/Submit";

// ── Admin pages ────────────────────────────────────────────
import AdminRoot from "./pages/admin/AdminRoot";
import Dashboard from "./pages/admin/Dashboard";
import TeamDetail from "./pages/admin/TeamDetail";
import Submissions from "./pages/admin/Submissions";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<Submit />} />

        {/* Admin routes — all nested under /admin
            AdminRoot handles password gate + layout  */}
        <Route path="/admin" element={<AdminRoot />}>
          <Route index element={<Dashboard />} />
          <Route path="teams/:id" element={<TeamDetail />} />
          <Route path="submissions" element={<Submissions />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
