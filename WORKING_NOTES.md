# Working Notes — Gridiron Survey

> **INTERNAL DOCUMENT — NOT PUBLIC-FACING.**
> This file is for the developer and any AI assistants working on this project.
> Update this file at the end of every working session before closing.

---

## How To Use This File (For AI Assistants)

1. Read this entire file before touching any code.
2. Read `README.md` for the public-facing project description and setup steps.
3. Do not change the folder structure or monorepo conventions without discussing it first.
4. Follow all naming conventions, code style rules, and framework patterns in Section 8 exactly.
5. Do not suggest anything listed in Section 10 ("What Was Tried and Rejected") — those decisions were made deliberately.
6. Ask before making any large structural changes (new packages, new routing strategy, replacing a library).
7. This project was AI-assisted. Refactor conservatively — prefer small, targeted changes over broad rewrites.

---

## Current State

**Last Updated:** 2026-04-01

The app is feature-complete and working end-to-end in the Replit environment. The Supabase table exists and has live data. The app is ready for Azure deployment pending the user's Azure setup steps.

### What Is Working

- [x] Survey form page (`/`) with all 8 questions and form validation
- [x] One-submission-per-person gate via `localStorage`
- [x] POST `/api/survey` — validates with Zod, inserts into Supabase
- [x] GET `/api/survey/results` — aggregates all responses, returns typed JSON
- [x] Results page (`/results`) with Recharts charts for every question dimension
- [x] Supabase `survey_responses` table with RLS (anonymous read + insert)
- [x] OpenAPI spec → Orval codegen → generated React Query hooks + Zod schemas
- [x] Full TypeScript typecheck passes across all workspace packages
- [x] `staticwebapp.config.json` for Azure SWA SPA routing
- [x] `vite.config.ts` works without `PORT`/`BASE_PATH` env vars (Azure build safe)

### What Is Partially Built

- [ ] Supabase startup verification logs SQL instructions but does not auto-create the table (requires service role key not yet provided)
- [ ] `lib/db` (Drizzle ORM) is scaffolded but unused — Supabase JS client is used directly instead

### What Is Not Started

- [ ] Azure deployment (SWA + App Service + linked backend — steps are documented but not executed)
- [ ] Rate limiting on `POST /api/survey`
- [ ] Admin view or data export for raw responses
- [ ] Regional filtering on the results scoreboard

---

## Current Task

The project is deployed on Replit and functionally complete. The next task is migrating to Azure: create an Azure Static Web App for the frontend, deploy the Express API to Azure App Service, and link the two using SWA's linked backend feature so `/api/*` calls are proxied automatically.

**Single next step:** Create the Azure Static Web App resource and configure the build pipeline (app location: `artifacts/football-survey`, output location: `artifacts/football-survey/dist/public`).

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 18 | Standard frontend framework; strong ecosystem |
| Vite | 6.x | Fast HMR and build; native TypeScript support |
| TypeScript | ~5.9 | Full-stack type safety; required by monorepo setup |
| Wouter | 3.x | Lightweight SPA routing; no need for React Router complexity |
| shadcn/ui | latest | Accessible, composable components; easy to style with Tailwind |
| Tailwind CSS | v4 | Utility-first styling; integrates via `@tailwindcss/vite` plugin |
| Recharts | 2.x | Composable charts built on D3; works naturally with React state |
| React Hook Form | 7.x | Performant form state; minimal re-renders |
| Zod | 3.x | Runtime validation on both frontend and backend; generated from OpenAPI |
| TanStack React Query | 5.x | Server state, caching, and loading/error states for API calls |
| Express | 5.x | Familiar Node.js API server; minimal overhead |
| Supabase JS | ^2.101 | Simple PostgreSQL client with auth/RLS support; no SQL driver needed |
| Orval | 8.x | Generates React Query hooks + Zod schemas from OpenAPI spec automatically |
| pnpm workspaces | 9.x | Monorepo package management; shared packages via `workspace:*` protocol |

---

## Project Structure Notes

