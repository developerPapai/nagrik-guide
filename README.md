# Nagrik Guide

Nagrik Guide is an offline-first Android and web app with general legal information for people in India. It has English and Hindi UI, local search, situation guides, script cards, reference pages, personal notes, personal contacts, and a pre-event checklist.

This is a draft project. No legal module has been lawyer-reviewed. Check the visible review status and DRAFT notice in the app before relying on any content.

## Try the app

Requirements: Node.js 22.12 or newer and npm. Capacitor CLI requires Node.js 22 or newer.

```text
npm ci
npm run validate
npm run build
npm run dev
```

Open the local address printed by Vite. You can also use `npm run preview` after a build.

### Quick checks

1. On Home, open each of the five large situation buttons. Switch to Hindi and confirm English-only content gets an **English only** badge.
2. Open **What to say**, choose a script, and try **Show to officer**. The screen should be high contrast and very large.
3. Open **Settings**, set a PIN of at least six digits, then save a note or contact and tick a checklist item. Lock the app and unlock it again.
4. In Settings, press and hold **Clear all my data** for two seconds, then confirm. The app clears saved local data and caches.
5. For the PWA, serve the production build over a local or static HTTPS host, load it once, then use the browser's offline mode to check the cached app. It is not supported from a `file:` URL.

`npm run test:crypto` checks encryption/decryption and wrong-PIN rejection. `npm run lint` checks the source.
`npm run validate:offline` checks app-owned source for external URLs/direct network APIs and verifies the CSP and Android manifest.

## Offline and privacy design

- The app has no analytics, accounts, remote fonts, external images, or external API calls.
- Legal content is bundled from `src/content/*.json`; UI text is in `src/i18n/`.
- `connect-src 'none'` is set in the content security policy. The PWA precaches its built files and fonts.
- The Android manifest has no `INTERNET` permission, disables backups, and disallows cleartext traffic.
- Notes, personal contacts, and checklist state stay in IndexedDB. Without a PIN this data is stored locally without encryption. With a PIN, the vault uses PBKDF2-SHA256 (210,000 iterations) and AES-GCM; the key stays in memory and the app locks after 60 seconds in the background.
- A short PIN can be brute-forced if someone copies app storage. Device encryption and a strong device passcode are important.

## Build for Android

Install Android Studio with its supported JDK and Android SDK, then run:

```text
npm run android:sync
npx cap open android
```

In Android Studio, build and run on a device. The generated project is in `android/`. Confirm the final APK has no `android.permission.INTERNET` permission before sharing it. Keep any release keystore private and out of version control.

## Build the APK without Android Studio

The GitHub Actions workflow builds the APK on GitHub's runner, which provides the Android SDK and JDK. The `android/` project is generated during the workflow and does not need to be committed.

1. Push the repository, including `package-lock.json`, to GitHub.
2. Open the repository's **Actions** tab and select **Build Android APK**.
3. Choose **Run workflow** (or push to `main` to trigger it automatically) and wait for the run to finish.
4. Open the completed run and download the `nagrik-guide-apk` artifact. It includes the debug APK for testing.

The workflow checks that the APK does not request Android's `INTERNET` permission. For a signed release APK, configure the `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, and `KEY_ALIAS` repository secrets as described in `.github/workflows/build-apk.yml`. Never commit the signing keystore or its password.

## Editing content

- Module text and review fields: `src/content/modules/M01.json` through `M13.json`.
- Crosswalk references: `src/content/lawrefs.json`.
- Script cards, case cards, contacts, glossary, checklist, disclaimer, and About information are separate JSON files in `src/content/`.
- English is required. If Hindi is missing, the app displays the English text with an **English only** badge.
- Do not add legal section numbers or case citations unless they are present in `docs/PLAN.md` §7. Keep content in `ai_draft` until reviewed.
- Run `npm run validate` after edits. Warnings list modules with missing Hindi; errors fail the command.
- Run `npm run export:review` to generate `REVIEW.md` for legal review. Review every `verify: true` reference and case citation against official sources before release.

## Release status

All modules currently remain `ai_draft`; this project is not ready for wide public release. See `docs/PLAN.md` for review gates, official-source guidance, and the planned release checklist.

## Licences

The plan proposes MIT or Apache-2.0 for code and CC BY 4.0 for content. Choose the code licence and add the copyright holder before distributing a release.
