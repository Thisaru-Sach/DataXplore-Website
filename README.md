# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
"# DataXplore-Website" 


# New File Structure — What Was Added & What To Do

## New files created

```
src/
├── config/
│   └── dates.js               ← All competition dates + phase logic
│
├── lib/
│   └── supabase.js            ← Placeholder (uncomment when DB ready)
│
├── pages/
│   ├── Home.jsx               ← Assembles all existing components
│   ├── Submit.jsx             ← /submit route with date gate
│   └── Submit.css
│
├── components/
│   └── submission/
│       ├── SubmissionBanner.jsx   ← Status bar shown on homepage
│       ├── SubmissionBanner.css
│       ├── AuthGate.jsx           ← Team login before upload
│       ├── AuthGate.css
│       ├── SubmissionPortal.jsx   ← Drag & drop file upload
│       └── SubmissionPortal.css
│
└── App.jsx                    ← Updated with React Router

vercel.json                    ← Fixes /submit 404 on Vercel
```

---

## Steps to integrate into your existing project

### 1. Install react-router-dom
```bash
npm install react-router-dom
```

### 2. Replace your App.jsx
Copy the new `App.jsx` — it adds BrowserRouter + Routes.

### 3. Update Home.jsx
The new `Home.jsx` lists all your existing components.
Make sure the import paths match your actual file names.
For example if your hero component is `HeroSection.jsx` change:
  `import Hero from "../components/Hero"`
  to
  `import Hero from "../components/HeroSection"`

### 4. Add SubmissionBanner to your home page
In `Home.jsx` it's placed between `<Hero />` and `<About />`.
You can move it anywhere on the page.

### 5. Testing mode
In `src/config/dates.js` the flag `BYPASS_DATE_CHECK = true` means:
- The banner shows "Testing Mode"
- /submit is always accessible
- AuthGate shows a "Skip Login" button with mock team data

Set it to `false` before going live.

---

## When you're ready to add Supabase

1. `npm install @supabase/supabase-js`
2. Add env vars to `.env` and Vercel dashboard
3. Uncomment `src/lib/supabase.js`
4. Replace the TODO blocks in:
   - `AuthGate.jsx`  (team lookup)
   - `SubmissionPortal.jsx`  (file upload + DB insert)