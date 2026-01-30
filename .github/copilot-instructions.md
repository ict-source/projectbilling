# Copilot Instructions for ProjectBill

## Project Overview

**ProjectBill** is a healthcare billing and notification platform with dual role management (Patients, Billing Officers, Admin). It combines a React + TypeScript frontend ([PartialBill/](PartialBill/)) with an Express.js backend ([backend/](backend/)), containerized via Docker with nginx reverse proxy.

### Current State: Mock Mode
- Backend currently runs in **mock mode** with in-memory data (PostgreSQL disconnected)
- Uses hardcoded test credentials and mock APIs for development
- Firebase integration configured but not fully implemented
- Production deployment targets Firebase Hosting + Cloud Functions

## Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, shadcn/ui (Radix), TailwindCSS, React Router v6, React Query
- **Backend**: Node.js/Express, Firebase Admin SDK, Nodemailer, JWT auth
- **Database**: PostgreSQL (schema defined, currently unused); SQLite fallback
- **Deployment**: Docker Compose, Nginx reverse proxy, Firebase Hosting

### Core Services

**Frontend** ([PartialBill/src/](PartialBill/src/)):
- Role-based routing: `/patient/*` → PatientDashboard, `/billing/*` → BillingDashboard
- Auth managed via `AuthContext` with localStorage persistence
- `QueryClient` for server state via `@tanstack/react-query`
- NotificationContext for UI toasts (Sonner + shadcn Toaster)

**Backend** ([backend/server.js](backend/server.js)):
- Express REST API with CORS (allows 192.168.x.x:4000/8000, localhost)
- Endpoints: `/api/login`, `/api/register`, `/api/patients`, `/api/bills`, `/api/backup/*`
- Mock data replaced by real database queries on production migration
- JWT tokens issued on login (1d expiry)

**Database** ([schema.sql](schema.sql)):
- Core tables: `users` (UUID PK), `bills`, `roles`, `notifications`, `user_notification_preferences`
- Cascade deletes on user_id references
- Default roles: Admin, Billing Officer, Cashier, Patient

### Data Flow

1. **Patient/Staff Login** → Auth context calls `/api/login` → JWT + User stored in localStorage
2. **Dashboard Load** → Protected routes verify `user.role` before rendering
3. **Fetch Bills/Patients** → React Query calls `/api/bills` or `/api/patients` → renders via shadcn components
4. **Create/Update/Delete** → API call triggers mutation → mock data updates

## Developer Workflows

### Local Development
```bash
# Frontend dev server (Vite, port 8000)
cd PartialBill && npm install && npm run dev

# Backend dev server (Express, port 4000)
cd backend && npm install && npm run server

# Docker Compose (all services)
docker-compose up --build
```

### Key Commands
- **Frontend build**: `npm run build` (outputs to dist/)
- **Backend server**: `npm run server` or `node server.js`
- **ESLint**: `npm run lint` (PartialBill/)
- **Firebase deploy**: `firebase deploy` (deploys PartialBill/dist to hosting)

### Architecture Considerations

**Backend Routes** follow pattern: `/{resource|endpoint}` with nested params:
- `GET /api/patients` → list all
- `POST /api/patients` → create
- `PUT /api/patients/:id` → update  
- `DELETE /api/patients/:id` → delete

**Frontend Components** use shadcn hierarchy:
- Layout: `<Header/>` + `<Footer/>` from [layout/](PartialBill/src/components/layout/)
- UI: Pre-built Radix-based components in [ui/](PartialBill/src/components/ui/)
- Pages organized by role: `pages/patient/`, `pages/billing/`
- Reusable hooks: `use-mobile.tsx`, `use-toast.ts`

**Authentication Flow**:
1. Form submission calls `useAuth().login(email, password)`
2. API response includes JWT token (not stored server-side)
3. `localStorage` stores user object for page refresh persistence
4. Protected routes check `user.role` for authorization

## Project-Specific Patterns

### Environment Variables
- Frontend: `VITE_*` prefix (read from import.meta.env)
- Backend: Standard dotenv in `.env` file (PORT, JWT_SECRET, DATABASE_URL on production)
- Firebase: Config in [lib/firebase.ts](PartialBill/src/lib/firebase.ts), initialized via `firebaseConfig`

### API Response Structure
```json
{ "success": true, "message": "...", "user": {...} }
{ "success": false, "message": "Error reason" }
```
Mock mode always returns `success: true` for testing.

### Component Patterns
- Use shadcn Button/Input/Form components, not HTML elements
- Forms use `react-hook-form` + `@hookform/resolvers` for validation
- Routing uses React Router v6 with `<Routes>` and `<Navigate>` for redirects
- Modal/Dialog via shadcn alert-dialog component

### Notification System
- In-app: Sonner toast library `toast.success()`, `toast.error()`
- Future: Email via Nodemailer, SMS via external provider
- User preferences stored in `user_notification_preferences` table

## Critical Files to Know

| File | Purpose |
|------|---------|
| [PartialBill/src/App.tsx](PartialBill/src/App.tsx) | Route definitions, ProtectedRoute logic |
| [PartialBill/src/contexts/AuthContext.tsx](PartialBill/src/contexts/AuthContext.tsx) | Global auth state, login/register/logout |
| [backend/server.js](backend/server.js) | All API endpoints, mock data, CORS config |
| [schema.sql](schema.sql) | Database schema, migration reference |
| [docker-compose.yml](docker-compose.yml) | Service definitions (frontend, backend, nginx) |
| [PartialBill/vite.config.js](PartialBill/vite.config.js) | Vite dev proxy to backend, alias config |

## Common Tasks

**Adding a new API endpoint**:
1. Add `app.get/post/put/delete("/api/newfeature", ...)` in [server.js](backend/server.js)
2. Add to mock data objects if needed
3. Call from frontend via fetch or React Query

**Adding a new page**:
1. Create component in [pages/](PartialBill/src/pages/) 
2. Add `<Route>` in [App.tsx](PartialBill/src/App.tsx)
3. Protect with `<ProtectedRoute>` or `<BillingProtectedRoute>` if needed

**Styling**:
- TailwindCSS classes directly on elements
- shadcn components already styled with Tailwind
- Global styles in [index.css](PartialBill/src/index.css)

## Known Limitations & Future Work

- Mock mode bypasses database; production migration requires connecting PostgreSQL
- Email/SMS notifications not yet implemented (infrastructure exists in schema)
- Google Auth configured but not fully integrated
- Firebase Hosting deployment requires `firebase.json` rewrites (already set)
- No unit tests currently; consider adding Jest + React Testing Library
