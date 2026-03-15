# grok-agent-kit Claude Instructions

These rules apply to the entire repository.

## Operating mode

- Work autonomously once the task is clear. Do not pause for per-step approval.
- Before selecting the next milestone or making a major architecture change, consult the local `gemini` CLI and use that recommendation when deciding what to implement next.

## Verification and push policy

- Each independently useful feature slice is one delivery round.
- At the end of each round, run:
  - `npm test`
  - `npm run build`
  - `npm run typecheck`
  - `npm run pack:cli`
- If those checks pass, commit the work and push it to `origin/main`.

## Product constraints

- Keep the project local-first.
- Do not make a self-hosted server mandatory for the default user path.
- `XAI_API_KEY` must remain the primary authentication mechanism.
- Only consider browser-based auth when it can work without a self-hosted backend.

## Documentation

- Update English and Simplified Chinese user-facing docs together.
- Keep client examples, skills, and package documentation in sync with shipped functionality.