```
gridiron-survey/
├── artifacts/
│   ├── api-server/                  # Express REST API — runs on its own port
│   │   └── src/
│   │       ├── app.ts               # Express app: CORS, JSON parsing, mounts /api routes
│   │       ├── index.ts             # Entry point: reads PORT, verifies survey_responses table
│   │       ├── lib/
│   │       │   ├── logger.ts        # Pino structured logger (JSON output)
│   │       │   └── supabase.ts      # Supabase client singleton (reads env vars)
│   │       ├── middlewares/         # Express middleware
│   │       └── routes/
│   │           ├── health.ts        # GET /api/healthz
│   │           ├── index.ts         # Aggregates all route modules
│   │           └── survey.ts        # POST /api/survey, GET /api/survey/results
│   └── football-survey/             # React + Vite SPA
│       ├── public/
│       │   ├── staticwebapp.config.json   # Azure SWA SPA routing fallback
│       │   ├── favicon.svg
│       │   └── opengraph.jpg
│       ├── vite.config.ts           # PORT and BASE_PATH are optional (default: 3000, /)
│       └── src/
│           ├── App.tsx              # Root component: providers, router, layout
│           ├── index.css            # Global CSS variables and Tailwind base
│           ├── components/
│           │   ├── Header.tsx       # Branding + nav links (Take Survey / Live Results)
│           │   └── ui/              # 16 shadcn/ui components (40 unused ones deleted)
│           ├── hooks/
│           │   └── use-toast.ts     # Toast notification hook
│           ├── lib/utils.ts         # cn() class merging utility
│           └── pages/
│               ├── SurveyForm.tsx   # Survey form, localStorage guard, submission
│               ├── Results.tsx      # Recharts dashboard, public scoreboard
│               └── not-found.tsx    # 404 fallback route
├── lib/
│   ├── api-client-react/            # DO NOT EDIT — generated by Orval
│   │   └── src/
│   │       ├── generated/           # Auto-generated hooks and schemas
│   │       └── custom-fetch.ts      # Fetch client with setBaseUrl(), setAuthTokenGetter()
│   ├── api-spec/
│   │   └── openapi.yaml             # SOURCE OF TRUTH for all API types — edit here first
│   ├── api-zod/                     # DO NOT EDIT — generated by Orval
│   └── db/                          # Drizzle ORM schema — scaffolded, not yet used
├── scripts/                         # Internal utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json               # Shared TS config: composite, bundler resolution, es2022
├── tsconfig.json                    # Root project references (all packages listed here)
├── README.md                        # Public documentation
└── WORKING_NOTES.md                 # This file
```

### Non-obvious decisions

- **`lib/api-client-react/` and `lib/api-zod/` are fully generated** — never edit files inside `src/generated/`. Regenerate with `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`.
- **Vite dev server proxies `/api/*` to the Express server** in development. In production on Azure, the SWA Linked Backend handles this proxy — no code changes needed.
- **`dist/public`** is the Vite build output (not the standard `dist/`). Azure SWA output location must be set to `artifacts/football-survey/dist/public`.
- **TypeScript uses composite project references** — always run `pnpm run typecheck` from the repo root, never inside individual packages.

### Files and folders that must not be changed without discussion

- `lib/api-spec/openapi.yaml` — changing this requires re-running codegen and verifying backend + frontend types
- `tsconfig.base.json` and root `tsconfig.json` — project references must stay in sync
- `artifacts/api-server/src/lib/supabase.ts` — single client instance; do not create additional instances elsewhere
- `artifacts/football-survey/public/staticwebapp.config.json` — required for Azure SWA SPA routing

---

## Data / Database

**Provider:** Supabase (PostgreSQL) — project ID `whctnbfbwlphystbcyyh`
**Connection method:** `@supabase/supabase-js` REST client (not direct PostgreSQL connection)
**Table creation:** Manual SQL (anon key lacks DDL privileges)

### `public.survey_responses`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `UUID` | Yes | Primary key, auto-generated via `gen_random_uuid()` |
| `state` | `TEXT` | Yes | Full US state name (e.g. "Iowa") |
| `gender` | `TEXT` | Yes | `"Male"` or `"Female"` |
| `nfl_team` | `TEXT` | Yes | Full team name (e.g. "Kansas City Chiefs") |
| `college_team` | `TEXT` | Yes | One of the preset options or `"Other"` |
| `college_team_other` | `TEXT` | No | Populated only when `college_team = "Other"` |
| `football_preference` | `TEXT` | Yes | `"College"`, `"NFL"`, or `"Both equally"` |
| `watch_frequency` | `TEXT` | Yes | `"Every game"`, `"Most games"`, `"Occasionally"`, `"Rarely"` |
| `attends_in_person` | `BOOLEAN` | Yes | Whether respondent attends live games |
| `favorite_position` | `TEXT` | Yes | One of: `QB`, `RB`, `WR`, `TE`, `OL`, `DL`, `LB`, `DB`, `K/P` |
| `created_at` | `TIMESTAMPTZ` | No | Auto-set to `NOW()` on insert |

