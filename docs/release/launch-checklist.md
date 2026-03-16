# grok-agent-kit v0 Launch Checklist

Use this checklist when preparing a community-facing release.

## Preflight

- Confirm the working tree is clean and `main` is up to date.
- Update user-facing docs in both `README.md` and `README.zh-CN.md`.
- Re-check client setup docs under `docs/clients/` and `docs/clients/*.zh-CN.md`.
- Make sure package metadata in `apps/cli/package.json` still matches the public repo.

## Verification

Run the required release verification commands:

```bash
npm test
npm run build
npm run typecheck
npm run pack:cli
npm run smoke:pack-install
```

- Confirm the tarball can be executed through `npx` and through an installed package.
- Confirm the packed CLI README still explains both `npx` usage and `npm install -g grok-agent-kit`.

## Publish

- Confirm the npm account has permission to publish `grok-agent-kit`.
- Verify the `NPM_TOKEN` repository secret before using `.github/workflows/publish.yml`.
- Run `npm publish --workspace apps/cli --access public --dry-run` locally if you want one final manual check.
- Trigger the GitHub Actions publish workflow for the real release after verification is clean.

## Post-publish

- Test `npx -y grok-agent-kit doctor`.
- Test `npm install -g grok-agent-kit` on at least one clean machine or shell profile.
- Update release notes and community posts with the final npm version.
- Keep English and Simplified Chinese launch notes aligned.

## Files to double-check

- `README.md`
- `README.zh-CN.md`
- `apps/cli/README.md`
- `docs/clients/README.md`
- `docs/clients/README.zh-CN.md`
- `.github/workflows/ci.yml`
- `.github/workflows/publish.yml`
