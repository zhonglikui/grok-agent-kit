# grok-agent-kit Doctor Auth Follow-up Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `doctor` so it also validates xAI management-key readiness.

**Architecture:** Reuse the new CLI auth-service from the previous slice and layer three new doctor checks on top of the existing diagnostic pipeline.

**Tech Stack:** TypeScript, Commander, Vitest

---

## Chunk 1: Red tests

### Task 1: Add failing doctor auth tests

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\test\doctor-auth.test.ts`

- [ ] **Step 1: Write failing tests for missing, valid, and invalid management-key scenarios**
- [ ] **Step 2: Run `npm test -- apps/cli/test/doctor-auth.test.ts` and verify failure**

## Chunk 2: Implementation

### Task 2: Add doctor auth checks

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\doctor.ts`

- [ ] **Step 1: Add management key and management base URL checks**
- [ ] **Step 2: Add management API connectivity validation**
- [ ] **Step 3: Re-run the targeted doctor auth tests until they pass**

## Chunk 3: Docs and verification

### Task 3: Update docs and verify

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`

- [ ] **Step 1: Document the new doctor checks**
- [ ] **Step 2: Run `npm test`**
- [ ] **Step 3: Run `npm run build`**
- [ ] **Step 4: Run `npm run typecheck`**
- [ ] **Step 5: Run `npm run pack:cli`**
- [ ] **Step 6: Commit and push the verified slice**
