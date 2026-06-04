# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

This is a small TypeScript Express notification service. The app starts from `index.ts`, loads environment variables from `pre-start/index.ts`, builds the Express app in `src/app.ts`, and mounts API routes from `src/routes`.

The current main feature is the `/notify` API:

- `GET /notify/health` returns service health and connected Socket.IO client count.
- `POST /notify` validates the request body with Zod, adds server-generated message metadata, broadcasts it over Socket.IO, and returns the broadcast payload.

## Folder Structure

- `index.ts` - process entrypoint; imports pre-start setup and starts the Express server on `process.env.PORT`.
- `pre-start/` - startup side effects, currently dotenv configuration.
- `src/app.ts` - Express app construction and global middleware.
- `src/routes/` - route registration. `src/routes/index.ts` is the route barrel mounted by `src/app.ts`.
- `src/controllers/` - HTTP-facing request handlers. Controllers should call services and shape HTTP responses.
- `src/services/` - business logic. Keep HTTP-specific `Request`/`Response` details out of this layer.
- `src/schemas/` - Zod schemas and inferred TypeScript request types.
- `src/middlewares/` - reusable Express middleware, including request validation.
- `dist/` - generated build output. Do not hand-edit this directory.
- `.husky/` - git hooks. The pre-commit hook runs `npm run lint:fix`.
- `.vscode/` - local editor/debugger settings.

Each feature folder uses an `index.ts` barrel export. When adding new controllers, services, schemas, or middlewares, update the relevant barrel so existing path aliases keep working.

## Imports and Aliases

The project uses TypeScript path aliases defined in `tsconfig.json`:

- `@services`
- `@controllers`
- `@routes`
- `@middlewares`
- `@schemas`

Prefer these aliases for cross-folder imports. Relative imports are fine within the same folder, such as route modules importing sibling route files.

## Common Commands

- `npm run build:dev` - clean `dist/`, compile TypeScript with `tsc`, and rewrite aliases with `tsc-alias`.
- `npm run dev` - run nodemon; rebuilds and starts the compiled app on TypeScript changes.
- `npm run dev:inspect` - same as dev, with Node inspector enabled.
- `npm run lint` - run ESLint.
- `npm run lint:fix` - run ESLint with auto-fixes.
- `npm run build` - run lint fixes, clean `dist/`, and create the production webpack build.
- `npm start` - run `node dist/index.js`; requires a prior build.

There is no test script configured at the moment. For changes with behavior risk, add an appropriate test setup first or document that verification was limited to build/lint.

## Development Notes

- Keep source changes in TypeScript files under `src/`, `pre-start/`, or root config/entry files as appropriate.
- Do not manually edit `dist/`; regenerate it with the build command when build artifacts are intentionally part of the change.
- Request validation should live in `src/schemas` and be applied through `validateRequestMiddleware`.
- Keep controllers thin: validate and translate HTTP concerns there, then delegate business behavior to `src/services`.
- Keep schemas as the source of truth for request payload types by exporting `z.infer` types beside the schema.
- The project uses strict TypeScript. Avoid weakening types or adding `any` unless there is a narrow reason and the local style already permits it.
- The ESLint config includes Prettier integration and warns on `console`; leave intentional console usage explicit and scoped.
- `.env` is local configuration. Do not expose secrets in docs, logs, or commits.

## Environment

The server reads `PORT` from the environment. `.env.example` currently documents the expected shape. If new environment variables are introduced, update `.env.example` and mention them in user-facing setup notes.

## Docker

`Dockerfile` builds the app in a Node Alpine builder stage and runs `yarn start` in the production stage. The package manager files currently present are npm files (`package-lock.json`), so be careful when changing Docker/package-manager behavior and keep lockfiles consistent with the chosen package manager.

## Agent Workflow

1. Inspect the relevant files before editing; this repo is small enough that nearby structure matters.
2. Preserve the controller/service/schema separation when adding routes or behavior.
3. Use `rg`/`rg --files` for searches.
4. Run the most relevant verification command before finishing, usually `npm run lint` or `npm run build:dev`.
5. Report any verification that could not be run, along with the reason.
