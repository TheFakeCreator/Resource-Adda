# ADR 0003: Dynamic Markdown Pages for Static Content

## Context

Resource-Adda requires static pages like Privacy Policy, Terms of Service, and Contribution Guidelines. Hardcoding these into React components requires a developer to make a commit and redeploy the application every time a policy changes.

## Decision

We will use **Database-Driven Markdown Pages**.

- A `Page` schema is added to MongoDB.
- Super Admins are provided with a Live Markdown Editor in the dashboard (`/admin/pages`).
- The frontend dynamically fetches content from `/api/pages/:slug` and renders it securely using `react-markdown`.
- We support Github Flavored Markdown, syntax highlighting (`react-syntax-highlighter`), and LaTeX math equations (`remark-math` + `rehype-katex`).

## Consequences

### Positive

- Super Admins can update policies instantly without a code deployment.
- High degree of flexibility in formatting via robust Markdown support.
- Centralized management of non-functional requirements.

### Negative

- Slight performance hit because static pages now require an API fetch on load.
- Security requires sanitization (handled by `react-markdown`) to prevent XSS.
