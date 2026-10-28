# JobBoard · Online Job Board & Recruitment Platform

Frontend for the COM311 group mini-project (Group CC4): a role-based job board where
job seekers search and apply for vacancies, and employers post roles and manage
applicants.

Built with **Next.js 16 (App Router)**, **React 19**, **Ant Design 6** and
**lucide-react**. The project is frontend-only, so all data lives in a typed,
browser-persisted mock store (`src/mock`).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | `tsc --noEmit` |

## Demo accounts

The sign-in screen has a **“Fill demo credentials”** button. Passwords are `Demo1234`.

| Role | Email |
| --- | --- |
| Job seeker | `seeker@demo.com` |
| Employer | `employer@demo.com` |

Two more employer accounts exist (`hr@demo.com`, `talent@demo.com`) so that a vacancy
posted by one employer is not visible in another employer's dashboard.

Demo data is stored in `localStorage` under `cc4.jobboard.v1`. Use **Reset demo data**
in the account menu to restore the seed.

## Route map

Public:

| Route | Purpose |
| --- | --- |
| `/` | Landing page with search |
| `/seeker/jobs` | Public vacancy search (filters, sorting, pagination) |
| `/seeker/jobs/[id]` | Vacancy details; applying requires sign-in |
| `/login`, `/register` | Authentication (role tabs) |

Job seeker (signed in as `SEEKER`):

| Route | Purpose |
| --- | --- |
| `/seeker/dashboard` | Application stats, recommendations, notifications |
| `/seeker/applications` | Every application with a status timeline |
| `/seeker/profile` | Profile form, skills, CV upload |

Employer (signed in as `EMPLOYER`):

| Route | Purpose |
| --- | --- |
| `/employer/dashboard` | Vacancy performance and latest applicants |
| `/employer/jobs` | Manage vacancies (edit, close, reopen) |
| `/employer/jobs/new` | Post a vacancy |
| `/employer/jobs/[id]` | Vacancy details plus its applicants |
| `/employer/applicants` | All applicants, filterable by vacancy |

Legacy URLs (`/auth/login`, `/jobs`, `/job-seeker/home`, `/applications`, `/Employer/*`)
are redirected by `src/proxy.ts`.

## Architecture notes

- `src/proxy.ts` handles route protection, role routing and legacy redirects. Session
  state is read from cookies written in `src/services/session.ts`.
- `src/mock/store.ts` is the single data source. Screens subscribe through
  `src/hooks/useStore.ts`, which uses `useSyncExternalStore` so server-rendered HTML
  and the hydrated client agree.
- `src/mock/types.ts` defines the shared domain model, including one canonical
  `ApplicationStatus` lifecycle used everywhere.
- `src/services/api.ts` is the seam for a future backend: set `NEXT_PUBLIC_API_URL`
  and the auth service calls real endpoints instead of the mock store.
- Theme tokens live in `src/theme.ts`; Ant Design tokens are the only styling system
  (no Tailwind).