**RLS Policies:**
- Anonymous INSERT allowed (no auth required to submit)
- Anonymous SELECT allowed (results are fully public)

---

## Conventions

### Naming conventions

- **Files:** PascalCase for React components (`SurveyForm.tsx`, `Results.tsx`), camelCase for utilities and hooks (`use-toast.ts`, `utils.ts`)
- **Variables/functions:** camelCase throughout
- **Database columns:** `snake_case` in Supabase; mapped to `camelCase` in TypeScript at the API layer
- **API types:** Defined in `openapi.yaml` → generated as PascalCase interfaces (e.g. `SurveySubmission`, `SurveyResults`)

### Code style

- Prettier for formatting (config in root `package.json`)
- No `any` types — use generated types (`SurveySubmission`, `TooltipProps<number, string>`) or explicit local interfaces
- Explicit return types on route handlers; avoid implicit `any` in function parameters
- No inline `// @replit` or generator-style comments in component files

### Framework patterns

- **API changes:** Always start with `openapi.yaml` → run codegen → update backend route → frontend gets types automatically
- **Form validation:** Zod schema defined alongside the form component (`formSchema`); use `zodResolver` with React Hook Form
- **Data fetching:** Always use generated hooks (`useGetSurveyResults`, `useSubmitSurvey`) — do not write raw `fetch()` calls in components
- **Routing:** Wouter `<Route>` components only; no `useNavigate` — use `useLocation` setter (`setLocation`)

### Git commit style

Conventional Commits format:
```
feat: add regional filtering to results page
fix: correct attendsInPerson label mapping in results
chore: regenerate API client after openapi.yaml update
docs: update WORKING_NOTES.md
```

---

## Decisions and Tradeoffs

- **Wouter instead of React Router:** Wouter is significantly smaller and sufficient for a two-route app. Do not suggest migrating to React Router.
- **Supabase anon key only (no service role key):** The table was created manually. The API verifies table access on startup and logs SQL instructions if the table is missing. Do not attempt programmatic DDL with the anon key — it will fail.
- **College team as dropdown, not radio buttons:** The list has 11 options including a write-in "Other". Radio buttons were considered and rejected for layout reasons at this list length.
- **localStorage for one-submission enforcement:** No authentication system. The localStorage key `survey_submitted = "true"` prevents re-submission on the same device/browser. This is intentional — adding auth would be a significant scope increase.
- **Orval codegen over hand-written hooks:** The OpenAPI spec is the single source of truth. Any time a type or endpoint changes, `pnpm --filter @workspace/api-spec run codegen` regenerates everything. Never hand-write hooks that duplicate what Orval generates.
- **shadcn/ui with 40 unused components deleted:** The design subagent scaffolded the full shadcn library. All components not imported by the survey app were removed to reduce noise. Do not re-add unused components.
- **Azure deployment: SWA Linked Backend (not Azure Functions):** Rewriting the Express API as Azure Functions was considered and rejected. The Express server deploys to Azure App Service; the SWA Linked Backend feature proxies `/api/*` without any code changes. Do not suggest an Azure Functions rewrite.

---

## What Was Tried and Rejected

- **Auto-creating the `survey_responses` table on API startup:** Requires a direct PostgreSQL connection or service role key. The anon key cannot execute DDL. A startup verification check logs SQL instructions instead. Do not suggest using the anon key for table creation.
- **Radio buttons for the college team list:** Rejected for UX reasons (11 options in a grid form). A `<Select>` dropdown is used instead. Do not suggest switching back.
- **`as any` for the survey submission payload:** Originally used `values as any` in the mutation call. Replaced with a proper `values as SurveySubmission` cast using the imported generated type. Do not use `as any` anywhere.
- **Incorrect `byAttendsInPerson` label remapping on the frontend:** An early version of `Results.tsx` remapped `d.name === "true" ? "Yes" : "No"`, which was wrong because the backend already returns `"Yes"`/`"No"` string keys. This remapping was removed. Do not re-add it.
- **Azure Functions rewrite for the API:** Too much rewrite effort for minimal benefit. The App Service + Linked Backend approach achieves the same result with no code changes to the backend.

---

## Known Issues and Workarounds

