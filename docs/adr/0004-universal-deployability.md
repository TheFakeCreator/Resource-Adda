# 4. Universal Deployability & First-Time Setup Experience

Date: 2026-06-14

## Status

Accepted

## Context

Resource-Adda aims to be an open-source project that can be easily adopted, forked, and deployed by other institutions, communities, or independent developers. A common barrier to adopting open-source software is a complex, undocumented, or fragile setup process. Furthermore, deploying a full-stack application (frontend, backend, database, storage) can be daunting without a streamlined onboarding path.

## Decision

We have decided that **universal deployability and an exceptional first-time configuration experience** are core requirements for this project.

To achieve this, we will:

1. **Automate the Setup Process:** Ensure that running the project locally or deploying it to production requires minimal manual steps.
2. **First-Time Configuration Wizard:** The application includes a "First-Time Setup Wizard" (`/setup` route) that is automatically triggered if the database is empty. This allows the first user to configure the institute name, tagline, email verification patterns, and global settings intuitively without needing to manually edit configuration files or databases.
3. **Environment Agnostic:** Ensure the codebase is highly configurable via environment variables and does not hardcode institute-specific logic (e.g., specific domains) directly into the source code unless it's a fallback.
4. **Comprehensive Documentation:** Maintain clear, concise, and up-to-date deployment guides (e.g., Docker, Vercel, traditional VPS) to support various hosting preferences.

## Consequences

- **Positive:** Increased adoption rate by other developers and colleges. Reduces maintenance overhead for developers helping newcomers. Provides a magical "it just works" experience out of the box.
- **Negative:** Requires strict discipline from contributors to avoid hardcoding specific constants. The first-time setup feature adds slight overhead to the application startup logic (e.g., checking if the setup is complete).
