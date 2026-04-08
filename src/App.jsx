// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home   from "./pages/Home";
import Submit from "./pages/Submit";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main public website */}
        <Route path="/"       element={<Home />} />

        {/* Submission portal — /submit */}
        <Route path="/submit" element={<Submit />} />

        {/* Catch-all → back to home */}
        <Route path="*"       element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}