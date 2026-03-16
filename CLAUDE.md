# grok-agent-kit Claude Instructions

These rules apply to the entire repository.

## Operating mode

- Work autonomously once the task is clear. Do not pause for per-step approval.
- Before selecting the next milestone or making a major architecture change, consult the local `gemini` CLI and use that recommendation when deciding what to implement next.
- Once Codex and Gemini reach a conclusion for a slice, execute every remaining step automatically without asking again: implementation, docs, verification, commit, and push.
- This same-slice autonomy includes newly discovered follow-up work: continue executing until the slice is fully delivered unless genuinely blocked.
- Do not treat a progress update or phase summary as a stopping point.
- If the `gemini` CLI fails or times out, retry or continue from the latest valid Gemini conclusion. Do not stop solely because the consultation step was interrupted.

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
