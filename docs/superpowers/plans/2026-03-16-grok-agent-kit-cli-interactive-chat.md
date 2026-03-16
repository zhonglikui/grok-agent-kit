# grok-agent-kit CLI Interactive Chat Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive REPL mode to `grok-agent-kit chat` with streaming output, slash commands, persistent terminal history, and named-session continuation.

**Architecture:** Introduce a reusable chat-turn helper plus an injected interactive-console abstraction, then layer a Node readline-based REPL on top while reusing the existing local session store and image replay behavior.

**Tech Stack:** TypeScript, Commander, Node.js readline/fs APIs, Vitest

---

## Chunk 1: Red tests for interactive mode

### Task 1: Add failing tests for the REPL flow

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\test\interactive-chat.test.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\types.ts` (only if required for test doubles)

- [ ] **Step 1: Write a failing test for `chat --interactive` multi-turn behavior**
- [ ] **Step 2: Write a failing test for `--session` resume and persistence**
- [ ] **Step 3: Write a failing test for prompt-history load and append**
- [ ] **Step 4: Write a failing test for `/image`, `/reset`, and `/exit`**
- [ ] **Step 5: Run `npm test -- apps/cli/test/interactive-chat.test.ts` and verify failure**

## Chunk 2: Interactive runtime and shared chat-turn helper

### Task 2: Implement the interactive console flow

**Files:**
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\src\interactive-chat.ts`
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\src\repl-history.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\chat.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\types.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\index.ts`

- [ ] **Step 1: Add the interactive-console and history-store abstractions**
- [ ] **Step 2: Refactor one-shot chat turn execution into reusable logic**
- [ ] **Step 3: Implement `--interactive` with slash commands and streaming**
- [ ] **Step 4: Re-run `npm test -- apps/cli/test/interactive-chat.test.ts` until it passes**

## Chunk 3: Docs and verification

### Task 3: Document interactive chat mode

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`

- [ ] **Step 1: Add English examples for `chat --interactive`**
- [ ] **Step 2: Add matching Simplified Chinese docs**
- [ ] **Step 3: Document `/image`, `/reset`, and `/exit`**

### Task 4: Run release verification

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified slice**
