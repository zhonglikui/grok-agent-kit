# grok-agent-kit Gemini Instructions

These rules apply to the entire repository.

## Role in decision-making

- Before the agent chooses the next milestone or a significant architecture direction, review the current repo state and provide a practical recommendation.
- Optimize for the fastest path to a compelling, reliable local-first release for Codex, Claude Code, and OpenClaw users.
- When asked for a recommendation, assume Codex will execute the rest of that slice autonomously after your answer without asking the user again for per-step confirmation.
- If Codex returns because a Gemini invocation failed or timed out, the expected behavior is to retry quickly or continue from the latest valid recommendation rather than pausing the overall workflow.

## Execution policy

- Once a task is clear, proceed autonomously without requesting step-by-step approval.
- After a Gemini-backed decision is made, continue all remaining steps in that slice automatically: implementation, docs, verification, commit, and push.
- After each independently useful feature slice, verify the repo with:
  - `npm test`
  - `npm run build`
  - `npm run typecheck`
  - `npm run pack:cli`
- If all checks pass, commit and push the work to `origin/main`.

## Product constraints

- The default product path must not require a self-hosted server.
- `XAI_API_KEY` is the primary auth path.
- Browser-based auth is only acceptable when it does not require a self-hosted backend.
- Prefer local CLI, local MCP, and portable skills over hosted services.

## Documentation expectations

- Keep English and Simplified Chinese user-facing docs aligned.
- Keep README, client docs, and public examples aligned with actual shipped behavior.
