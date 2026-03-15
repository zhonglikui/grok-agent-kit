# grok-agent-kit Doctor Command Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a CLI `doctor` command for local environment diagnostics.

**Architecture:** Add a small CLI-only diagnostics module that reads process environment and local state paths without instantiating the xAI service.

**Tech Stack:** TypeScript, Node.js, Vitest, Commander

---

## Chunk 1: Doctor Tests

### Task 1: Add failing CLI tests for `doctor`

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\cli.test.ts`

- [ ] **Step 1: Add a failing test for missing `XAI_API_KEY`**
- [ ] **Step 2: Add a failing test for a healthy configuration**
- [ ] **Step 3: Run `npm test -- apps/cli/test/cli.test.ts` and verify failure**

## Chunk 2: Doctor Command

### Task 2: Implement the command and diagnostics

**Files:**
- Add: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\doctor.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\index.ts`

- [ ] **Step 1: Add the `doctor` command**
- [ ] **Step 2: Implement local env and state-path checks**
- [ ] **Step 3: Re-run `npm test -- apps/cli/test/cli.test.ts` until it passes**

## Chunk 3: Docs and Verification

### Task 3: Document `doctor`

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\README.md`

- [ ] **Step 1: Add `doctor` examples and describe what it checks**
- [ ] **Step 2: Keep English and Simplified Chinese docs aligned**

### Task 4: Run fresh verification commands

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified feature slice**
