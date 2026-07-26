# URL Shortener

A clean, full-stack URL shortener built as the foundation for a future DevSecOps portfolio project.

## Overview

Users can register an account, log in, and create short links for long URLs — optionally choosing a custom alias. Visiting a short link redirects to the original URL and records a click. Each link's dashboard entry shows its click count, creation date, and last-accessed time.

## Features

- **Authentication** — register, login, logout, JWT-based sessions, bcrypt password hashing
- **URL management** — create, edit, delete, and list short URLs per user
- **Custom aliases** — optionally choose a memorable alias instead of a random short code
- **Redirects** — visiting a short URL (`/:code`) redirects to the original destination
- **Analytics** — click count, creation date, and last-accessed timestamp per link
- **Validation & error handling** — request validation with Zod, centralized error handling, consistent JSON error responses

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT, bcrypt |
| Validation | Zod |

## Folder Structure

This is an npm workspaces monorepo with two independent apps:

```
url-shortner-app/
├── backend/                   # Express + TypeScript API
│   ├── prisma/
│   │   └── schema.prisma      # User and ShortUrl models
│   ├── src/
│   │   ├── config/            # env loading, Prisma client singleton
│   │   ├── controllers/       # request handlers (auth, urls, redirect)
│   │   ├── middleware/        # auth guard, validation, error handler
│   │   ├── routes/            # Express routers
│   │   ├── services/          # business logic, database access
│   │   ├── types/             # shared TypeScript types
│   │   ├── utils/             # AppError, asyncHandler, short code generator
│   │   ├── validation/        # Zod schemas
│   │   ├── app.ts             # Express app assembly
│   │   └── server.ts          # entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                  # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # landing page
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── dashboard/page.tsx # authenticated URL management UI
│   │   ├── components/            # Navbar, forms, buttons, URL list item
│   │   ├── context/                # AuthContext (token/session state)
│   │   └── lib/api.ts              # typed fetch client for the backend API
│   ├── .env.local.example
│   └── package.json
│
├── package.json                # npm workspaces root
└── README.md
```

## API Reference

| Method | Route | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Log in, receive a JWT |
| POST | `/api/auth/logout` | No | Stateless logout acknowledgement |
| GET | `/api/urls` | Yes | List the current user's short URLs |
| POST | `/api/urls` | Yes | Create a short URL |
| GET | `/api/urls/:id` | Yes | Get a single short URL |
| PUT | `/api/urls/:id` | Yes | Update a short URL's destination or alias |
| DELETE | `/api/urls/:id` | Yes | Delete a short URL |
| GET | `/:code` | No | Redirect to the original URL and record a click |

Authenticated routes expect an `Authorization: Bearer <token>` header.

## Installation

### Prerequisites

- Node.js 18+
- A running PostgreSQL instance

### 1. Clone and install dependencies

From the repository root (this installs both workspaces):

```bash
npm install
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your PostgreSQL connection string, e.g.:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/urlshortener"
```

Also set `JWT_SECRET` to a long random string.

### 3. Run database migrations

```bash
npm run prisma:migrate --workspace=backend
```

This creates the `users` and `short_urls` tables based on `backend/prisma/schema.prisma`.

### 4. Configure the frontend

```bash
cd frontend
cp .env.local.example .env.local
```

The default `NEXT_PUBLIC_API_URL=http://localhost:4000` matches the backend's default port.

## Running Locally

From the repository root, run each app in its own terminal:

```bash
# Terminal 1 — backend (http://localhost:4000)
npm run dev:backend

# Terminal 2 — frontend (http://localhost:3000)
npm run dev:frontend
```