**Issue: No rate limiting on `POST /api/survey`**
- No workaround exists. A bad actor can submit unlimited fake responses.
- Do not remove the existing Zod validation — it is the only defense currently in place.

**Issue: `survey_responses` table must be created manually**
- The API server runs a startup check (`checkSurveyTable()` in `index.ts`) that queries the table. If it fails, it logs the full `CREATE TABLE` SQL to the console.
- Workaround: the user ran the SQL manually in the Supabase SQL editor. The table exists.
- Do not remove the startup check — it provides actionable error output if the table is ever missing in a new environment.

**Issue: College team list is Midwest/Big Ten-centric**
- The dropdown lists: Iowa, Iowa State, Nebraska, Illinois, Ohio State, Wisconsin, Minnesota, K-State, Kansas, Mizzou, Other.
- There is a write-in field for "Other". This is intentional for the current audience.
- Do not expand the list without explicit instruction.

---

## Browser / Environment Compatibility

### Frontend

- **Tested in:** Chromium (Replit preview iframe), desktop resolution
- **Expected support:** All modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- **Known incompatibilities:** None identified
- **Mobile:** Responsive layout via Tailwind; not explicitly tested on mobile

### Backend

- **OS:** Linux (NixOS in Replit; Azure App Service Linux in production)
- **Node.js:** 20+ required (ESM `import.meta.dirname`, top-level `await` in Vite config)
- **Package manager:** pnpm 9+ (workspace protocol `workspace:*` requires pnpm)
- **Environment variables required at runtime:**
  - `PORT` — TCP port for the API server (required for Express; optional for Vite build)
  - `SUPABASE_URL` — Supabase project REST URL
  - `SUPABASE_ANON_KEY` — Supabase anonymous key (store as a secret, never commit)
- **Build-time only (Vite):** `BASE_PATH` — defaults to `/` if not set

---

## Open Questions

- Should a service role key (`SUPABASE_SERVICE_ROLE_KEY`) be added so the table can be created automatically on startup in new environments?
- Should the college team list be expanded for a broader national audience, or kept Midwest-focused?
- Should rate limiting (e.g. express-rate-limit, 1 submission per IP per hour) be added before wider distribution?
- After Azure deployment: should the Replit environment be kept running as a staging environment, or shut down to avoid double-billing Supabase writes?

---

## Session Log

### 2026-04-01

**Accomplished:**
- Built full two-page football preferences survey app (survey form + public results scoreboard)
- Express API with POST `/api/survey` and GET `/api/survey/results` backed by Supabase
- OpenAPI spec → Orval codegen pipeline fully wired (Zod schemas + React Query hooks)
- End-to-end test confirmed: responses insert to Supabase and aggregate correctly
- Code review issues resolved: typed aggregate function, SurveySubmission type import, TooltipProps typing, removed 40 unused shadcn components, stripped `@replit` comments
- Generated `README.md` and `WORKING_NOTES.md`
- Azure deployment path identified: SWA (frontend) + App Service (API) + Linked Backend
- Added `staticwebapp.config.json` for SPA routing; made `PORT`/`BASE_PATH` optional in `vite.config.ts` for Azure build compatibility

**Left incomplete:**
- Azure deployment not yet executed (user to perform in Azure portal)
- No rate limiting on survey submission endpoint

**Decisions made:**
- Azure deployment uses App Service + SWA Linked Backend (not Azure Functions rewrite)
- `BASE_PATH` and `PORT` are now optional in `vite.config.ts` with sane defaults

**Next step:**
- User creates Azure Static Web App resource and Azure App Service, configures environment variables, and links them via SWA Linked Backend

---

## Useful References

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Orval Documentation](https://orval.dev/guides/react-query)
- [Azure Static Web Apps — Linked Backends](https://learn.microsoft.com/en-us/azure/static-web-apps/backends)
- [Azure Static Web Apps — Configuration (`staticwebapp.config.json`)](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
- [TanStack React Query v5 Docs](https://tanstack.com/query/v5/docs/framework/react/overview)
- [Recharts API Reference](https://recharts.org/en-US/api)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Wouter — React Router Alternative](https://github.com/molefrog/wouter)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Conventional Commits Spec](https://www.conventionalcommits.org/en/v1.0.0/)

**AI tools used:**
- **Replit Agent (Claude)** — used for full initial build, API design, code review remediation, README/WORKING_NOTES generation, and Azure deployment guidance. All generated code was reviewed and type-checked before commit.
