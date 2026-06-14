# Resource-Adda AI Agent Instructions

Hello AI Assistant! Whether you are Claude, Codex, Kiro, Antigravity, GitHub Copilot, or any other agentic AI, please read this document carefully to understand the context, architecture, and rules of the **Resource-Adda** project before taking action.

## 1. Project Overview

**Resource-Adda** is an open-source, full-stack web application designed for college students (originating from NITRR) to share and discover academic resources (Notes, PYQs, Books).

- **Core Philosophies:**
  - **Universal Deployability:** The project must be easy to configure and deploy out-of-the-box by any institution without modifying the source code.
  - **Student Wellbeing:** The platform should actively promote mental well-being, foster a warm and inclusive culture, and avoid toxic competitiveness.

## 2. Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Shadcn UI, Zustand (State Management), React Hook Form + Zod (Validation), Axios.
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT Auth.
- **Package Manager:** `pnpm` (Workspace/Monorepo setup).

## 3. Directory Structure

You are in a `pnpm` monorepo.

- `/frontend`: Next.js application.
- `/backend`: Node.js Express server.
- `/docs`: Project documentation.
- `/.agents`: Specialized AI rules and skills.

## 4. Where to Read More

To get the full picture of the project, please consult the following directories and files as needed:

1. **Architecture Decision Records (ADRs)**
   - Path: `docs/adr/*.md`
   - Read these to understand _why_ certain technical and cultural decisions were made (e.g., dynamic markdown pages, Cloudinary storage, universal deployability, student wellbeing).

2. **AI Agent Rules & Personas**
   - Path: `.agents/rules/*.md`
   - This directory contains specific rule files for different roles (e.g., `frontend-engineer.md`, `backend-architect.md`, `security-engineer.md`). If you are asked to perform a specific task, read the corresponding rule file first.

3. **AI Skills & Capabilities**
   - Path: `.agents/skills/*/SKILL.md`
   - This directory contains specialized skills (e.g., `api-design`, `frontend-design`, `database-design`). Use the `view_file` tool to read the `SKILL.md` inside any folder that matches your current task to learn the project's established patterns.

## 5. Coding Guidelines & Rules

- **TypeScript First:** Ensure robust typing across both frontend and backend.
- **Validation:** Use `zod` for all backend request validation and frontend form validation (coupled with `react-hook-form`).
- **UI/UX:** Adhere to modern, accessible, and warm design principles using Tailwind and Shadcn UI.
- **Configuration over Hardcoding:** Do not hardcode institution-specific details (like `nitrr.ac.in`). Rely on the global `useConfigStore` (frontend) or `SystemSettings` model (backend) for dynamic configuration.

When you start a new task, always verify the state of the codebase, check for existing ADRs or Agent Rules that apply, and ask the user clarifying questions if the requirements are underspecified.
