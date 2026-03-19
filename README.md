# POLOPS — Police Operations System

Full-stack monorepo for police patrolling and bandobast operations management.

## Tech Stack
| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React, Redux Toolkit, React Router |
| Backend    | Node.js, Express.js               |
| Database   | PostgreSQL                        |
| Cache      | Redis (real-time + sessions)      |
| Container  | Docker + Docker Compose           |

---

## Folder Structure

```
polops-app/                         ← Single project root
│
├── frontend/                       ← React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── alerts/             AlertFeed.jsx
│   │   │   ├── common/             StatusBadge.jsx
│   │   │   ├── dashboard/          StatCard.jsx
│   │   │   ├── layout/             Layout.jsx
│   │   │   └── operations/         OperationsTable.jsx
│   │   ├── hooks/                  useClock.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── OperationsPage.jsx
│   │   │   ├── PlanOperationPage.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── BandobastPage.jsx
│   │   │   ├── PatrollingPage.jsx
│   │   │   ├── OfficersPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── services/               api.js (Axios + JWT interceptor)
│   │   ├── store/
│   │   │   ├── index.js            Redux store
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── operationSlice.js
│   │   │       ├── officerSlice.js
│   │   │       ├── alertSlice.js
│   │   │       └── reportSlice.js
│   │   ├── styles/                 global.css
│   │   ├── App.js                  Router + protected routes
│   │   └── index.js                React + Redux Provider entry
│   ├── Dockerfile
│   ├── nginx.conf                  SPA routing + API proxy
│   └── package.json
│
├── backend/                        ← Node.js / Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js         PostgreSQL pool
│   │   │   ├── redis.js            Redis client + key helpers
│   │   │   ├── logger.js           Winston logger
│   │   │   └── init.sql            DB schema + seed data
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── operation.controller.js
│   │   │   ├── officer.controller.js
│   │   │   ├── alert.controller.js
│   │   │   ├── report.controller.js
│   │   │   └── patrol.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   JWT verify + RBAC
│   │   │   ├── error.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── operation.routes.js
│   │   │   ├── officer.routes.js
│   │   │   ├── alert.routes.js
│   │   │   ├── report.routes.js
│   │   │   └── patrol.routes.js
│   │   ├── app.js                  Express setup
│   │   └── index.js                Server entry point
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml              Orchestrates all 4 services
├── .env.example
├── .gitignore
└── package.json                    Root scripts (dev, install:all)
```

## API Reference

| Method | Endpoint                        | Role Required          |
|--------|---------------------------------|------------------------|
| POST   | /api/auth/login                 | Public                 |
| GET    | /api/auth/me                    | Any                    |
| GET    | /api/operations                 | Any                    |
| POST   | /api/operations                 | senior_planner         |
| PATCH  | /api/operations/:id/status      | senior_planner, supervisor |
| POST   | /api/operations/:id/assign      | senior_planner         |
| GET    | /api/officers                   | Any                    |
| POST   | /api/officers                   | senior_planner         |
| GET    | /api/alerts                     | Any                    |
| POST   | /api/alerts                     | Any (field officers)   |
| PATCH  | /api/alerts/:id/resolve         | senior_planner, supervisor |
| GET    | /api/reports                    | Any                    |
| POST   | /api/reports                    | senior_planner, supervisor |
| POST   | /api/patrols/checkin            | Any                    |
| GET    | /api/patrols/officers/locations | senior_planner, supervisor |

---

## Default Login
```
Email:    admin@polops.gov.in
Password: password
Role:     Senior Planner (full access)
```
