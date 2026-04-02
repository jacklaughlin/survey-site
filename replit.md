# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: Supabase (PostgreSQL via @supabase/supabase-js)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── football-survey/    # React + Vite survey frontend (served at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection (unused for now)
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Football Survey App

A two-page football preferences survey web app.

### Features
- **Survey form** at `/` — 8 questions about football preferences. One submission per person (tracked via localStorage).
- **Results page** at `/results` — Live aggregated charts (Recharts) showing all responses. Publicly accessible.
- **Red theme** — Bold dark design with #C8102E red as the primary color.

### Survey Questions
1. What state are you from? (dropdown)
2. Gender (Male/Female)
3. Favorite NFL team (all 32 teams, dropdown)
4. Favorite college football team (Iowa, Iowa State, Nebraska, Illinois, Ohio State, Wisconsin, Minnesota, K-State, Kansas, Mizzou, Other write-in)
5. College or NFL preference
6. Watch frequency
7. Attends games in person
8. Favorite position to watch

### Environment Variables Required
- `SUPABASE_URL` — Supabase project URL (set as env var, shared)
- `SUPABASE_ANON_KEY` — Supabase anon/publishable key (set as secret)

### Supabase Table
The `survey_responses` table must be created in Supabase manually (SQL editor):
```sql
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  gender TEXT NOT NULL,
  nfl_team TEXT NOT NULL,
  college_team TEXT NOT NULL,
  college_team_other TEXT,
  football_preference TEXT NOT NULL,
  watch_frequency TEXT NOT NULL,
  attends_in_person BOOLEAN NOT NULL,
  favorite_position TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON public.survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous reads" ON public.survey_responses FOR SELECT USING (true);
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and Supabase for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /healthz`; `src/routes/survey.ts` exposes `POST /survey` and `GET /survey/results`
- Supabase client: `src/lib/supabase.ts`
- Depends on: `@workspace/api-zod`, `@supabase/supabase-js`

### `artifacts/football-survey` (`@workspace/football-survey`)

React + Vite frontend for the survey. Served at the root path `/`.

- Survey form: `src/pages/SurveyForm.tsx`
- Results page: `src/pages/Results.tsx`
- Shared header: `src/components/Header.tsx`
- Uses `@workspace/api-client-react` for API hooks

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`
