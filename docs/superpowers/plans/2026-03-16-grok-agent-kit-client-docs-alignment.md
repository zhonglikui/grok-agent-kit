# grok-agent-kit Client Docs Alignment Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align client docs and skill guidance with the shipped interactive REPL and auth-management feature set.

**Architecture:** Add a lightweight docs alignment test, then update English and Simplified Chinese client docs plus skill guidance together.

**Tech Stack:** TypeScript, Vitest, Markdown

---

## Chunk 1: Red tests

### Task 1: Add failing docs alignment tests

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\test\client-docs.test.ts`

- [ ] **Step 1: Add a failing docs test for auth and interactive workflow coverage**
- [ ] **Step 2: Run `npm test -- apps/cli/test/client-docs.test.ts` and verify failure**

## Chunk 2: Docs and skills update

### Task 2: Align client docs and skills

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\codex.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\codex.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\claude-code.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\claude-code.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\openclaw.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\openclaw.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\skills\shared\grok-search-guidance.md`
- Modify: `D:\work\typescript\grok-agent-kit\skills\claude-code\SKILL.md`
- Modify: `D:\work\typescript\grok-agent-kit\skills\openclaw\SKILL.md`
- Modify: `D:\work\typescript\grok-agent-kit\skills\codex\README.md`

- [ ] **Step 1: Update auth notes and interactive CLI companion guidance**
- [ ] **Step 2: Update session/resetSession guidance for MCP workflows**
- [ ] **Step 3: Re-run the targeted docs alignment test until it passes**

## Chunk 3: Verification and release sync

### Task 3: Verify and push

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified slice**
