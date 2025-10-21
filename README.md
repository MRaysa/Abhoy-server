
# SafeDesk Server

SafeDesk — AI-Powered Workplace Harassment Monitoring and Compliance System (server)

This repository contains the backend API server for the SafeDesk project. The server provides REST endpoints used by the SafeDesk frontend and AI services. It is a Node.js + Express application that connects to MongoDB.

Note: this is the server component (SafeDesk-server), not a media or frontend project.

## Highlights

- Purpose: Support SafeDesk features for monitoring, storing, and serving workplace harassment/compliance data.
- Tech: Node.js, Express, native MongoDB driver.
- Pattern: Simple MVC-like layout with routes, controllers, models and middleware.

## Requirements

- Node.js 18+ (or compatible LTS)
- pnpm (preferred) or npm
- MongoDB (local or cloud)

## Environment variables

Create a `.env` file in the project root with the following values (or set equivalent environment variables):

- `PORT` (default: `3000`)
- `MONGODB_URI` (default: `mongodb://localhost:27017`)
- `DB_NAME` (default: `safedesk_db`)
- `CLIENT_URL` (default: `http://localhost:5173`)
- `NODE_ENV` (e.g. `development`, `production`)

Example `.env`:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=safedesk_db
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Install

Install pnpm if you don't have it:

```
npm install -g pnpm
```

Install dependencies:

```
pnpm install
```

Or with npm:

```
npm install
```

## Scripts

- `pnpm start` / `npm start` - start the server
- `pnpm dev` / `npm run dev` - start with `nodemon` for development

## Run

Start development server:

```
pnpm dev
```

Start production server:

```
pnpm start
```

Open http://localhost:3000 (or your configured port). Root returns a JSON status. Health: `GET /api/health`.

## Important files

- `server.js` - server entry and bootstrapping
- `config/database.js` - MongoDB connection helper
- `routes/` - route definitions (`index.js`, `userRoutes.js`)
- `controllers/` - request handlers
- `models/` - data layer (e.g. `User.js`)
- `middleware/` - custom middleware (logger, errorHandler, notFound)

## Notes & next steps

- Consider adding `.env.example` with example values.
- Add API documentation (OpenAPI/Swagger or README endpoint examples).
- Implement tests for core routes and the DB connection.

If you want, I can add `.env.example` and a short API reference now.

## Folder structure

Top-level project tree (key files and folders):

```
server-site/
├─ server.js
├─ package.json
├─ pnpm-lock.yaml
├─ .env.example
├─ .gitignore
├─ README.md
├─ config/
│  └─ database.js
├─ controllers/
│  └─ userController.js
├─ models/
│  └─ User.js
├─ routes/
│  ├─ index.js
│  └─ userRoutes.js
└─ middleware/
	├─ errorHandler.js
	├─ logger.js
	├─ notFound.js
	└─ validateRequest.js
```

