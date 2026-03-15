# grok-agent-kit Agent Instructions

These rules apply to the entire repository.

## Operating mode

- Work autonomously once the task is clear. Do not stop for step-by-step approval.
- Before choosing the next milestone or making a significant architecture or product-scope change, consult the local `gemini` CLI and use the result to inform the decision.
- When Codex and Gemini discuss a milestone, architecture choice, or implementation question, treat the conclusion as the decision for all remaining steps in that slice. Do not pause again for approval while implementing, documenting, verifying, committing, and pushing that slice.
- This applies to both already-planned work and newly discovered follow-up work inside the same slice: keep executing until the slice is fully delivered.
- If a `gemini` call fails, times out, or is interrupted, retry or fall back to the latest valid Gemini conclusion. Do not stop only because the consultation tool hiccupped.
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
- After that discussion, continue every remaining step automatically: implementation, documentation, verification, commit, push, and the next internally obvious follow-up inside the same slice.
- Do not stop merely to report progress. Progress reports are allowed, but execution should continue unless genuinely blocked.
