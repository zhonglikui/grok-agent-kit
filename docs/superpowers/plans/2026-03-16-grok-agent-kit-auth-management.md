# grok-agent-kit Auth Management Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-first auth command and xAI management API support for validating and creating API keys without any required backend.

**Architecture:** Extend `packages/xai-client` with management endpoints, then expose them through a small CLI auth-service and a top-level `auth` command.

**Tech Stack:** TypeScript, Commander, Vitest, xAI management API

---

## Chunk 1: Red tests for auth flows

### Task 1: Add failing tests for management API support

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\xai-client\test\xai-client.test.ts`
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\test\auth.test.ts`

- [ ] **Step 1: Write failing tests for management key validation, key listing, and key creation**
- [ ] **Step 2: Run `npm test -- packages/xai-client/test/xai-client.test.ts` and verify failure**
- [ ] **Step 3: Run `npm test -- apps/cli/test/auth.test.ts` and verify failure**

## Chunk 2: Management API and CLI auth command

### Task 2: Implement the auth slice

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\packages\xai-client\src\types.ts`
- Modify: `D:\work\typescript\grok-agent-kit\packages\xai-client\src\xai-client.ts`
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\src\auth-service.ts`
- Create: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\auth.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\types.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\index.ts`

- [ ] **Step 1: Add management endpoints to the shared xAI client**
- [ ] **Step 2: Add the CLI auth-service wrapper**
- [ ] **Step 3: Add `auth status`, `auth validate-management`, `auth list-api-keys`, and `auth create-api-key`**
- [ ] **Step 4: Re-run the targeted auth tests until they pass**

## Chunk 3: Docs and verification

### Task 3: Document auth flows

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\.env.example`
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`

- [ ] **Step 1: Add management env vars**
- [ ] **Step 2: Document inference vs management auth**
- [ ] **Step 3: State clearly that browser auth is not in the shipped local path**

### Task 4: Run release verification

**Files:**
- Verify only

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: Commit and push the verified slice**
