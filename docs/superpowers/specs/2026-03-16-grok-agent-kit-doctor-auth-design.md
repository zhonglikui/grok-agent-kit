# grok-agent-kit Doctor Auth Follow-up Design

**Date:** 2026-03-16  
**Project:** `grok-agent-kit`  
**Feature:** Add auth-awareness to `doctor`

## Goal

Make `grok-agent-kit doctor` the single obvious place to verify both inference auth and management auth readiness.

## Why this follow-up

The new `auth` command helps with management keys, but many users still start with `doctor`.

For a better local onboarding path, `doctor` should also report:

- whether the management key is configured
- whether the management base URL is valid
- whether the management key can actually reach the xAI management API

## Product behavior

Keep the existing inference checks, and add:

- `XAI_MANAGEMENT_API_KEY`
- `XAI_MANAGEMENT_BASE_URL`
- `xAI management API connectivity`

If the management key is missing, the connectivity check should warn and explain why it was skipped.

If the management key is configured, validate it through the management API and report pass/fail.

## Non-goals

- turning `doctor` into a full auth wizard
- automatically creating keys
- browser auth support

## Testing strategy

- add CLI tests for missing management key
- add CLI tests for successful management-key validation
- add CLI tests for failed management-key validation
