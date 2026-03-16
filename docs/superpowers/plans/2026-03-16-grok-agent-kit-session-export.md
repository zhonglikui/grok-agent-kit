# grok-agent-kit Session Export and Metadata Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add richer session metadata plus Markdown/JSON export for saved local sessions.

**Architecture:** Extend the xAI/core result types with a normalized usage object, persist that metadata in the CLI session store, and layer presentation helpers on top for `sessions show` and `sessions export`. Keep persistence backward-compatible so older `sessions.json` files still load without migration.

**Tech Stack:** TypeScript, Commander, Vitest, Node.js fs/path APIs

---

## Chunk 1: Core Metadata Mapping

### Task 1: Add usage typing and mapping from xAI responses

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\xai-client\src\types.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\core\src\types.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\core\src\grok-service.ts`
- Test: `D:\work\typescript\grok-agent-kit\packages\core\test\grok-service.test.ts`

- [ ] **Step 1: Write failing tests for usage metadata mapping in `packages/core/test/grok-service.test.ts`**
- [ ] **Step 2: Run `npm test -- packages/core/test/grok-service.test.ts` and verify failure**
- [ ] **Step 3: Add normalized xAI usage types and map them onto `GrokTextResult`**
- [ ] **Step 4: Re-run `npm test -- packages/core/test/grok-service.test.ts` until it passes**

## Chunk 2: Session Persistence and CLI Behavior

### Task 2: Persist richer history metadata and add export support

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\session-store.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\chat.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\x-search.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\web-search.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\sessions.ts`
- Test: `D:\work\typescript\grok-agent-kit\apps\cli\test\session-store.test.ts`
- Test: `D:\work\typescript\grok-agent-kit\apps\cli\test\cli.test.ts`

- [ ] **Step 1: Write failing session-store tests for metadata normalization**
- [ ] **Step 2: Write failing CLI tests for session metadata persistence, `sessions show`, and `sessions export`**
- [ ] **Step 3: Run targeted CLI/session tests and verify failure**
- [ ] **Step 4: Extend session history types with `model`, `citations`, and `usage`**
- [ ] **Step 5: Add reusable session summary/export helpers inside the CLI session command module (or a focused helper file if it becomes crowded)**
- [ ] **Step 6: Implement `sessions export <name> --format markdown|json [--output <path>]`**
- [ ] **Step 7: Re-run targeted CLI/session tests until they pass**

## Chunk 3: Docs and Verification

### Task 3: Document export workflows and metadata fields

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`

- [ ] **Step 1: Add examples for `sessions export` in English docs**
- [ ] **Step 2: Add matching Simplified Chinese docs for export and richer session metadata**

### Task 4: Run release verification

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified slice**
