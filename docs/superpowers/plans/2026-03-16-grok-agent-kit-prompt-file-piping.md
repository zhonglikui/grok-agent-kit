# grok-agent-kit Prompt File, STDIN, and Doctor Connectivity Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add prompt-from-file and STDIN workflows across CLI prompt commands, plus a live xAI connectivity check in `doctor`.

**Architecture:** Introduce a shared CLI input-resolution helper so `chat`, `x-search`, and `web-search` all resolve prompt text the same way. Extend `doctor` to call the existing service layer for a lightweight API ping only when local prerequisites are valid.

**Tech Stack:** TypeScript, Commander, Node.js fs/stdio APIs, Vitest

---

## Chunk 1: Prompt Input Resolution Tests

### Task 1: Add failing tests for file/stdin prompt resolution

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\test\prompt-input.test.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\cli.test.ts`

- [ ] **Step 1: Write failing helper tests for prompt file, stdin-only, prompt-plus-stdin, and invalid combinations**
- [ ] **Step 2: Write failing CLI integration tests proving resolved prompt text reaches the service and session history**
- [ ] **Step 3: Run targeted CLI prompt tests and verify failure**

## Chunk 2: Prompt Input Implementation

### Task 2: Implement shared input resolution and wire prompt commands

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\src\prompt-input.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\types.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\index.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\chat.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\x-search.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\web-search.ts`

- [ ] **Step 1: Add a shared helper for prompt-file and stdin resolution**
- [ ] **Step 2: Add `--prompt-file` to chat, x-search, and web-search plus `--system-file` to chat**
- [ ] **Step 3: Ensure sessions persist the fully resolved prompt text**
- [ ] **Step 4: Re-run targeted CLI prompt tests until they pass**

## Chunk 3: Doctor Connectivity

### Task 3: Add live API connectivity checks to doctor

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\doctor.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\cli.test.ts`

- [ ] **Step 1: Write failing doctor tests for pass, fail, and skipped connectivity cases**
- [ ] **Step 2: Run targeted doctor tests and verify failure**
- [ ] **Step 3: Implement a live xAI connectivity check through the existing service layer**
- [ ] **Step 4: Re-run targeted doctor tests until they pass**

## Chunk 4: Docs and Verification

### Task 4: Document shell-friendly input workflows and doctor ping behavior

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\README.md`

- [ ] **Step 1: Add prompt-file and stdin examples to English docs**
- [ ] **Step 2: Add matching Simplified Chinese docs**
- [ ] **Step 3: Mention the new doctor API connectivity check**

### Task 5: Run release verification

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified slice**
