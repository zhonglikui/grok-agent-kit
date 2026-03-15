# grok-agent-kit Agent Instructions

These rules apply to the entire repository.

## Operating mode

- Work autonomously once the task is clear. Do not stop for step-by-step approval.
- Before choosing the next milestone or making a significant architecture or product-scope change, consult the local `gemini` CLI and use the result to inform the decision.
- Only interrupt the user when blocked by missing secrets, destructive actions outside the repo, or a genuinely high-risk ambiguity.

## Delivery cycle

- Treat each independently useful feature slice as one delivery round.
- At the end of every delivery round, run:
  - `npm test`
  - `npm run build`
  - `npm run typecheck`
  - `npm run pack:cli`
- If verification passes, commit the work and push it to `origin/main`.
- If a feature branch is ever used, merge the verified work back to `main` and push `main`.

## Product constraints

- Keep the project local-first. Do not introduce any required self-hosted server dependency for the default product path.
- Primary authentication must work with `XAI_API_KEY`.
- Only consider browser-based auth when it works without a self-hosted backend. Do not make server-mediated OAuth the default path.
- Prefer direct integration with official xAI APIs over custom backend proxies.

## Documentation and assets

- Update English and Simplified Chinese user-facing docs together when behavior changes.
- Keep client examples, skill guidance, and package docs in sync with shipped behavior.
- Avoid hard-coded machine-specific local paths in public docs and examples.

## Current workflow preference

- Codex and Gemini should discuss milestone selection and major implementation direction first.
- After that discussion, continue implementation, verification, commit, and push without asking the user for per-step confirmation.
