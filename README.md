# Gridiron Survey — CFB × NFL

## Description

Gridiron Survey is a full-stack football fan preferences survey app that collects opinions across eight questions — from state and team allegiances to watch habits and favorite positions — and displays live aggregated results on a public scoreboard dashboard. It was built to capture real-time fan sentiment across college and professional football audiences. The app is designed for sports researchers, team marketers, and curious football fans who want to see how their preferences stack up against the wider fan base.

---

## Badges

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-red?style=for-the-badge)

---

## Features

- **8-question survey** covering state, gender, NFL team, college team, league preference, watch frequency, in-person attendance, and favorite position
- **One submission per person** — localStorage prevents duplicate entries and auto-redirects returning visitors to the results page
- **Live scoreboard** — the public results page updates in real time as new responses come in, no login required
- **Interactive Recharts visualizations** — bar charts for teams, states, and positions; donut charts for preference and frequency breakdowns
- **College team write-in** — respondents who pick "Other" can type in their specific team name
- **Fully type-safe API** — OpenAPI spec drives code-generated Zod validators and React Query hooks across the full stack
- **Dark red stadium theme** — bold `#C8102E` red on a dark background built with shadcn/ui and Tailwind CSS
- **Supabase-backed persistence** — all responses stored in a PostgreSQL table with row-level security enforcing anonymous read/write

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | Frontend UI framework |
| Vite | Frontend dev server and bundler |
| TypeScript | Static typing across all packages |
| Wouter | Lightweight client-side routing |
| shadcn/ui + Tailwind CSS | UI component library and styling |
| Recharts | Results page data visualizations |
| React Hook Form + Zod | Survey form state management and validation |
| TanStack React Query | Server state management and data fetching |
| Express 5 | REST API server |
| Supabase (`@supabase/supabase-js`) | PostgreSQL database and row-level security |
| Orval | OpenAPI-to-TypeScript codegen (hooks + Zod schemas) |
| pnpm workspaces | Monorepo package management |