Then open [http://localhost:3000](http://localhost:3000), register an account, and start creating short URLs.

## Building for Production

```bash
npm run build:backend
npm run build:frontend
```

The backend compiles to `backend/dist`; run it with `npm run start --workspace=backend`. The frontend produces a standard Next.js production build; run it with `npm run start --workspace=frontend`.

## Linting & Formatting

```bash
npm run lint:backend
npm run lint:frontend
```

Each workspace also has a `format` script that runs Prettier.

## Docker Deployment

The repository runs as **three independent Docker Compose projects** on the host:

| Project | File | Purpose |
|---|---|---|
| Reverse proxy | `docker-compose.proxy.yml` | Single `nginx:alpine` container. The only thing that publishes host ports (`80`/`443`). Hostname-routes to whichever app stacks are running. |
| Production app | `docker-compose.prod.yml` | Postgres, backend, frontend for `go2url.xyz`. No host ports published — reachable only through the proxy. |
| Development app | `docker-compose.dev.yml` | Postgres, backend, frontend for `dev.go2url.xyz`. Publishes its own host ports (distinct from prod) *and* joins the proxy network, so it's reachable both directly and via hostname. |

This split means the proxy is upgraded, restarted, or re-certified independently of either app stack, and additional applications can be added later by giving them their own compose project and a `conf.d/*.conf` entry — without touching the proxy container itself.

### Networking

Each app stack defines two networks:

- **`app-network`** — private per-stack network (`url-shortener-prod-net` / `url-shortener-dev-net`). The database only ever joins this one, so it is never reachable from the proxy or from the other stack.
- **`proxy-network`** — a single external network named `proxy-network`, shared by the proxy container and every app's frontend/backend. This is how Nginx reaches `frontend`/`backend` (prod) and `dev-frontend`/`dev-backend` (dev) by container name without any host ports being involved.

```
                        ┌─────────────────────────┐
                        │   proxy-network (ext)    │
                        │                          │
   Internet ──80/443──▶ │   nginx (reverse-proxy)  │
                        │                          │
                        └────────┬────────┬────────┘
                                 │        │
                    ┌────────────┘        └────────────┐
                    ▼                                   ▼
        ┌───────────────────────┐          ┌───────────────────────────┐
        │  app-network (prod)   │          │  app-network (dev)         │
        │                       │          │                             │
        │  frontend ─ backend   │          │  dev-frontend ─ dev-backend │
        │       │                │          │        │                    │
        │       ▼                │          │        ▼                    │
        │      db (prod)         │          │      db (dev)               │
        │  (no proxy-network)    │          │  (no proxy-network)         │
        └───────────────────────┘          └───────────────────────────┘
```

The `db` service in both stacks has **no** `proxy-network` membership and publishes no host port in production (dev publishes one for local psql/GUI access only) — it is unreachable from the internet or from the reverse proxy in either environment.

### Request flow

```
Browser
  │  https://go2url.xyz/...        https://dev.go2url.xyz/...
  ▼
Cloudflare (TLS termination)
  │  plain HTTP
  ▼
nginx (docker-compose.proxy.yml), listening on :80
  │
  ├─ Host: go2url.xyz      → conf.d/production.conf  ──▶ frontend:3000 / backend:4000
  └─ Host: dev.go2url.xyz  → conf.d/development.conf  ──▶ dev-frontend:3000 / dev-backend:4000

Within each server block:
  /api/*                       → backend upstream
  = /health                    → backend upstream
  /<shortcode> (not a known    → backend upstream (redirect)
   frontend route)
  everything else              → frontend upstream (Next.js)
```

### One-time setup: create the shared network and start the proxy

```bash
docker network create proxy-network
docker compose -f docker-compose.proxy.yml up -d
```

The proxy only needs to be started once; it stays up across app deploys/restarts. Validate config changes before applying them:

```bash
docker compose -f docker-compose.proxy.yml config    # validate compose syntax
docker compose -f docker-compose.proxy.yml exec nginx nginx -t   # validate nginx syntax (running container)
```

`proxy/conf.d/*.conf` use `resolver 127.0.0.11` (Docker's embedded DNS) with variables in `proxy_pass` rather than static `upstream {}` blocks, so `nginx -t` and container startup succeed even if the app stacks aren't running yet — nginx resolves `frontend`/`backend` container names lazily, per-request, instead of failing to start when a hostname can't be resolved at boot.

### Production (`go2url.xyz`)

```bash
cp .env.example .env   # fill in JWT_SECRET and any overrides
docker compose --env-file .env -f docker-compose.prod.yml up -d
```

No host ports are published by this stack. It's reachable only via the reverse proxy at `go2url.xyz`.

### Development (`dev.go2url.xyz`)

A fully separate stack — its own containers, network, volume, and Postgres database — so it can run alongside production on the same server without collisions.

Unlike production, the dev stack doesn't build images locally. `.github/workflows/development.yml` builds the backend and frontend images on every push to the `development` branch, pushes them to GHCR (`ghcr.io/kamaljit87/url-shortner-app-backend`/`-frontend`, tagged `dev` and by commit SHA), and SSHes into the server to pull and restart the stack. That workflow needs these GitHub repository secrets/variables configured once:

- Secrets: `LINODE_HOST`, `LINODE_USER`, `LINODE_SSH_KEY`, `GHCR_PAT`
- Variables: `DEV_NEXT_PUBLIC_API_URL` (baked into the frontend at build time, e.g. `https://dev.go2url.xyz`)

On the server, one-time setup:

```bash
cp .env.dev.example .env.dev   # fill in DEV_JWT_SECRET and any overrides
```

From then on, pushing to `development` deploys automatically. To pull and restart manually:

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yml pull
docker compose --env-file .env.dev -f docker-compose.dev.yml up -d
```

Reachable via the reverse proxy at `dev.go2url.xyz`, and directly on the host at:

- Frontend: `http://<host>:3001` (`DEV_FRONTEND_PORT`)
- Backend: `http://<host>:4001` (`DEV_BACKEND_PORT`)
- Database: `<host>:5433` (`DEV_POSTGRES_PORT`)

These dev ports are intentionally different from production's (which publishes none), so both stacks run simultaneously on the same server without port conflicts.

To tear the dev stack down (including its database volume):

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yml down -v
```

### Manual steps required after this refactor

1. **Create the external network once per host**: `docker network create proxy-network` (idempotent — safe to re-run; `docker compose -f docker-compose.proxy.yml up -d` will fail with a clear error if it's missing).
2. **Start the proxy stack** (`docker compose -f docker-compose.proxy.yml up -d`) before or after the app stacks — order doesn't matter, but nothing is reachable from the internet until the proxy is up.
3. **Point DNS/Cloudflare at the proxy's host, port 80** (unchanged from before — Cloudflare still terminates TLS in front of the origin; the origin still speaks plain HTTP). No cert files are required for this setup. If the proxy should terminate TLS itself instead (e.g. bypassing Cloudflare, or using `certbot`), add cert files under `proxy/certs/`, add a `443 ssl` server block per host in `proxy/conf.d/`, and publish `443` — already reserved in `docker-compose.proxy.yml`.
4. **Redeploy both app stacks** with the new compose files so they join `proxy-network` and drop their old published ports (prod) / move to new ports (dev).
5. **If running dev locally for the first time**, update any bookmarks/scripts pointing at the old dev ports (previously proxied through `DEV_NGINX_PORT=8080`) to the new direct ports (`3001`/`4001`) or continue using `dev.go2url.xyz` through the proxy.
6. **Known pre-existing issue fixed by this refactor**: `production.yml` referenced a nonexistent `docker-compose.yml` (the file was renamed to `docker-compose.prod.yml` in an earlier commit but the workflow wasn't updated). It now correctly references `docker-compose.prod.yml`.

## Database Models

**User**
- `id`, `email` (unique), `password` (hashed), `createdAt`

**ShortUrl**
- `id`, `originalUrl`, `shortCode` (unique), `customAlias` (unique, optional), `clickCount`, `createdAt`, `lastAccessed`, `userId`
