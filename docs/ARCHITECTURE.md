# Architecture Overview

Resource-Adda is an open-source academic hub built with a modern JavaScript/TypeScript stack. It uses a **Monorepo** architecture managed by `pnpm`, split into two main packages: `frontend` and `backend`.

## High-Level Architecture

```mermaid
graph TD
    Client[Client (Browser)] -->|Next.js App Router| Frontend[Frontend (Next.js)]
    Client -->|REST API| Backend[Backend (Express.js)]
    Frontend -->|REST API| Backend
    Backend -->|Mongoose| Database[(MongoDB)]
    Backend -->|Cloudinary SDK| Storage[(Cloudinary)]
```

## 1. Frontend (Next.js 15)

The frontend is built using **Next.js 15** with the App Router paradigm.

- **Language**: TypeScript
- **Styling**: Tailwind CSS v3, utilizing CSS variables for dynamic theming (Light/Dark mode via `next-themes`).
- **UI Components**: `shadcn/ui` combined with Radix UI primitives.
- **State Management**: `zustand` is used for global state (e.g. `useAuthStore` and `useConfigStore`).
- **Data Fetching**: `axios` for client-side API requests.

### Key Frontend Patterns

- **Auth Provider**: A top-level wrapper (`AuthProvider.tsx`) validates the JWT token on mount to restore user sessions.
- **Dynamic Config**: A `useConfigStore` pulls public settings (like institute name and tagline language) on load to dynamically brand the landing page.
- **Markdown Rendering**: `react-markdown` dynamically renders Markdown content with syntax highlighting and LaTeX support for static pages (Privacy, FAQ, etc.).
- **User Dashboard & Gamification**: Uses a custom tabbed navigation architecture to manage user identity, tracking uploads and reputation levels using `useAuthStore` without needing page reloads.
- **Component Pillars**: The UI is structured around four main pillars (Academic Library, Placements, Roadmaps, and Wellbeing), connected through the Home Page Bento Grid architecture.

## 2. Backend (Express.js)

The backend is a lightweight REST API built with Express.js.

- **Language**: TypeScript
- **Database**: MongoDB via Mongoose.
- **Authentication**: JWT (JSON Web Tokens) with hashed passwords (`bcryptjs`).
- **File Storage**: Cloudinary is used for remote file streaming.

### Backend Data Models

- **User**: Stores authentication details, roles (`super_admin`, `admin`, `user`), and gamification states (`branch`, `semester`, `contributionPoints`).
- **SystemSettings**: Stores global singleton config (e.g. allowed email patterns, tagline language).
- **Contribution**: Tracks student document uploads in a `PENDING` state until reviewed.
- **Document**: Represents an approved resource that is available in the public library.
- **Placement**: Tracks student interview experiences and preparation strategies.
- **Roadmap**: Tracks structured learning paths created by seniors for juniors.
- **Page**: Stores dynamic Markdown pages for site policies.

### Backend Routing Strategy

- `/api/auth/*`: Registration, Login, and Profile endpoints.
- `/api/setup/*`: Super Admin configuration and public setting exposes.
- `/api/resources/*`: Document uploading, reviewing, and public fetching.
- `/api/pages/*`: Dynamic Markdown page CRUD operations.

## 3. Tooling & DevOps

- **Package Manager**: `pnpm` workspaces for parallel monorepo task execution.
- **Linting & Formatting**: ESlint and Prettier.
- **Scripts**: A unified `pnpm run dev` script dynamically launches both servers at once.
