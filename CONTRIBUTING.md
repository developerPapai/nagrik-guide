# Contributing

## Legal content

Legal text lives in `src/content/*.json`. A reviewer can propose a change directly to the relevant JSON file without changing React components.

1. Keep claims short and plain-language.
2. Use only section numbers and case citations listed in `docs/PLAN.md` §7. Do not guess missing references.
3. Add `refs` for legal claims and leave `verify: true` until checked against an official source.
4. Keep a module at `ai_draft` until an advocate has reviewed its legal content. Record reviewer names and the verification date only after sign-off.
5. Hindi translations are drafts unless a Hindi-speaking legal reviewer has checked them. Missing translations intentionally fall back to English with an **English only** badge.
6. Never add external URLs, remote fonts, analytics, or network calls.

Run:

```text
npm run validate
npm run build
```

Use `npm run export:review` to prepare `REVIEW.md` for reviewer comments. Do not clear verification flags merely because the app builds.

## Code

Keep legal copy in JSON and UI labels in `src/i18n/`. Maintain the no-network CSP and the Android manifest's missing `INTERNET` permission. Do not add cloud storage, tracking, remote assets, or user accounts.
