# ADR 0001: Use pnpm Monorepo Architecture

## Context

Resource-Adda consists of an Express backend and a Next.js frontend. Developing them in separate repositories increases friction when sharing types, running development scripts, and managing dependencies.

## Decision

We will use a **Monorepo** architecture managed by `pnpm` workspaces.

- The root directory will contain a `package.json` with `pnpm-workspace.yaml`.
- The frontend and backend will live in their respective subdirectories.

## Consequences

### Positive

- A single command (`pnpm run dev`) can boot both the frontend and backend simultaneously.
- Simplified dependency management and faster installation times due to pnpm's strict, symlinked node_modules.
- Easier to share TypeScript interfaces between frontend and backend in the future.

### Negative

- CI/CD pipelines require slightly more configuration to only build the changed packages.
- Developers need to learn pnpm workspace commands.
