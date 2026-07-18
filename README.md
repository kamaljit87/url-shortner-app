# URL Shortener

A clean, full-stack URL shortener built as the foundation for a future DevSecOps portfolio project. This repository intentionally contains **only the application** — no Docker, CI/CD, or infrastructure tooling. Those are added separately, later, on top of this codebase.

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

## Database Models

**User**
- `id`, `email` (unique), `password` (hashed), `createdAt`

**ShortUrl**
- `id`, `originalUrl`, `shortCode` (unique), `customAlias` (unique, optional), `clickCount`, `createdAt`, `lastAccessed`, `userId`
