# grok-agent-kit Community Release Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `grok-agent-kit` genuinely publishable to npm, easier to contribute to on GitHub, and easier to adopt with English and Simplified Chinese documentation.

**Architecture:** Keep the repo as a TypeScript monorepo, but treat `apps/cli` as the only public runtime package for `v1`. Bundle the CLI so published installs do not depend on unpublished internal workspace packages, then layer community files and bilingual docs around that package surface.

**Tech Stack:** TypeScript, Node.js, npm workspaces, tsup, GitHub Actions, Markdown

---

## Chunk 1: Publishable CLI Packaging

### Task 1: Replace workspace-only runtime packaging with a distributable CLI bundle

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\package.json`
- Modify: `D:\work\typescript\grok-agent-kit\package.json`
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\tsup.config.ts`
- Modify: `D:\work\typescript\grok-agent-kit\.gitignore`

- [ ] **Step 1: Add package metadata for npm publication**
- [ ] **Step 2: Add a bundling build so `grok-agent-kit` can run without unpublished local packages**
- [ ] **Step 3: Add pack-related scripts at the workspace root**
- [ ] **Step 4: Verify `npm pack --workspace apps/cli --json` succeeds and inspect the tarball contents**

### Task 2: Add a packaging smoke check

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\test\package-metadata.test.ts`

- [ ] **Step 1: Write a failing test that asserts published metadata and binary entry expectations**
- [ ] **Step 2: Run `npm test -- apps/cli/test/package-metadata.test.ts` and verify failure**
- [ ] **Step 3: Update package metadata and build scripts minimally until the test passes**
- [ ] **Step 4: Re-run the targeted test to confirm green**

## Chunk 2: Community Health and Release Automation

### Task 3: Add GitHub community-management files

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\.github\ISSUE_TEMPLATE\bug_report.yml`
- Create: `D:\work\typescript\grok-agent-kit\.github\ISSUE_TEMPLATE\feature_request.yml`
- Create: `D:\work\typescript\grok-agent-kit\.github\ISSUE_TEMPLATE\config.yml`
- Create: `D:\work\typescript\grok-agent-kit\.github\pull_request_template.md`
- Create: `D:\work\typescript\grok-agent-kit\.github\CODEOWNERS`
- Create: `D:\work\typescript\grok-agent-kit\CONTRIBUTING.md`
- Create: `D:\work\typescript\grok-agent-kit\SECURITY.md`
- Create: `D:\work\typescript\grok-agent-kit\CODE_OF_CONDUCT.md`

- [ ] **Step 1: Add contributor and security expectations suited to an OSS toolkit**
- [ ] **Step 2: Add issue and PR templates that fit CLI + MCP bug reports**
- [ ] **Step 3: Add ownership metadata for GitHub review routing**
- [ ] **Step 4: Verify all linked file paths and referenced commands exist**

### Task 4: Add release automation

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\.github\workflows\publish.yml`
- Modify: `D:\work\typescript\grok-agent-kit\README.md`

- [ ] **Step 1: Add a manual npm publish workflow for the public CLI package**
- [ ] **Step 2: Document required repository secrets and release steps**
- [ ] **Step 3: Verify workflow syntax reads cleanly and matches the package path**

## Chunk 3: Bilingual User-Facing Docs

### Task 5: Add Simplified Chinese documentation counterparts

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\README.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\README.zh-CN.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\codex.zh-CN.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\claude-code.zh-CN.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\openclaw.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\codex.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\claude-code.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\openclaw.md`

- [ ] **Step 1: Add language switch links and a docs index**
- [ ] **Step 2: Translate user-facing setup docs into Simplified Chinese**
- [ ] **Step 3: Keep command examples and environment variable names identical across languages**
- [ ] **Step 4: Verify every English doc links to its Chinese counterpart and back**

## Chunk 4: Verification and Repository Sync

### Task 6: Run fresh verification commands

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli` or equivalent package smoke check**
- [ ] **Step 5: Inspect `git status --short` and push the finished work**
