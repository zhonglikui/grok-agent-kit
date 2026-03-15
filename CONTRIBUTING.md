# Contributing to grok-agent-kit

Thanks for helping improve `grok-agent-kit`.

## Scope

This repository is for the community toolkit around:

- the `grok-agent-kit` CLI
- the local stdio MCP server
- reusable client docs, examples, and skills

## Development setup

```bash
npm install
npm test
npm run build
npm run typecheck
```

Useful local commands:

```bash
node apps/cli/dist/bin.js --help
node apps/cli/dist/bin.js x-search --prompt "Latest xAI posts"
npm run pack:cli
```

## Pull request guidelines

- keep changes focused and minimal
- update docs and example configs when user-facing behavior changes
- avoid hard-coded local machine paths in committed docs or configs
- include verification output in the PR description when relevant
- prefer small, reviewable PRs over large mixed changes

## Commit and review expectations

- use clear commit messages
- explain any xAI API assumptions in the PR body
- note whether the change affects CLI, MCP, skills, docs, or release automation

## Reporting issues

Please use the GitHub issue templates for bugs and feature requests. For security-sensitive reports, follow `SECURITY.md` instead of opening a public issue.
