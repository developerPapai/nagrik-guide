# Nagrik Guide — Offline Rights App for Protestors in India
## Complete Build Plan (v0.1) — "Build it in one day with AI"

> **Working title:** Nagrik Guide (placeholder; pick a neutral name, see §6)
> **Plan drafted:** 2026-10-09
> **Deliverables today:** (1) Android APK (works with zero internet) and (2) a PWA version of the same code.
> **Status of all legal text in this document:** `ai_draft` — NOT reviewed by a lawyer. Every section number, citation and phone number must be verified against official sources (§15) before the app is shared widely.
> This app gives general legal information. It is not legal advice.

---

## 0. Read this first

### 0.1 How to use this file
1. Save this file as `docs/PLAN.md` in an empty project folder.
2. Open the folder in an AI coding tool (Claude Code, Cursor, Windsurf, etc.).
3. Paste the **Master Prompt** (§9.1), then run the **phase prompts** (§9.3) one at a time, in order.
4. Section 7 is the **content pack** (law, scripts, checklists). The AI converts it into JSON files; you and lawyers can edit the JSON later without touching code.

### 0.2 What is realistic today
| Can be finished today | Cannot be finished today |
|---|---|
| Full app: screens, bilingual UI (English + Hindi), search, encrypted notes/contacts, PIN, PWA, signed APK | Lawyer review of every legal statement |
| Draft legal content for ~13 modules, 14 script cards, 15+ case cards, glossary, checklists | Regional-language translations beyond a first Hindi draft |
| Offline testing on a real phone | Play Store approval (takes days) |

### 0.3 The release gate (important)
Wrong legal information given to a stressed person can lead to harm. Therefore:
- Every module carries a **review status**: `ai_draft` → `in_review` → `lawyer_reviewed`.
- The app **shows a visible DRAFT banner** on every module that is not `lawyer_reviewed`, and shows "drafted on / last verified" dates.
- **Today:** release only as `v0.1-beta` to a small trusted group + reviewers. Send the review export (§12) to 2–3 advocates/organisations **today**.
- **Wide public release:** only after at least the core modules (M01–M06) are `lawyer_reviewed`.

### 0.4 Principles (non-negotiable)
1. **Offline-first, zero network.** No analytics, no accounts, no cloud, no remote fonts/images, no `INTERNET` permission in the APK.
2. **Privacy.** Phones get seized. Store as little as possible; encrypt what is stored; one-tap wipe.
3. **Lawful conduct.** The app teaches people to **comply physically and assert rights verbally**. It never advises resisting, evading, or disobeying lawful orders, never encourages violence, and never helps conceal evidence.
4. **Plain language.** Reading level ≈ class 8. Short sentences. Every legal claim has a reference.
5. **Honest about uncertainty.** Gray areas are labelled as gray areas. Do not overpromise.
6. **Content ≠ code.** All legal text lives in JSON under `src/content/` so reviewers can change it.
7. **Fast in a crisis.** Any critical information within 3 taps. Big buttons, high contrast, works one-handed on a cheap phone.

### 0.5 Non-goals (v0.1)
Chat/messaging, maps, cloud sync, live lawyer matching, user accounts, push notifications, instructions for evading police or destroying evidence, commentary on any government/party.

---

## 1. Product definition

**Primary user:** an ordinary person at a protest in India, possibly with low data literacy, possibly with a cheap Android phone, possibly in a place where the internet has been shut down.

