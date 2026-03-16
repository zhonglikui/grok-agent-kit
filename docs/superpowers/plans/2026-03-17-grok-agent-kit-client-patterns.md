# grok-agent-kit Client Patterns Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pattern-based MCP and skill documentation for major clients, plus first-class `Gemini CLI` client generation.

**Architecture:** Keep runtime changes small by extending the existing client generator for command-managed CLI clients, then shift the broader surface area into grouped bilingual docs organized by MCP and skill pattern.

**Tech Stack:** TypeScript, Vitest, Markdown

---

## Chunk 1: Red tests

### Task 1: Expand client and docs tests

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\clients-command.test.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\client-docs.test.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\client-examples.test.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\skill-docs.test.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\test\package-readme.test.ts`

- [ ] **Step 1: Add a failing generator test for `gemini-cli`**
- [ ] **Step 2: Add failing doc tests for grouped MCP and skill guides**
- [ ] **Step 3: Add a failing example test for the Gemini command artifact**
- [ ] **Step 4: Run the targeted Vitest files and verify failure**

## Chunk 2: Generator and assets

### Task 2: Add `Gemini CLI` generator output

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\client-config.ts`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\src\commands\clients.ts`
- Create: `D:\work\typescript\grok-agent-kit\examples\clients\gemini-cli-command.txt`
- Create: `D:\work\typescript\grok-agent-kit\skills\gemini-cli\SKILL.md`

- [ ] **Step 1: Add `gemini-cli` to the supported client list**
- [ ] **Step 2: Render published and local command snippets for `gemini mcp add`**
- [ ] **Step 3: Add the checked-in generated example file**
- [ ] **Step 4: Add Gemini-specific skill guidance**
- [ ] **Step 5: Re-run the targeted tests until they pass**

## Chunk 3: Bilingual grouped docs

### Task 3: Add grouped MCP and skill guides

**Files:**
- Modify: `D:\work\typescript\grok-agent-kit\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\README.zh-CN.md`
- Modify: `D:\work\typescript\grok-agent-kit\apps\cli\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.md`
- Modify: `D:\work\typescript\grok-agent-kit\docs\clients\README.zh-CN.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\gemini-cli.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\gemini-cli.zh-CN.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\mcp-command-clients.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\mcp-command-clients.zh-CN.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\mcp-json-clients.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\mcp-json-clients.zh-CN.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\mcp-gui-clients.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\mcp-gui-clients.zh-CN.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\skills-skill-md-clients.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\skills-skill-md-clients.zh-CN.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\skills-command-clients.md`
- Create: `D:\work\typescript\grok-agent-kit\docs\clients\skills-command-clients.zh-CN.md`

- [ ] **Step 1: Update the top-level docs index and README links**
- [ ] **Step 2: Add the new English grouped guides**
- [ ] **Step 3: Add the matching Simplified Chinese guides**
- [ ] **Step 4: Re-run the targeted docs tests until they pass**

## Chunk 4: Verification and release readiness

### Task 4: Verify, version, and prepare release

**Files:**
- Verify only unless version bump is warranted after review

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npm run pack:cli`**
- [ ] **Step 5: If everything passes, decide whether this slice is sufficient for the next npm release and then commit / push**