---

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/installation)
- A [Supabase](https://supabase.com/) project (free tier works)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/gridiron-survey.git
cd gridiron-survey
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set environment variables**

Create a `.env` file in the project root (or set these in your hosting environment):

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3001
```

4. **Create the Supabase database table**

Run the following SQL in your [Supabase SQL Editor](https://app.supabase.com/):

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

CREATE POLICY "Allow anonymous inserts"
  ON public.survey_responses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous reads"
  ON public.survey_responses FOR SELECT USING (true);
```

5. **Start the development servers**

```bash
# Start the API server
pnpm --filter @workspace/api-server run dev

# In a separate terminal, start the frontend
pnpm --filter @workspace/football-survey run dev
```

---

## Usage

### Running the app

| Service | Default URL |
|---|---|
| Survey frontend | `http://localhost:5173` |
| API server | `http://localhost:3001` |

### Survey flow

1. Open the app at `/` — fill out all 8 questions and click **Submit to Live Scoreboard**
2. Your response is saved to Supabase and you are redirected to `/results`
3. The results page at `/results` is public and shows live aggregated charts for all submissions

### API endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/survey` | Submit a new survey response |
| `GET` | `/api/survey/results` | Retrieve aggregated results |
| `GET` | `/api/healthz` | Server health check |

### Regenerating the API client

If you modify `lib/api-spec/openapi.yaml`, regenerate the TypeScript client with:

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Project Structure

```
gridiron-survey/
├── artifacts/
│   ├── api-server/                  # Express REST API
│   │   └── src/
│   │       ├── app.ts               # Express app setup, middleware, routes
│   │       ├── index.ts             # Server entry point, startup table verification
│   │       ├── lib/
│   │       │   ├── logger.ts        # Pino structured logger
│   │       │   └── supabase.ts      # Supabase client singleton
│   │       ├── middlewares/         # Express middleware (logging, etc.)
│   │       └── routes/
│   │           ├── health.ts        # GET /api/healthz
│   │           ├── index.ts         # Route aggregator
│   │           └── survey.ts        # POST /api/survey, GET /api/survey/results
│   └── football-survey/             # React + Vite frontend
│       └── src/
│           ├── App.tsx              # Root app, router, providers
│           ├── index.css            # Global styles and CSS variables
│           ├── main.tsx             # React entry point
│           ├── components/
│           │   ├── Header.tsx       # Top nav with branding and route links
│           │   └── ui/              # shadcn/ui components (16 used)
│           ├── hooks/
│           │   └── use-toast.ts     # Toast notification hook
│           ├── lib/
│           │   └── utils.ts         # cn() utility for class merging
│           └── pages/
│               ├── Results.tsx      # Live scoreboard with Recharts charts
│               ├── SurveyForm.tsx   # 8-question survey form
│               └── not-found.tsx    # 404 page
├── lib/
│   ├── api-client-react/            # Generated React Query hooks (do not edit)
│   ├── api-spec/
│   │   └── openapi.yaml             # OpenAPI 3.1 spec — source of truth for API
│   ├── api-zod/                     # Generated Zod schemas (do not edit)
│   └── db/                          # Drizzle ORM schema (future use)
├── scripts/                         # Internal utility scripts
├── pnpm-workspace.yaml              # pnpm workspace configuration
├── tsconfig.base.json               # Shared TypeScript base config
└── README.md                        # This file
```

---

## Changelog

### v1.0.0 — 2026-04-01

- Initial release of Gridiron Survey
- 8-question football preferences survey form
- Live aggregated results page with Recharts visualizations
- Supabase PostgreSQL persistence with row-level security
- One-submission-per-person enforcement via localStorage
- Full OpenAPI spec with auto-generated TypeScript client and Zod validators
- Dark red (`#C8102E`) stadium-inspired UI theme
- pnpm monorepo with shared TypeScript project references

---

## Known Issues / To-Do

- [ ] Table creation requires manual SQL execution in the Supabase dashboard; a migration script using a service-role key would eliminate this manual step
- [ ] The `collegeTeam` dropdown is tailored to Midwest/Big Ten programs — a more comprehensive or regionalized team list would improve inclusivity
- [ ] No rate limiting on the `POST /api/survey` endpoint; a bad actor could flood the database with fabricated submissions
- [ ] The results page polls on component mount only; adding auto-refresh or WebSocket updates would keep the scoreboard truly live without a page reload
- [ ] No admin view to inspect or export raw response data

---

## Roadmap

- **Service-role migration** — auto-create the `survey_responses` table on first API startup using a privileged Supabase service-role key
- **Regional filtering** — allow the results page to filter charts by state or region
- **CSV / JSON export** — let admins download all raw survey responses for offline analysis
- **Shareable result links** — generate a URL that pre-filters the scoreboard to a specific team or state
- **Additional demographic questions** — expand the survey with age range, years watching, and streaming vs. broadcast preference

---

## Contributing

Contributions are welcome. Please open an issue first to discuss any significant change before submitting a pull request. Keep PRs focused on a single concern and include a clear description of what changed and why.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Install dependencies: `pnpm install`
4. Make your changes and verify the build: `pnpm run typecheck`
5. Commit with a descriptive message: `git commit -m "feat: add regional filtering to results page"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request against `main`

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Your Name**
Institution / Organization
Course or Project Context

---

## Contact

GitHub: [https://github.com/your-username](https://github.com/your-username)

---

## Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) — accessible, composable React component primitives
- [Recharts](https://recharts.org/) — composable charting library built on D3
- [Supabase](https://supabase.com/docs) — open-source Firebase alternative with excellent PostgreSQL tooling
- [Orval](https://orval.dev/) — OpenAPI-to-TypeScript codegen that powers the type-safe API client
- [TanStack Query](https://tanstack.com/query) — server state management for React
- [Vite](https://vitejs.dev/) — fast frontend build tooling
- [Replit](https://replit.com/) — cloud development environment used to build and host this project
- AI pair programming assistance provided by **Replit Agent** (Claude) during initial scaffolding, API design, and code review