**Core situations (the app's backbone):**
| ID | Situation | User's question |
|---|---|---|
| `stopped` | Stopped / questioned, not arrested | "Do I have to answer? Can I leave?" |
| `detained` | Mass detention / being taken in a bus | "What can they do? How long?" |
| `arrested` | Being arrested | "What must they tell/give me?" |
| `custody` | At the police station | "What are my rights here?" |
| `court` | Going before a magistrate / bail | "What do I say? How do I get a lawyer/bail?" |

**Secondary:** protest rights & limits, internet shutdown, phone seizure, women/children/special groups, custodial violence, preventive/special laws, constitutional emergency, pre-protest checklist, incident notes, glossary, case summaries, emergency contacts.

**Success criteria (Definition of Done for v0.1):**
- [ ] APK installs on a real Android phone; all screens work in airplane mode.
- [ ] `aapt dump permissions` shows **no** `INTERNET` permission.
- [ ] Zero network requests (verified in DevTools for the PWA).
- [ ] From Home, each of the 5 situations reaches its guidance in ≤ 2 taps; any script card in ≤ 3 taps.
- [ ] English and Hindi UI; unreviewed content shows a DRAFT banner.
- [ ] PIN + encrypted notes/contacts; "Clear all data" works.
- [ ] `npm run validate` passes (content schema + refs).

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| UI | React 18 + TypeScript + Vite | Fast to build with AI; one codebase for PWA + Android |
| Routing | `react-router-dom` with **HashRouter** | Works from local files / WebView without server rewrites |
| Styling | Plain CSS with CSS variables (no Tailwind) | No build config risk; easy high-contrast/dark mode |
| Search | `fuse.js` | Fully local fuzzy search; works with Unicode (Hindi) |
| Storage | `idb-keyval` (IndexedDB) | Simple, async |
| Crypto | Web Crypto API (PBKDF2 → AES-GCM) | Built in; no extra libs |
| PWA | `vite-plugin-pwa` (Workbox precache) | Offline after first load; iOS fallback |
| Android | Capacitor (latest stable) + `@capacitor/app` | Wraps the same `dist/` into an APK |
| Fonts | `@fontsource/noto-sans-devanagari` (bundled) | Hindi renders correctly with no CDN |

**Do NOT add:** analytics, Firebase, Sentry, Google Fonts/CDN, remote images, any `fetch()` to an external host, ads, crash reporters.

**Prerequisites on your computer:** Node.js 20+, Git, Android Studio (latest, includes JDK + SDK), an Android phone + USB cable (developer mode on).

---

## 3. Project structure

```
nagrik-guide/
├─ docs/PLAN.md                    # this file
├─ package.json
├─ vite.config.ts
├─ capacitor.config.ts
├─ index.html                      # contains CSP meta tag (§6)
├─ public/icons/                   # app icons (neutral)
├─ scripts/
│  ├─ validate-content.ts          # schema + reference checks (fails build)
│  └─ export-review.ts             # builds REVIEW.md for lawyers (§12)
├─ src/
│  ├─ main.tsx  App.tsx  styles.css
│  ├─ i18n/ {en.json, hi.json, useI18n.ts}
│  ├─ content/
│  │  ├─ meta.json                 # content_version, drafted_on
│  │  ├─ lawrefs.json              # crosswalk table (§7.1)
│  │  ├─ modules/*.json            # M01…M13 (§7.2)
│  │  ├─ scripts.json              # script cards (§7.3)
│  │  ├─ cases.json                # (§7.4)
│  │  ├─ contacts.json             # (§7.5)
│  │  ├─ glossary.json             # (§7.6)
│  │  └─ checklists.json           # (§7.7)
│  ├─ components/ {BigButton, Banner, LangToggle, SearchBar, LawRef, ScriptCard,
│  │               ShowToOfficer, StepList, ReviewBadge, QuickExit, Checklist}.tsx
│  ├─ screens/ {Home, Situation, Module, Scripts, Library, Cases, Glossary,
│  │            Contacts, Notes, NoteEdit, Checklist, Shutdown, Settings,
│  │            About, Lock}.tsx
│  └─ lib/ {content.ts, search.ts, crypto.ts, storage.ts, lock.ts, panic.ts}
└─ android/                        # generated by Capacitor
```

---

## 4. Data schemas (TypeScript)

```ts
type Lang = 'en' | 'hi';
type L10n = { en: string; hi?: string };          // missing hi => fall back to en + "English only" badge
type ReviewStatus = 'ai_draft' | 'in_review' | 'lawyer_reviewed';

interface LawRef {
  id: string;                                      // e.g. "bnss-35"
  kind: 'constitution' | 'statute' | 'case' | 'guideline';
  label: L10n;                                     // "Arrest without warrant"
  current?: string;                                // "BNSS s.35"
  old?: string;                                    // "CrPC s.41"
  note?: L10n;
  verify: boolean;                                 // true until a human checks it
}

interface Step {
  type: 'do' | 'dont' | 'say' | 'know' | 'next';
  text: L10n;
  refs?: string[];                                 // LawRef ids
  scriptId?: string;                               // for type 'say'
}

interface Module {
  id: string;                                      // "M04"
  group: 'situation' | 'protest' | 'special' | 'reference';
  situationId?: 'stopped'|'detained'|'arrested'|'custody'|'court';
  icon: string;                                    // emoji or inline SVG key
  title: L10n;
  summary: L10n;
  steps: Step[];
  grayAreas?: L10n[];                              // always rendered in a highlighted box
  related?: string[];
  tags: string[];                                  // include Hinglish: "giraftari","zamanat","vakeel","thana"
  status: ReviewStatus;
  draftedOn: string;                               // ISO date
  lastVerified: string | null;                     // null until a human verifies
  reviewers?: string[];
}

interface Script {
  id: string;                                      // "S01"
  situations: string[];
  en: string; hi: string; hiRoman: string;         // Roman Hindi for those who can't read Devanagari
  when: L10n;                                      // when to say it
  warning?: L10n;                                  // e.g. "Do not resist physically"
}

interface Contact { id: string; kind: 'emergency'|'legal_aid'|'helpline'; label: L10n; number: string; note?: L10n; verifiedOn: string|null }
interface CaseCard { id: string; name: string; citation?: string; year: number; holding: L10n; whyItMatters: L10n; refs?: string[]; verifyCitation: true }
interface GlossaryTerm { id: string; term: L10n; meaning: L10n; tags: string[] }

// Stored ENCRYPTED on device only
interface UserContact { id: string; name: string; phone: string; role: 'family'|'lawyer'|'friend'|'organisation'|'other'; note?: string }
interface IncidentNote {
  id: string; createdAt: string; place?: string;
  officers: { name?: string; badge?: string; station?: string; vehicle?: string }[];
  whatHappened: string; injuries?: string; sectionsMentioned?: string; witnesses?: string;
  timeline: { time: string; text: string }[];
}
```

### 4.1 `validate-content` rules (build fails if any is violated)
- Every `refs[]` id exists in `lawrefs.json`; every `scriptId` exists in `scripts.json`.
- Every module has `en`; list modules missing `hi` as warnings.
- `status`, `draftedOn`, `tags` present; `lastVerified` may be `null` only if status ≠ `lawyer_reviewed`.
- No URL starting with `http` anywhere in content (offline-only; sources are listed as plain text).
- Each `LawRef` with `verify: true` is counted and printed (so you see the review workload).

---

## 5. Screens and UX spec

### 5.1 Routes
| Route | Screen | Key elements |
|---|---|---|
| `/` | Home | See §5.2 |
| `/s/:situationId` | Situation | Tabs: **Do now · Say · Know your rights**; link to related modules |
| `/m/:id` | Module | Title, review badge, steps grouped by type, gray-area box, law refs (collapsible) |
| `/scripts` | Scripts | List grouped by situation; tap → full card |
| `/scripts/:id` | Script card | English + Hindi + Roman Hindi; **"Show to officer"** full-screen mode |
| `/library` | Library | Search bar + groups (Situations / Protest / Special / Reference) |
| `/cases`, `/glossary` | Reference | Searchable lists |
| `/contacts` | Contacts | National numbers (tap to dial) + "My contacts" (encrypted) |
| `/notes`, `/notes/new` | Incident notes | Encrypted list/editor, template from §7.8 |
| `/checklist` | Pre-protest checklist | Tick boxes saved locally (encrypted) |
| `/shutdown` | Internet shutdown | Module M08 |
| `/settings` | Settings | Language, text size, theme, PIN, clear data, about |
| `/about` | About | Disclaimer, sources, review-status table, content version, licences, honest limits |
| `/lock` | Lock | PIN entry (only if PIN enabled) |

### 5.2 Home layout (top to bottom)
1. Top bar: language toggle **EN | हि**, lock icon, **Quick exit** (always visible on every screen).
2. DRAFT banner (if any module is not reviewed) + one-line disclaimer.
3. Five giant buttons (full width, ≥ 72 px tall, icon + label):
   - "I am being stopped or questioned"
   - "I am being detained or arrested"
   - "I am at the police station"
   - "Going before a magistrate / bail"
   - "Protest rights" (M07)
4. Row of 4 medium buttons: **What to say** · **Call for help** · **My notes** · **Search**
5. Footer links: Internet shutdown · Pre-protest checklist · Cases · Glossary · About

### 5.3 UX rules
- Tap targets ≥ 48 dp; base font 18 px; **A− / A+** text-size control; default light theme with a high-contrast dark option.
- No animations beyond simple page changes; no infinite scroll; no popups except destructive confirmations.
- Law references collapsed by default ("Legal basis ▾") so the main text stays short.
- **Show to officer mode:** full-screen, maximum font size, white-on-black or black-on-white, language switch (EN/हि), screen kept awake. For people who cannot speak or are being shouted at.
- Every module footer: "Drafted {date} · Last verified {date or 'not yet'} · {status badge}" and "General information, not legal advice."
- Quick exit: on Android calls `App.minimizeApp()`; on PWA navigates to `about:blank`. Does not delete data.

---

## 6. Security and privacy specification

### 6.1 Network
- **Android manifest:** remove `<uses-permission android:name="android.permission.INTERNET" />` from `android/app/src/main/AndroidManifest.xml`; set `android:allowBackup="false"` and `android:usesCleartextTraffic="false"`.
- **CSP** in `index.html`:
  ```html
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
                 img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'">
  ```
- Verify after build: `aapt2 dump permissions app-release.apk` lists no internet permission (if the app fails to load without it, fix the cause — do not silently re-add it).

### 6.2 Local data (only notes, "My contacts", checklist ticks, settings)
- PIN (min **6 digits**) → PBKDF2-SHA256 (≥ 210,000 iterations, random 16-byte salt) → AES-GCM 256 key. Random 12-byte IV per record. Store `{salt, iv, ciphertext}` in IndexedDB. The key lives **in memory only**; lock on app background after 60 s.
- No PIN set = data stored but not encrypted; Settings shows a clear warning and nudges the user to set one.
- Failed PIN attempts: increasing delays (5 → 30 → 120 s). Optional toggle (default OFF): "Erase all data after 10 wrong PINs".
- **Clear all my data:** long-press (2 s) + confirm → wipes IndexedDB, localStorage, Cache Storage, unregisters service worker, returns to Home.
- Be honest in About: a short PIN can be brute-forced if someone copies the app's storage; Android's own device encryption and a strong phone passcode matter more.

### 6.3 Neutral appearance
Set `appName` and icon in `capacitor.config.ts`/`android/app/src/main/res` to something neutral (e.g., "Nagrik Guide" or "Citizen Notes"). Avoid words like "protest" or "arrest" in the launcher name.

### 6.4 Supply chain & trust
Open-source the code (MIT or Apache-2.0) and content (CC BY 4.0). Pin dependencies (`npm ci`), publish the APK's SHA-256 on the release page, never commit the signing keystore.

---

## 7. CONTENT PACK (AI converts this to JSON)

### 7.0 Writing rules for the AI
- Plain English, short sentences, active voice. Hindi: simple Hindi, with the English legal term in brackets the first time (e.g., "ज़मानत (bail)").
- Every legal claim gets `refs[]`. **Do not invent section numbers or citations.** If unsure, set `verify: true` and add "verify" in the note.
- Always show **current and old** numbers: BNSS (replaced CrPC on 1 July 2024), BNS (replaced IPC), BSA (replaced Evidence Act).
- Tone: calm, respectful, non-inciting. Teach: **comply physically, assert rights verbally**.
- Mark gray areas explicitly. Never promise outcomes ("police must" only where the law says so; otherwise "you can ask").
- All content starts as `status: "ai_draft"`, `draftedOn: "2026-10-09"`, `lastVerified: null`.

### 7.1 Law crosswalk (seed for `lawrefs.json`) — ALL rows `verify: true`

| id | Topic | Current | Old |
|---|---|---|---|
| `const-19` | Free speech; assemble peaceably & unarmed; restrictions | Constitution Art. 19(1)(a),(b); 19(2),(3) | — |
| `const-20-3` | No compelled self-incrimination | Art. 20(3) | — |
| `const-21` | Life & liberty only by procedure established by law | Art. 21 | — |
| `const-22` | Grounds of arrest; lawyer of choice; 24-hour production | Art. 22(1),(2) | — |
| `const-22-3to7` | Preventive detention safeguards (different rules) | Art. 22(3)–(7) | — |
| `const-32-226` | Writs incl. habeas corpus (Supreme Court / High Courts) | Art. 32, 226 | — |
| `const-39a` | Free legal aid | Art. 39A | — |
| `const-358-359` | National Emergency and fundamental rights | Art. 358, 359 (as amended 1978) | — |
| `bnss-35` | Arrest without warrant; notice of appearance; elderly/infirm | BNSS s.35 (incl. 35(3)–(6), 35(7)) | CrPC s.41, 41A |
| `bnss-36` | Procedure on arrest: name tag, arrest memo, inform relative | BNSS s.36, 37 | CrPC s.41B, 41C |
| `bnss-38` | Meet lawyer during interrogation (not throughout) | BNSS s.38 | CrPC s.41D |
| `bnss-39` | Must give name and address when asked | BNSS s.39 | CrPC s.42 |
| `bnss-43` | How arrest is made; women: no arrest after sunset/before sunrise except with Magistrate's prior written permission | BNSS s.43 (esp. 43(5)) | CrPC s.46 |
| `bnss-46` | No more restraint than necessary | BNSS s.46 | CrPC s.49 |
| `bnss-47` | Grounds of arrest; right to bail in bailable offence | BNSS s.47 | CrPC s.50 |
| `bnss-48` | Police must inform nominated person | BNSS s.48 | CrPC s.50A |
| `bnss-49` | Search of arrested person (women by women) | BNSS s.49 | CrPC s.51 |
| `bnss-53` | Medical examination at arrested person's request | BNSS s.53 | CrPC s.54 |
| `bnss-58` | Not detained beyond 24 hours | BNSS s.58 | CrPC s.57 |
| `bnss-148-150` | Dispersal of unlawful assembly; use of force/armed forces | BNSS s.148–150 | CrPC s.129–131 |
| `bnss-163` | Prohibitory orders (urgent nuisance/danger) | BNSS s.163 | CrPC s.144 |
| `bnss-170` | Preventive arrest; max 24 hours unless authorised otherwise | BNSS s.170 | CrPC s.151 |
| `bnss-173` | FIR / Zero FIR | BNSS s.173 | CrPC s.154 |
| `bnss-179` | Police can't require women, children, elderly, disabled to come to the station as witnesses | BNSS s.179 | CrPC s.160 |
| `bnss-180` | Questioning; need not answer self-incriminating questions | BNSS s.180 | CrPC s.161 |
| `bnss-181` | Police statement need not be signed | BNSS s.181 | CrPC s.162 |
| `bnss-183` | Statements/confessions before a Magistrate | BNSS s.183 | CrPC s.164 |
| `bnss-187` | Remand; police/judicial custody; default bail | BNSS s.187 | CrPC s.167 |
| `bnss-478` | Bail in bailable offences (personal bond if unable to give surety) | BNSS s.478 | CrPC s.436 |
| `bnss-479` | Max time as undertrial | BNSS s.479 | CrPC s.436A |
| `bnss-480` | Bail in non-bailable offences | BNSS s.480 | CrPC s.437 |
| `bnss-482` | Anticipatory bail | BNSS s.482 | CrPC s.438 |
| `bnss-94` | Order/summons to produce documents/things (incl. electronic) | BNSS s.94 | CrPC s.91 |
| `bnss-106` | Police seizure of property; report to Magistrate | BNSS s.106 | CrPC s.102 |
| `bns-189` | Unlawful assembly (5+ persons, common unlawful object) | BNS s.189 | IPC s.141–143 |
| `bns-190` | Every member liable for offence in pursuit of common object | BNS s.190 | IPC s.149 |
| `bns-191` | Rioting | BNS s.191 | IPC s.146–148 |
| `bns-132` | Assault/criminal force to deter public servant | BNS s.132 | IPC s.353 |
| `bns-221` | Obstructing public servant | BNS s.221 | IPC s.186 |
| `bns-223` | Disobeying a public servant's order (incl. prohibitory orders) | BNS s.223 | IPC s.188 |
| `bns-238` | Causing disappearance of evidence | BNS s.238 | IPC s.201 |
| `bns-152` | Acts endangering sovereignty, unity & integrity (serious charge; contested) | BNS s.152 | (related: IPC s.124A) |
| `bsa-23` | Confession to police not usable against accused (with exceptions) | BSA s.23 | Evidence Act s.25–27 |
| `lsa-12g` | Free legal services to any person in custody | Legal Services Authorities Act 1987, s.12(g) | — |
| `jja-10` | Child in conflict with law: no police lock-up/jail; Juvenile Justice Board | Juvenile Justice Act 2015, s.10 (and s.12) | — |
| `telecom-20` | Power to suspend telecom services in emergencies | Telecommunications Act 2023, s.20 + Rules under it | Indian Telegraph Act 1885 s.5 + 2017 Suspension Rules |
| `pdpp` | Damage to public property | Prevention of Damage to Public Property Act 1984 | — |
| `nsa` | Preventive detention law | National Security Act 1980 | — |
| `uapa-43d` | Strict bail test | UAPA 1967 s.43D(5) | — |

*Rows for recorded cases are in §7.4 and share ids like `case-dkbasu`.*

### 7.2 Modules (each becomes one JSON file)

> Format: **Summary / Do / Don't / Say / Know (refs) / Gray areas / Tags**

---

#### M01 — Ten Golden Rules (shown on Home and printed on the wallet card)
1. **Stay calm and peaceful.** Do not run, push, or use force — even if you think the detention is unlawful. You can challenge it later in court; resisting can give them a new charge. (`bns-132`, `bns-221`)
2. **Give your name and address if asked** (`bnss-39`). On the case itself, you can stay silent (`const-20-3`, `bnss-180`). Never lie.
3. **Ask: "Am I free to go?"** If not, treat it as an arrest and ask for the grounds. (S01)
4. **Ask the reason for arrest** — and ask for it in writing. (`const-22`, `bnss-47`) (S02)
5. **Ask for your lawyer — or a free legal aid lawyer.** (`const-22`, `lsa-12g`) (S04)
6. **Ask them to inform your family/friend.** (`bnss-36`, `bnss-48`) (S05)
7. **Do not sign anything you have not read. Never sign a blank paper.** A police statement need not be signed. (`bnss-181`) (S08)
8. **You must be taken before a Magistrate within 24 hours** (not counting travel time). Tell the Magistrate about any ill-treatment. (`const-22`, `bnss-58`)
9. **If you are injured, ask for a medical examination** and tell the Magistrate. (`bnss-53`) (S10)
10. **Write down names/badge numbers, times and places** as soon as you can. (Notes screen)

*Tags:* rules, basics, mool niyam, adhikar

---

#### M02 — Stopped or questioned (not arrested) — `situationId: stopped`
- **Summary:** Police can stop and ask questions, but being stopped is not the same as being arrested.
- **Do:** Stay calm. Give your name and address (S03). Ask "Am I free to go?" (S01). If asked to come to the station, ask whether it is a written **notice** and read it.
- **Don't:** Don't run, don't argue, don't give false information, don't sign unread papers.
- **Know:**
  - You must give name and address when asked; refusing can itself lead to arrest. (`bnss-39`)
  - You need not answer questions that could incriminate you. (`bnss-180`, `const-20-3`)
  - Your statement to police does not have to be signed. (`bnss-181`)
  - For many offences the police should issue a **notice to appear** instead of arresting; if you comply with the notice you should not be arrested unless the police record reasons. (`bnss-35`, case-arnesh)
  - Women, children, elderly and disabled persons cannot be required to attend the police station as witnesses; they can be questioned at their residence. (`bnss-179`)
  - Women must be searched only by a woman officer, with strict regard to decency. (`bnss-49` — applies explicitly to arrested persons; courts apply the principle more widely — verify)
- **Gray areas:** Whether you can be compelled to unlock your phone is unsettled (see M09). Police may also seize an item they suspect is linked to an offence (`bnss-106`).
- **Tags:** roka, poochtaach, stopped, questioned, thana, notice

---

#### M03 — Detained at a protest (mass or preventive detention) — `situationId: detained`
- **Summary:** At protests police often detain many people, move them by bus, and release them later. Legally this is usually *preventive arrest*.
- **Do:** Comply physically. Ask the officer's name and number. Ask: "Under which provision am I being detained?" (S14). Note the time, place, vehicle number, and names of people detained with you. Stay together. If you can, ask someone to inform your family (S05).
- **Don't:** Don't resist, don't run from the group, don't answer questions about the protest's organisers without a lawyer (S07).
- **Know:**
  - Preventive arrest (to stop a cognizable offence) generally **cannot last more than 24 hours** unless further detention is authorised under another law. (`bnss-170`)
  - If you are arrested, grounds must be told to you and you must be produced before a Magistrate within 24 hours. (`const-22`, `bnss-47`, `bnss-58`)
  - Before dispersing an assembly police should give warnings, and force must be the minimum necessary. (`bnss-148-150`, case-anitathakur)
  - Women and children have extra protections (see M10).
- **Gray areas:** Police sometimes call it "detention" to avoid arrest safeguards. If you are not free to leave, treat it as an arrest and ask for the grounds. Mass detentions may involve no paperwork — your own notes matter.
- **Tags:** hirasat, bus, mass detention, preventive, 151, 170, giraftari

---

#### M04 — Being arrested — `situationId: arrested`
- **Summary:** Arrest takes away your liberty, so the law gives you specific rights at the moment of arrest.
- **Do:**
  - Stay calm; give name and address (S03).
  - Ask for the **reason and section** (S02), in writing and in a language you understand.
  - Ask the officer to show **name tag/ID** and prepare an **arrest memo** (S06). Read it before countersigning.
  - Ask them to inform your family/friend (S05) and say you want a lawyer (S04).
  - Ask for a list/receipt of anything taken from you.
- **Don't:** Don't resist. Don't sign blank or unread papers (S08). Don't "explain" or "confess" — anything you say can be used to build the case (`bsa-23` limits confessions to police, but don't rely on it).
- **Know:**
  - **Grounds of arrest** must be communicated (`const-22`, `bnss-47`). The Supreme Court has held in some settings that grounds must be given **in writing** (case-pankajbansal, case-prabir) — ask for it.
  - Arresting officer must wear **accurate, visible name identification**, and prepare an **arrest memo** attested by a family member or a respectable person of the locality and **countersigned by you**. (`bnss-36`, case-dkbasu)
  - You have the right to have a **relative/friend informed**; police must also inform your nominated person. (`bnss-36`, `bnss-48`)
  - Right to a **lawyer of your choice**; you may meet a lawyer during interrogation (though not throughout). (`const-22`, `bnss-38`)
  - For offences punishable up to 7 years arrest is **not automatic**; police must record reasons and consider a notice of appearance. (`bnss-35`, case-arnesh, case-joginder)
  - No more restraint than necessary; handcuffing is the exception. (`bnss-46`, case-premshankar)
  - If the offence is **bailable**, police must tell you that you can get bail. (`bnss-47`)
  - **Women:** woman police officer; no arrest after sunset/before sunrise except in exceptional circumstances with prior written permission of the Magistrate. (`bnss-43`)
  - **Elderly/infirm:** for offences punishable with less than 3 years, arrest needs prior permission of an officer not below DSP rank. (`bnss-35`)
  - You can ask for a **medical examination**. (`bnss-53`) (S10)
- **Gray areas:** The 7-year rule is a safeguard, not a ban on arrest; police can arrest if they record the statutory reasons. Courts' treatment of "written grounds" differs by law (e.g., PMLA/UAPA vs ordinary cases) — verify the latest rulings.
- **Tags:** giraftari, arrest, arrest memo, grounds, vakeel, 41, 35

---

#### M05 — At the police station / in custody — `situationId: custody`
- **Summary:** In custody you still have rights. The key limits are time (24 hours), dignity (no torture), and access (lawyer, family, doctor).
- **Do:** Ask for a legal aid lawyer (S04). Ask for water, toilet, and medical help when needed. Note officers' names, times, and what is done. Ask for a **seizure memo** for any item taken, including your phone (S09). Show injuries to the doctor and Magistrate.
- **Don't:** Don't fight, don't threaten, don't sign unread papers (S08), don't discuss the case (S07).
- **Know:**
  - **24-hour rule:** you must be produced before the nearest Magistrate within 24 hours of arrest (travel time excluded), including on holidays. (`const-22`, `bnss-58`)
  - **No torture or cruel treatment** — part of the right to life and dignity. (`const-21`, case-dkbasu)
  - A police statement does not need your signature. (`bnss-181`)
  - A **Zero FIR** can be registered at any station. (`bnss-173`)
  - Women: separate lock-up, woman officers present. Children: never in lock-up/jail (see M10). (`jja-10`, case-sheelabarse)
  - If you are held beyond 24 hours without a Magistrate's order, your family or lawyer can file an urgent **habeas corpus** petition in the High Court/Supreme Court. (`const-32-226`)
- **Gray areas:** Rights on paper are not always followed in practice. This is why your notes, your family being informed, and a lawyer matter.
- **Tags:** thana, lockup, hirasat, custody, torture, habeas corpus

---

#### M06 — Before the Magistrate: remand, legal aid and bail — `situationId: court`
- **Summary:** The first appearance before a Magistrate is your best chance to raise problems and ask for a lawyer and bail.
- **Do:** Speak up politely. Tell the Magistrate (S12): any beating/threat, injuries, that you were not allowed to call, that you want a **legal aid lawyer**, and that you apply for **bail**. Ask for a medical examination if injured.
- **Don't:** Don't make admissions. Don't sign papers unread.
- **Know:**
  - The Magistrate decides: release, bail, **police custody** (limited days), or **judicial custody**. Police custody is capped at 15 days in total (BNSS allows these days to be spread across the early part of the investigation — verify). (`bnss-187`)
  - **Free legal aid for anyone in custody**, regardless of income. The Magistrate should tell you about this right. (`lsa-12g`, `const-39a`, case-khatri)
  - **Bailable offence:** bail is a right; if you cannot arrange surety, the court can accept a personal bond. (`bnss-478`)
  - **Non-bailable offence:** bail is at the court's discretion. (`bnss-480`, case-antil)
  - **Default bail:** if the investigation isn't completed within the legal period (60/90 days depending on the offence), you can apply for default bail. (`bnss-187`)
  - **Undertrial limits:** first-time offenders may be released after serving one-third of the maximum sentence (other limits apply). (`bnss-479`)
  - **Anticipatory bail** (before arrest) is possible if you fear arrest. (`bnss-482`)
  - NALSA legal aid helpline: **15100**. District Legal Services Authority (DLSA) offices are at every district court.
- **Gray areas:** Bail is much harder under special laws (e.g., UAPA, PMLA). If any of these are mentioned, get a lawyer immediately. (`uapa-43d`)
- **Tags:** magistrate, remand, zamanat, bail, DLSA, legal aid, mukhya nyayik, pesh

---

#### M07 — Protest rights and limits (group: protest)
- **Summary:** Peaceful assembly is a fundamental right, but it is not unlimited.
- **Know:**
  - Art. 19(1)(a),(b): free speech and the right to assemble **peacefully and without arms**; the State can impose *reasonable restrictions* (e.g., public order). (`const-19`)
  - Courts have said that protest is part of democracy and police cannot act arbitrarily (case-ramlila, case-mkss), but also that protests cannot block public roads/places **indefinitely** (case-amitsahni). Expect balancing.
  - **Prohibitory orders** (BNSS s.163, old s.144) can restrict gatherings. They must be reasoned, and cannot be used to suppress legitimate peaceful expression (case-anuradha, case-madhulimaye). **Violating a valid order is an offence.** (`bnss-163`, `bns-223`)
  - **Unlawful assembly:** 5 or more people with a common unlawful object; if violence occurs, **every member** can be held liable for what is done in pursuit of the common object. (`bns-189`, `bns-190`, `bns-191`)
  - Police may order dispersal; force must be minimum and preceded by warning. (`bnss-148-150`)
  - Damage to public property is a separate offence. (`pdpp`)
- **Do:** Stay unarmed. Keep to the peaceful core of the gathering. **Leave when a lawful dispersal order is given or violence starts.** Ask officers to show the prohibitory order in writing if you're unsure it applies.
- **Don't:** Don't carry weapons or sticks. Don't damage property. Don't stay at a gathering after a lawful order to disperse. Don't make or share unverified rumours.
- **Gray areas:** Whether a particular order or restriction is valid is often decided by courts *after* the event. Serious charges exist in the BNS and special laws (e.g., `bns-152`, UAPA); if any is mentioned, call a lawyer at once.
- **Tags:** pradarshan, virodh, dharna, 144, 163, assembly, ghera, julus, rally

---

#### M08 — Internet shutdown (group: protest)
- **Summary:** Authorities can suspend internet in emergencies, but not arbitrarily or indefinitely.
- **Know:**
  - Internet access for expression is protected under Art. 19(1)(a); shutdowns must be **necessary, proportionate, temporary, in writing with reasons, and open to judicial review**. Orders should be published. (case-anuradha, `const-19`)
  - The legal power now sits in the Telecommunications Act 2023 and rules under it (replacing the Telegraph Act 2017 rules) — verify the current rules. (`telecom-20`)
  - A shutdown does **not** suspend your fundamental rights or the police's duties under arrest law.
  - If a shutdown order is not public, a lawyer/organisation can ask for it and challenge it in the High Court. (`const-32-226`)
- **Do (before a shutdown):** Save this app. Save key numbers on paper/body (lawyer, family, 15100). Agree on offline plans with your group: meeting points, check-in times, who calls the lawyer. Voice calls/SMS may still work.
- **Optional (research and install before, not during):** offline messengers that work over Bluetooth/Wi-Fi (e.g., Briar). Check their security independently.
- **Gray areas:** Courts have not set a fixed time limit; each shutdown is judged on its facts.
- **Tags:** internet band, shutdown, network, mobile data, communication ban

---

#### M09 — Your phone: seizure, search, passcodes (group: special)
- **Summary:** Phones hold your private life and your contacts' safety.
- **Know:**
  - Police can seize property linked to an offence and must report the seizure to the Magistrate; ask for a **written seizure memo** listing the device. (`bnss-106`, `bnss-94`)
  - Privacy is a fundamental right (case-puttaswamy), and Art. 20(3) protects against compelled testimony (case-selvi). But whether police/courts can **force you to give a passcode or fingerprint/face unlock** is **unsettled** — different High Courts have taken different views.
  - **Never delete or destroy data after you know an investigation exists or police have asked for it.** Destroying evidence is an offence. (`bns-238`)
- **Do (before a protest):** Strong alphanumeric passcode; consider disabling fingerprint/face unlock (and learn your phone's lockdown/shutdown shortcut); update the phone; back up; log out of sensitive accounts; turn on disappearing messages; carry only what you need.
- **Say:** "I do not consent to the search of my phone or to giving my passcode. Please give me a written seizure memo." (S09) — **say it calmly; do not physically resist.**
- **Gray areas:** See above. Tell your lawyer immediately about any seizure.
- **Tags:** phone, mobile, passcode, password, seizure, jabti, privacy

---

#### M10 — Women, children and other special groups (group: special)
- **Women:** Woman officer for search; no arrest after sunset/before sunrise except in exceptional circumstances with prior written permission of a Magistrate; separate lock-up; woman police presence; may be questioned at residence as witness. (`bnss-43`, `bnss-49`, `bnss-179`, case-sheelabarse) Helplines: **1091 / 181** (verify local numbers).
- **Children (under 18):** Not treated like adults. Should not be put in a police lock-up or jail; handled by a Special Juvenile Police Unit and the **Juvenile Justice Board**; parents/guardian must be informed. (`jja-10`) Childline **1098**. Script: S13.
- **Elderly / infirm:** For offences punishable with less than 3 years, arrest needs prior permission of an officer not below DSP rank. (`bnss-35`)
- **Persons with disabilities:** Right to reasonable accommodation and dignity; tell the officer and the Magistrate about needs (medication, assistance). (Rights of Persons with Disabilities Act 2016 — verify provisions.)
- **Transgender persons:** Right to dignity and non-discrimination (NALSA v. Union of India, 2014; Transgender Persons Act 2019 — verify).
- **Gray areas:** Practices differ by state; ask for the supervising officer and a lawyer.
- **Tags:** mahila, women, bachche, child, juvenile, bujurg, divyang

---

#### M11 — Custodial violence and how to complain (group: special)
- **Know:** Torture and cruel treatment in custody are unlawful and violate Art. 21 (`const-21`, case-dkbasu). Courts can award compensation.
- **Do:** Tell the doctor and the Magistrate immediately (S10, S12). Ask for a **medico-legal examination** and a copy of the report. Photograph injuries with a date. Keep torn/bloodied clothing. Write down names/times (Notes). Ask your lawyer about a complaint to the Superintendent of Police, State Human Rights Commission/NHRC, a complaint before the Magistrate (BNSS s.175(3)/old s.156(3) — verify), or a High Court petition.
- **Gray areas:** Pursuing complaints can be slow; your contemporaneous record is valuable evidence.
- **Tags:** maar-peet, torture, custodial, NHRC, medical, MLC

---

#### M12 — Preventive detention and special laws (group: special)
- **Summary:** Some laws work differently from ordinary arrest rules.
- **Know:**
  - **Preventive detention laws** (e.g., National Security Act, state laws): safeguards under Art. 22(3)–(7) differ; the usual 24-hour/Magistrate and lawyer-of-choice protections do not apply the same way; detention goes to an **Advisory Board**; grounds must still be communicated and you can make a representation. (`const-22-3to7`, `nsa`)
  - **Special criminal laws** (e.g., UAPA, PMLA) have stricter bail tests. (`uapa-43d`)
  - A detention order can be challenged by **habeas corpus** in the High Court/Supreme Court. (`const-32-226`)
- **Do:** Ask for the grounds in writing and a copy of the order. Call legal aid (15100) or your lawyer immediately — this is the point where a lawyer matters most.
- **Gray areas:** Rules and time limits vary by law and have been amended; do not rely on this summary beyond "get a lawyer now".
- **Tags:** NSA, UAPA, PSA, preventive detention, habeas corpus

---

#### M13 — "Emergency" and your rights (group: reference)
- **Summary:** "Emergency" can mean a local law-and-order situation *or* a constitutional **National Emergency** (Art. 352). They are different.
- **Know:**
  - Under the Constitution as amended in 1978, Art. 19 is suspended automatically only during a National Emergency declared on grounds of **war or external aggression** (not merely internal disturbance). (`const-358-359`)
  - The President can suspend the right to approach courts for certain fundamental rights, but **not Art. 20 and Art. 21** (protection in criminal law and life/liberty). (`const-358-359`)
  - The Supreme Court later recognised that life and liberty cannot be suspended by an emergency (case-puttaswamy).
  - State Emergency (President's Rule, Art. 356) does not suspend fundamental rights.
- **Gray areas:** This is a high-level summary; get a constitutional lawyer's view for any real emergency.
- **Tags:** emergency, aapatkaal, 352, 358, 359, president rule

---

### 7.3 Script cards (`scripts.json`)

> Safety line shown under **every** script: *"Say it calmly and respectfully. Do not resist physically. Rights are asserted by words, and challenged later in court."*

| ID | When to use | English | हिन्दी | Roman Hindi |
|---|---|---|---|---|
| **S01** | Stopped / unsure if arrested | "Officer, am I being arrested or detained? Am I free to go?" | "अधिकारी महोदय, क्या मुझे गिरफ़्तार किया जा रहा है या हिरासत में लिया जा रहा है? क्या मैं जा सकता/सकती हूँ?" | "Adhikari mahoday, kya mujhe giraftaar kiya ja raha hai ya hirasat mein liya ja raha hai? Kya main ja sakta/sakti hoon?" |
| **S02** | Arrest / detention | "Please tell me the reason for my arrest or detention, and under which section. Please give it to me in writing." | "कृपया मुझे बताइए कि मुझे किस कारण और किस धारा के तहत गिरफ़्तार/हिरासत में लिया जा रहा है। कृपया यह मुझे लिखित में दीजिए।" | "Kripya mujhe bataiye ki mujhe kis kaaran aur kis dhaara ke tahat giraftaar/hirasat mein liya ja raha hai. Kripya yeh mujhe likhit mein dijiye." |
| **S03** | Asked your identity | "My name is ___ and my address is ___. I will not answer other questions about the case without my lawyer." | "मेरा नाम ___ है और मेरा पता ___ है। मैं अपने वकील के बिना मामले से जुड़े किसी और सवाल का जवाब नहीं दूँगा/दूँगी।" | "Mera naam ___ hai aur mera pata ___ hai. Main apne vakeel ke bina maamle se jude kisi aur sawaal ka jawaab nahin doonga/doongi." |
| **S04** | Any custody | "I want to speak to my lawyer. If I do not have one, I request a free legal aid lawyer." | "मैं अपने वकील से बात करना चाहता/चाहती हूँ। यदि मेरे पास वकील नहीं है, तो मुझे निःशुल्क कानूनी सहायता वकील उपलब्ध कराया जाए।" | "Main apne vakeel se baat karna chahta/chahti hoon. Yadi mere paas vakeel nahin hai, to mujhe nihshulk kaanooni sahayata vakeel uplabdh karaya jaaye." |
| **S05** | After arrest | "Please inform my family/friend ___ (phone ___) that I have been arrested and where I am being taken." | "कृपया मेरे परिवार/मित्र ___ (फ़ोन ___) को सूचित कीजिए कि मुझे गिरफ़्तार किया गया है और मुझे कहाँ ले जाया जा रहा है।" | "Kripya mere parivaar/mitra ___ (phone ___) ko soochit kijiye ki mujhe giraftaar kiya gaya hai aur mujhe kahaan le jaya ja raha hai." |
| **S06** | At arrest | "Please show your name and ID, and prepare the arrest memo. I will read it before I sign." | "कृपया अपना नाम और पहचान दिखाइए तथा गिरफ़्तारी मेमो तैयार कीजिए। मैं हस्ताक्षर करने से पहले उसे पढ़ूँगा/पढ़ूँगी।" | "Kripya apna naam aur pehchaan dikhaiye tatha giraftaari memo taiyaar kijiye. Main hastakshar karne se pehle use padhoonga/padhoongi." |
| **S07** | Interrogation | "I am exercising my right to remain silent. I will speak only in the presence of my lawyer." | "मैं चुप रहने के अपने अधिकार का प्रयोग कर रहा/रही हूँ। मैं केवल अपने वकील की उपस्थिति में बात करूँगा/करूँगी।" | "Main chup rehne ke apne adhikaar ka prayog kar raha/rahi hoon. Main keval apne vakeel ki upasthiti mein baat karoonga/karoongi." |
| **S08** | Asked to sign | "I will not sign any paper I have not read. I will not sign a blank paper." | "मैं कोई भी काग़ज़ बिना पढ़े हस्ताक्षर नहीं करूँगा/करूँगी। मैं खाली काग़ज़ पर हस्ताक्षर नहीं करूँगा/करूँगी।" | "Main koi bhi kaagaz bina padhe hastakshar nahin karoonga/karoongi. Main khaali kaagaz par hastakshar nahin karoonga/karoongi." |
| **S09** | Phone demanded/seized | "I do not consent to the search of my phone or to giving my passcode. If you are seizing it, please give me a written seizure memo." | "मैं अपने फ़ोन की तलाशी या पासकोड देने के लिए सहमति नहीं देता/देती। यदि आप इसे जब्त कर रहे हैं, तो कृपया मुझे लिखित जब्ती-मेमो दीजिए।" | "Main apne phone ki talaashi ya passcode dene ke liye sahmati nahin deta/deti. Yadi aap ise jabt kar rahe hain, to kripya mujhe likhit jabti-memo dijiye." |
| **S10** | Injured / unwell | "I am injured / unwell. I request a medical examination by a doctor, and I want my injuries recorded." | "मुझे चोट लगी है / मेरी तबीयत ठीक नहीं है। मैं डॉक्टर से जाँच करवाना चाहता/चाहती हूँ और चाहता/चाहती हूँ कि मेरी चोटें दर्ज की जाएँ।" | "Mujhe chot lagi hai / meri tabiyat theek nahin hai. Main doctor se jaanch karwana chahta/chahti hoon aur chahta/chahti hoon ki meri choten darj ki jaayen." |
| **S11** | Women | "I am a woman. Please call a woman police officer. I must be searched only by a woman officer. Except in exceptional circumstances, with a Magistrate's written permission, a woman cannot be arrested between sunset and sunrise." | "मैं महिला हूँ। कृपया महिला पुलिस अधिकारी को बुलाइए। मेरी तलाशी केवल महिला अधिकारी द्वारा ही होनी चाहिए। असाधारण परिस्थितियों में मजिस्ट्रेट की लिखित अनुमति के बिना सूर्यास्त के बाद और सूर्योदय से पहले किसी महिला को गिरफ़्तार नहीं किया जा सकता।" | "Main mahila hoon. Kripya mahila police adhikari ko bulaiye. Meri talaashi keval mahila adhikari dwara hi honi chahiye. Asaadhaaran paristhitiyon mein magistrate ki likhit anumati ke bina sooryaast ke baad aur sooryoday se pehle kisi mahila ko giraftaar nahin kiya ja sakta." |
| **S12** | Before Magistrate | "Your Honour, I wish to tell the court that I was [beaten / threatened / not given food / not allowed to call my family]. I request a medical examination, a legal aid lawyer, and I apply for bail." | "माननीय महोदय, मैं बताना चाहता/चाहती हूँ कि मुझे [मारा-पीटा गया / धमकाया गया / भोजन नहीं दिया गया / परिवार को फ़ोन करने नहीं दिया गया]। मैं मेडिकल जाँच, कानूनी सहायता वकील और ज़मानत का अनुरोध करता/करती हूँ।" | "Maanneeya mahoday, main batana chahta/chahti hoon ki mujhe [maara-peeta gaya / dhamkaya gaya / bhojan nahin diya gaya / parivaar ko phone karne nahin diya gaya]. Main medical jaanch, kaanooni sahayata vakeel aur zamanat ka anurodh karta/karti hoon." |
| **S13** | Under 18 | "I am under 18 years old. Please inform my parents and produce me before the Juvenile Justice Board." | "मेरी उम्र 18 वर्ष से कम है। कृपया मेरे माता-पिता को सूचित कीजिए और मुझे किशोर न्याय बोर्ड के सामने पेश कीजिए।" | "Meri umr 18 varsh se kam hai. Kripya mere maata-pita ko soochit kijiye aur mujhe kishor nyay board ke saamne pesh kijiye." |
| **S14** | Preventive detention | "Under which provision am I being held? Preventive detention generally cannot exceed 24 hours. Please release me or produce me before a Magistrate." | "मुझे किस प्रावधान के तहत रखा गया है? निवारक हिरासत सामान्यतः 24 घंटे से अधिक नहीं हो सकती। कृपया मुझे छोड़िए या मजिस्ट्रेट के सामने पेश कीजिए।" | "Mujhe kis praavdhaan ke tahat rakha gaya hai? Nivaarak hirasat saamaanyatah 24 ghante se adhik nahin ho sakti. Kripya mujhe chhodiye ya magistrate ke saamne pesh kijiye." |

**Warnings (`warning` field):** S09 → "Do not physically resist; legal position on unlocking phones is unsettled." S14 → "Preventive detention under special laws (NSA etc.) follows different rules — see M12."
**AI note:** Hindi above is a first draft. Mark `translation: "ai_draft"`; a native Hindi-speaking advocate must review.

### 7.4 Case cards (`cases.json`) — all `verifyCitation: true`

| id | Case | Year / citation (verify) | One-line holding → why it matters |
|---|---|---|---|
| `case-dkbasu` | D.K. Basu v. State of West Bengal | 1997, (1997) 1 SCC 416 | Guidelines on arrest/detention: ID tags, arrest memo with witness, inform relative, medical checks. → Basis for most arrest rights. |
| `case-arnesh` | Arnesh Kumar v. State of Bihar | 2014, (2014) 8 SCC 273 | No automatic arrest for offences up to 7 years; police must justify necessity; Magistrates must check. |
| `case-joginder` | Joginder Kumar v. State of U.P. | 1994, (1994) 4 SCC 260 | Arrest is not routine; right to have someone informed. |
| `case-nandini` | Nandini Satpathy v. P.L. Dani | 1978, (1978) 2 SCC 424 | Right to silence extends to the investigation stage; protects against compelled self-incrimination. |
| `case-selvi` | Selvi v. State of Karnataka | 2010, (2010) 7 SCC 263 | Narco-analysis, polygraph and brain-mapping cannot be forced. |
| `case-khatri` | Khatri v. State of Bihar | 1981, (1981) 1 SCC 627 | Free legal aid at the stage of first production before the Magistrate. |
| `case-sheelabarse` | Sheela Barse v. State of Maharashtra | 1983, (1983) 2 SCC 96 | Safeguards for women and children in custody; legal aid. |
| `case-premshankar` | Prem Shankar Shukla v. Delhi Administration | 1980, (1980) 3 SCC 526 | Handcuffing only in exceptional cases. |
| `case-anuradha` | Anuradha Bhasin v. Union of India | 2020, (2020) 3 SCC 637 | Internet shutdowns/prohibitory orders must be reasoned, proportionate, published, and reviewable; indefinite suspension impermissible. |
| `case-ramlila` | In re: Ramlila Maidan Incident | 2012, (2012) 5 SCC 1 | Right to assemble and protest is fundamental; police action against sleeping protesters condemned. |
| `case-mkss` | Mazdoor Kisan Shakti Sangathan v. Union of India | 2018, (2018) 17 SCC 324 | Protest spaces and restrictions must balance rights and public order. |
| `case-amitsahni` | Amit Sahni v. Commissioner of Police | 2020, (2020) 10 SCC 439 | Right to protest does not include blocking public ways indefinitely. |
| `case-anitathakur` | Anita Thakur v. Government of J&K | 2016 | Peaceful protesters should not be met with disproportionate force. |
| `case-himatlal` | Himat Lal K. Shah v. Commissioner of Police | 1973, (1973) 1 SCC 227 | State can regulate assemblies but cannot make the right depend on arbitrary permission. |
| `case-madhulimaye` | Madhu Limaye v. SDM Monghyr | 1970, (1970) 3 SCC 746 | Scope and limits of prohibitory orders (old s.144). |
| `case-pankajbansal` / `case-prabir` | Pankaj Bansal v. Union of India (2023); Prabir Purkayastha v. State (NCT of Delhi) (2024) | 2023 / 2024 | Written grounds of arrest must be given in specified contexts; later rulings extend/refine — verify latest. |
| `case-puttaswamy` | K.S. Puttaswamy v. Union of India | 2017, (2017) 10 SCC 1 | Privacy is a fundamental right; life and liberty cannot be suspended. |
| `case-antil` | Satender Kumar Antil v. CBI | 2022, (2022) 10 SCC 51 | Bail guidelines; arrest/remand not mechanical; bail is the rule. |

### 7.5 Contacts (`contacts.json`) — verify all numbers
| Label | Number | Note |
|---|---|---|
| Emergency (police/fire/ambulance, ERSS) | 112 | National single emergency number |
| NALSA free legal aid helpline | 15100 | Free legal services; also visit the District Legal Services Authority |
| Ambulance | 108 | Varies by state (also 102) — verify locally |
| Women helpline (police) | 1091 | State-level 181 in many states — verify |
| Childline | 1098 | Children in distress |
| *Placeholders to fill from official sources* | — | State Legal Services Authority, District Legal Services Authority (DLSA), State Human Rights Commission, NHRC, local bar association legal-aid desk |

**"My contacts"** (user-added, encrypted): lawyer, 2 family members, 1 friend, organisation hotline. Tap-to-dial using `tel:` links (these work offline for voice calls).

### 7.6 Glossary (`glossary.json`) — AI writes plain-language meanings (EN + HI draft)
FIR; Zero FIR; cognizable / non-cognizable; bailable / non-bailable; arrest vs detention; arrest memo; remand; police custody vs judicial custody; Magistrate; bail; surety; personal bond; anticipatory bail; default bail; charge-sheet; preventive detention; prohibitory order; unlawful assembly; habeas corpus; DLSA; seizure memo; medico-legal case (MLC); Advisory Board.

### 7.7 Pre-protest checklist (`checklists.json`)
- [ ] Write 2 phone numbers (lawyer + family) and **15100** on paper or your forearm in marker. Phones get seized or die.
- [ ] Carry ID, any medication, a little cash, water, a charged power bank.
- [ ] Tell a trusted person where you will be and when you will check in; agree: "If I don't call by ___, contact the lawyer."
- [ ] Give the lawyer/organisation your full name, address, and ID details in advance.
- [ ] Phone: strong passcode; consider turning off fingerprint/face unlock; update; back up; log out of sensitive accounts; disappearing messages on.
- [ ] Install offline tools (this app, offline messenger) **before** you go.
- [ ] Wear comfortable clothes/shoes. Carry nothing that could be seen as a weapon.
- [ ] Know exits and meeting points. Go with a buddy. Agree a plan if separated.
- [ ] Stay peaceful. Leave when told to disperse lawfully or when violence starts.
- [ ] Women/children: know S11 and S13; save 1091/1098.

### 7.8 Incident note template (Notes screen)
Fields: Date/time · Place · Who stopped/arrested you (name, badge no., rank, station, vehicle no.) · What was said (their words/yours) · Section/law mentioned · Time arrested · Was a memo made? Did you sign? · Items taken (receipt?) · Who was informed · Injuries/medical · Time produced before Magistrate · Witnesses · Timeline entries (+ button adds time/text).

### 7.9 Disclaimer text
**EN:** "Nagrik Guide gives general legal information to help people understand their rights. It is not legal advice and cannot replace a lawyer. Laws change, courts interpret them differently, and police may not always follow them. Content marked DRAFT has not been reviewed by a lawyer. If you can, speak to a lawyer or call legal aid (15100)."
**HI:** "नागरिक गाइड लोगों को उनके अधिकार समझने में मदद के लिए सामान्य कानूनी जानकारी देता है। यह कानूनी सलाह नहीं है और वकील का विकल्प नहीं है। कानून बदलते हैं, अदालतें उनकी अलग-अलग व्याख्या कर सकती हैं, और पुलिस हमेशा उनका पालन नहीं करती। 'मसौदा' चिह्नित सामग्री की किसी वकील द्वारा जाँच नहीं हुई है। यदि संभव हो तो वकील से बात करें या कानूनी सहायता (15100) पर कॉल करें।"

---

## 8. UI strings (seed for `en.json` / `hi.json`)

| key | EN | हिन्दी |
|---|---|---|
| `home.stopped` | I am being stopped or questioned | मुझे रोका गया है या पूछताछ की जा रही है |
| `home.arrested` | I am being detained or arrested | मुझे हिरासत में लिया जा रहा है या गिरफ़्तार किया जा रहा है |
| `home.custody` | I am at the police station | मैं थाने में हूँ |
| `home.court` | Going before a magistrate / bail | मजिस्ट्रेट के सामने पेशी / ज़मानत |
| `home.protest` | Protest rights | प्रदर्शन के अधिकार |
| `home.say` | What to say | क्या कहें |
| `home.help` | Call for help | मदद के लिए कॉल करें |
| `home.notes` | My notes | मेरे नोट्स |
| `home.search` | Search | खोजें |
| `home.shutdown` | Internet shutdown | इंटरनेट बंद |
| `tab.do` / `tab.say` / `tab.know` | Do now / Say / Know your rights | अभी करें / कहें / अपने अधिकार जानें |
| `banner.draft` | DRAFT — not yet reviewed by a lawyer. General information, not legal advice. | मसौदा — अभी किसी वकील द्वारा जाँचा नहीं गया। यह सामान्य जानकारी है, कानूनी सलाह नहीं। |
| `badge.drafted` / `badge.verified` | Drafted / Last verified | तैयार किया गया / अंतिम जाँच |
| `badge.notyet` | not yet | अभी नहीं |
| `law.basis` | Legal basis | कानूनी आधार |
| `law.current` / `law.old` | Current law / Old law | वर्तमान कानून / पुराना कानून |
| `gray.title` | Gray area — the law is unclear or varies | अस्पष्ट क्षेत्र — कानून स्पष्ट नहीं है या अलग-अलग है |
| `show.officer` | Show to officer | अधिकारी को दिखाएँ |
| `quick.exit` | Quick exit | तुरंत बाहर |
| `settings.clear` | Clear all my data | मेरा सारा डेटा मिटाएँ |
| `settings.pin` | Set PIN (6+ digits) | पिन सेट करें (6+ अंक) |
| `settings.textsize` | Text size | अक्षर का आकार |
| `lock.enter` | Enter PIN | पिन दर्ज करें |
| `notes.new` | New note | नया नोट |
| `contacts.mine` | My contacts | मेरे संपर्क |
| `contacts.national` | National numbers | राष्ट्रीय नंबर |
| `english.only` | English only | केवल अंग्रेज़ी |
| `warn.nopin` | Without a PIN, your notes are not encrypted. | बिना पिन के आपके नोट्स एन्क्रिप्ट नहीं होते। |

---

## 9. Build plan — hour by hour, with AI prompts

### 9.1 Master Prompt (paste first, once)
```
You are building "Nagrik Guide", an offline-first Android + PWA app that gives
Indian protestors general legal information. Read docs/PLAN.md fully first.

HARD RULES
1. No network access anywhere: no fetch/XHR to external hosts, no CDN fonts, no analytics.
2. All legal text lives in src/content/*.json, never in components. UI strings in src/i18n.
3. English + Hindi. Missing Hindi falls back to English with an "English only" badge.
4. Never invent legal section numbers or case citations. Use only the ones in PLAN.md §7.
5. Every module shows its review status; non-lawyer_reviewed modules show the DRAFT banner.
6. Big touch targets (>=48dp), base font 18px, A-/A+ control, high-contrast/dark theme.
7. Use HashRouter, plain CSS variables, React + TypeScript + Vite. Keep dependencies minimal.
8. After each step run `npm run build` and `npm run validate` and fix errors before continuing.
9. Work in small steps; tell me what you changed and how to test it.
```

### 9.2 Schedule (≈ 10–11 hours; content authoring runs in parallel)
| Time | Block | Output |
|---|---|---|
| 0:00–0:45 | A. Setup | Repo, Node/Android Studio ready, plan saved |
| 0:45–2:00 | B. Foundations | Schemas, content loader, validator, i18n |
| 2:00–4:00 | C. Core screens | Home, Situation, Module, Scripts + Show-to-officer |
| 0:00–5:00 (parallel) | D. Content | JSON files from §7; send review export to lawyers |
| 4:00–5:30 | E. Library & reference | Search, cases, glossary, contacts, checklist |
| 5:30–7:00 | F. Privacy features | PIN, encryption, notes, My contacts, clear data, quick exit |
| 7:00–8:00 | G. Offline hardening | PWA, CSP, bundled fonts, icons |
| 8:00–9:30 | H. Android build | Capacitor, remove INTERNET, signed APK, real-device test |
| 9:30–10:30 | I. QA & release | Airplane-mode tests, fixes, README, v0.1-beta |

**If you fall behind, cut in this order** (last = cut first): Must = Home + 5 situations + scripts + contacts + disclaimers + offline + APK → Should = search + PIN/encrypted notes + Hindi → Could = cases + glossary + checklist + text-size control → Won't (v0.1) = anything not in this plan.

### 9.3 Phase prompts (run in order)

**P1 — Scaffold (Block A)**
```
Create the Vite React-TS project per PLAN.md §3. Install: react-router-dom fuse.js idb-keyval
@fontsource/noto-sans-devanagari; dev: vite-plugin-pwa. Set up folders from §3, HashRouter,
global styles with CSS variables (light + high-contrast dark), and the CSP meta tag from §6.1.
Add npm scripts: "validate" and "export:review". Add .gitignore (node_modules, dist, android/build, *.jks).
```

**P2 — Schemas, loader, validator, i18n (Block B)**
```
Implement the TypeScript types from PLAN.md §4 in src/types.ts. Build src/lib/content.ts that
loads all JSON in src/content (use Vite import.meta.glob). Write scripts/validate-content.ts
implementing the rules in §4.1 (run with tsx). Implement src/i18n with useI18n(), a language
toggle persisted in localStorage, and fallback-to-English with an "English only" badge.
Create empty-but-valid JSON files for every content file.
```

**P3 — Home, Situation, Module screens (Block C)**
```
Build the Home screen exactly as in PLAN.md §5.2 and the Situation screen (tabs: Do now / Say /
Know your rights) driven by modules whose situationId matches. Build the Module screen with:
ReviewBadge, DRAFT Banner, steps grouped by type (do/dont/say/know/next), collapsible
"Legal basis" listing each LawRef with current and old numbers, and a highlighted gray-area box.
Use only the UI strings from §8. Include QuickExit on every screen (Capacitor App.minimizeApp on
Android; location.replace('about:blank') on web).
```

**P4 — Scripts and Show-to-officer (Block C)**
```
Build /scripts and /scripts/:id. Each card shows English, Hindi, and Roman Hindi, the "when to say it"
line, any warning, and the standing safety line from §7.3. Add a "Show to officer" full-screen mode:
max font size, high contrast, EN/हि switch, keeps the screen awake (navigator.wakeLock if available),
tap-anywhere or a close button to exit.
```

**P5 — Convert content (Block D, parallel)**
```
Convert PLAN.md §7.1 to src/content/lawrefs.json (all verify:true), §7.2 to src/content/modules/M01.json…M13.json,
§7.3 to scripts.json, §7.4 to cases.json, §7.5 to contacts.json, §7.6 glossary (write plain-language
meanings), §7.7 to checklists.json. Every module: status "ai_draft", draftedOn "2026-10-09",
lastVerified null. Add Hinglish tags. Do not add or alter legal claims — copy faithfully. Then run validate.
```

**P6 — Hindi drafts (Block D)**
```
For every module, glossary term and case card missing `hi`, write a simple-Hindi draft. Keep English legal
terms in brackets on first use. Add "translation":"ai_draft" and list the files for native review.
Do not change meaning.
```

**P7 — Library, search, reference (Block E)**
```
Build /library with a search box using Fuse.js across title, summary, step text, tags (both languages and
Hinglish). Group results by module group. Build /cases, /glossary (searchable), /contacts (national numbers
with tel: links), /checklist, /shutdown (renders M08).
```

**P8 — Encryption and lock (Block F)**
```
Implement src/lib/crypto.ts per PLAN.md §6.2 (PBKDF2-SHA256 >=210k iterations -> AES-GCM-256, random salt/IV),
src/lib/storage.ts (idb-keyval wrapper that encrypts/decrypts records when a PIN is set), and src/lib/lock.ts
(key in memory only, lock after 60s in background, increasing delay after failed attempts). Build /lock and
Settings > PIN. Add unit tests for encrypt/decrypt round-trip.
```

**P9 — Notes, My contacts, Clear data (Block F)**
```
Build /notes and /notes/new using the template in PLAN.md §7.8 (encrypted records), "My contacts" in /contacts
(encrypted, tap-to-dial), checklist tick state (encrypted), and Settings > "Clear all my data": long-press 2s
+ confirm; wipes IndexedDB, localStorage, Cache Storage, unregisters service workers, returns to Home.
```

**P10 — PWA hardening (Block G)**
```
Configure vite-plugin-pwa (registerType autoUpdate, precache js/css/html/json/woff2/svg/png). Bundle the Noto Sans
Devanagari font via @fontsource (no CDN). Generate neutral icons (192/512 + maskable). Verify with the browser
Network tab set to Offline that every route works after the first load, and that there are zero external requests.
```

**P11 — Android (Block H)** — run the commands in §10, then:
```
Create capacitor.config.ts (appId org.example.nagrikguide, appName "Nagrik Guide", webDir dist, no server.url).
After `npx cap add android`, edit AndroidManifest.xml: remove INTERNET permission; set allowBackup=false and
usesCleartextTraffic=false. Add a README section "Build the APK". Confirm no network permission remains.
```

**P12 — QA pass (Block I)**
```
Run through PLAN.md §11 checklist. Fix every failure. Produce README.md (what it is, how to build, content
editing guide, review workflow, licences) and CHANGELOG.md.
```

---

## 10. Android packaging — commands

```bash
# 1. Create project (P1 does this for you)
npm create vite@latest nagrik-guide -- --template react-ts
cd nagrik-guide && npm i
npm i react-router-dom fuse.js idb-keyval @fontsource/noto-sans-devanagari
npm i -D vite-plugin-pwa tsx

# 2. Capacitor
npm i @capacitor/core @capacitor/app
npm i -D @capacitor/cli @capacitor/android
npx cap init "Nagrik Guide" "org.example.nagrikguide" --web-dir=dist

# 3. Build web + add Android
npm run validate && npm run build
npx cap add android
npx cap sync android

# 4. Edit android/app/src/main/AndroidManifest.xml
#    - DELETE:  <uses-permission android:name="android.permission.INTERNET" />
#    - In <application ...> set: android:allowBackup="false" android:usesCleartextTraffic="false"

# 5. Test on a real phone (USB debugging on)
npx cap open android      # opens Android Studio -> press Run on your phone

# 6. Release signing (keep keystore PRIVATE, back it up, never commit it)
keytool -genkey -v -keystore release.jks -alias nagrik -keyalg RSA -keysize 2048 -validity 10000
#    Android Studio: Build > Generate Signed App Bundle / APK > APK > release
#    Output: android/app/release/app-release.apk

# 7. Verify permissions (Android SDK build-tools)
aapt2 dump permissions android/app/release/app-release.apk
#    Expect NO android.permission.INTERNET
sha256sum android/app/release/app-release.apk   # publish this hash with the release
```

**Sample `capacitor.config.ts`:**
```ts
import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'org.example.nagrikguide',
  appName: 'Nagrik Guide',
  webDir: 'dist',
  android: { allowMixedContent: false }
};
export default config;
```

**Sample PWA plugin config:**
```ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: { globPatterns: ['**/*.{js,css,html,json,woff2,svg,png}'] },
  manifest: {
    name: 'Nagrik Guide', short_name: 'Nagrik Guide', display: 'standalone',
    start_url: './', background_color: '#ffffff', theme_color: '#1f3a5f',
    icons: [/* 192, 512, maskable */]
  }
})
```

**Troubleshooting:** blank screen → ensure `webDir` is `dist` and run `npx cap sync` after every web build; fonts missing → confirm `@fontsource` CSS is imported in `main.tsx`; PWA not updating → clear site data/unregister the service worker; Gradle errors → open in Android Studio and let it sync/install the SDK it asks for.

---

## 11. QA checklist (Block I)

**Offline & network**
- [ ] Phone in airplane mode: every screen opens, search works, Hindi renders.
- [ ] PWA: DevTools → Network shows zero external requests; Application → Service Worker active; works when "Offline".
- [ ] `aapt2 dump permissions` → no internet permission.

**Content integrity**
- [ ] `npm run validate` passes; every ref resolves.
- [ ] DRAFT banner visible on all `ai_draft` modules; badge shows "Last verified: not yet".
- [ ] Every module shows current **and** old section numbers where relevant.
- [ ] Scripts: English, Hindi, Roman Hindi all present; "Show to officer" works.

**Usability**
- [ ] 3-tap rule: each situation ≤ 2 taps from Home; each script ≤ 3 taps.
- [ ] Works one-handed on a small screen (≈ 360×640); text size A+ doesn't break layout.
- [ ] Quick exit works on Android and web.
- [ ] Low-end test: a 2 GB RAM phone opens the app in < 3 s.

**Privacy**
- [ ] Set PIN → notes unreadable in IndexedDB (inspect via DevTools).
- [ ] Wrong PIN delays increase; app locks after 60 s in background.
- [ ] "Clear all my data" leaves nothing (IndexedDB, localStorage, caches).
- [ ] No data in Android backups (`allowBackup=false`).

**Safety review (read as a skeptic)**
- [ ] Nowhere does the app advise resisting, evading, lying, or destroying evidence.
- [ ] Every "must/cannot" statement has a reference; gray areas are labelled.

---

## 12. Legal review workflow and release gates

### 12.1 Reviewer export
`npm run export:review` generates `REVIEW.md` (and printable PDF/Word via any tool) listing, per module: the text, each reference with current/old numbers, a checkbox "Correct / Needs change / Remove", and a comment line. Also exports a table of all `verify: true` refs and all `verifyCitation: true` cases.

### 12.2 Who to ask (today)
- Human-rights/civil-liberties organisations with legal teams (e.g., PUCL, Human Rights Law Network, Internet Freedom Foundation for the digital/shutdown modules).
- State Legal Services Authority / your District Legal Services Authority (they handle custody legal aid daily).
- Law-school legal aid clinics and local bar association legal-aid desks.
- Ask each reviewer to also check the **Hindi** (or arrange a Hindi-speaking advocate).

### 12.3 Gates
| Gate | Requirement | Allowed release |
|---|---|---|
| **G0 (today)** | App complete, all content `ai_draft`, DRAFT banners on | Private beta to reviewers/trusted testers only |
| **G1** | M01–M06 reviewed by ≥ 1 practising advocate; all `verify` flags cleared on those modules | Limited public release with banners on unreviewed modules |
| **G2** | All modules + Hindi reviewed by ≥ 2 advocates | Full public release; remove banners module-by-module |
| **G3 (ongoing)** | Re-verify every quarter and after any major judgment/amendment | Content updates (see §14) |

Update each module's `status`, `reviewers`, and `lastVerified` as reviewers sign off.

### 12.4 Risk register
| Risk | Mitigation |
|---|---|
| Wrong/outdated legal info | Review gates, visible review status, "verify" flags, quarterly re-verification |
| User over-relies on app | Disclaimer on every screen footer; "get a lawyer" prompts; gray-area boxes |
| Phone seized with app open | PIN, auto-lock, quick exit, neutral name, no data beyond user notes |
| Misuse/escalation | Content teaches compliance + lawful conduct; no evasion or incitement content |
| Store takedown / blocked site | Multiple distribution routes (§13); open source mirror |
| Scope creep | Stick to the cut order in §9.2 |

---

## 13. Distribution (so people have it **before** a shutdown)

1. **Direct APK:** GitHub Releases / your own site + published SHA-256 hash. Users enable "install unknown apps" for their browser/file manager once.
2. **Offline sharing between phones:** Android "Files by Google" can share apps offline (Apps tab → Share), or share the APK file via Bluetooth/Nearby Share/USB. Add these instructions in Settings → About ("Share this app").
3. **PWA link:** host `dist/` on any static host (GitHub Pages, Netlify, Cloudflare Pages). On first online visit, "Add to Home Screen" → works offline afterward. This is also the iOS route (Safari → Share → Add to Home Screen; must be opened once online).
4. **F-Droid** (needs open source, reproducible build — later) and **Google Play** ($25 developer fee, review takes days; prepare store listing and privacy statement: "collects no data").
5. **Printable wallet card:** one A6 page with the Ten Golden Rules (M01), S01–S07 in English/Hindi, and the emergency numbers (generate from the same JSON). Many people will have a paper copy when the phone is seized.

---

## 14. After today — roadmap

1. **Reviewer sign-off** → clear banners (G1 → G2).
2. **More languages:** Bengali, Marathi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Punjabi, Odia, Assamese, Urdu, and local languages (translation + legal review).
3. **State/district layer:** DLSA directory (numbers/addresses from NALSA/state authorities), local police-station complaint authorities, state-specific rules.
4. **Signed content packs:** reviewers publish a signed JSON content update; the app imports it via a file picker (works offline, shareable over Bluetooth) and verifies an Ed25519 signature before applying.
5. **Audio guidance** for low-literacy users (pre-recorded clips bundled offline).
6. **Wallet-card PDF generator** inside the app.
7. **Legal-observer mode:** structured note-taking for volunteers/lawyers observing a protest.
8. **Accessibility pass:** TalkBack, font scaling, colour-blind-safe palette.
9. **Security review** of the app by an independent auditor; reproducible builds.

---

## 15. Sources to verify against (do this before sharing widely)

Check each `verify: true` item against the **official text**, not blogs:
- **India Code** (indiacode.nic.in) — BNSS 2023, BNS 2023, BSA 2023, Legal Services Authorities Act 1987, Juvenile Justice Act 2015, Telecommunications Act 2023, National Security Act 1980, UAPA 1967, Prevention of Damage to Public Property Act 1984, Rights of Persons with Disabilities Act 2016.
- **Official comparison/correspondence tables** published by the Ministry of Home Affairs for BNSS↔CrPC and BNS↔IPC (use these to confirm every old↔new section mapping).
- **Constitution of India** (official text, with the 44th Amendment's changes to Arts. 358/359).
- **Supreme Court of India** website and official law reports for every case citation and holding (§7.4); read the actual judgment or an authoritative headnote.
- **NALSA** (nalsa.gov.in) and your **State Legal Services Authority** for legal-aid numbers, DLSA contacts, and the exact scope of free legal services.
- Official Gazette notifications for the **current telecom-suspension rules** under the Telecommunications Act 2023.
- Official police/State government pages for local helpline numbers (181, 1091, 108 vary by state).

---

## 16. Licences and credits
- Code: MIT or Apache-2.0. Content (`src/content/*`): CC BY 4.0, with credit to reviewing organisations once they agree.
- Include a `CONTRIBUTING.md` explaining how a lawyer can fix content by editing JSON (or by sending corrections as a plain document).

---

### Final reminder
The code can be done today. **Trust has to be earned through legal review.** Ship the beta to reviewers today, keep the DRAFT banners on until they sign off, and keep the app honest: it explains rights, it does not guarantee how anyone will behave, and it always points people toward a lawyer.
