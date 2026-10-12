# TSun WhatsApp Chat Viewer

<div align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/5968/5968841.png" alt="TSun Chat Viewer Logo" width="120" />
</div>

<h3 align="center">
  Transform your plain WhatsApp chat exports into a stunning, interactive, and luxurious visual experience — with a native-feeling Android app built in.
</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Badge"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Badge"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS Badge"/>
  <img src="https://img.shields.io/badge/Material_Design_3-00695C?style=for-the-badge&logo=materialdesign&logoColor=white" alt="Material Design 3 Badge"/>
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Badge"/>
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android Badge"/>
</p>

---

## ✨ Overview

TSun Chat Viewer is not just another text file reader. It parses your exported WhatsApp chat and renders it the way WhatsApp itself does — your messages on the right with delivery ticks, the other participants on the left, date chips, system notices, media placeholders — inside a Material Design 3 shell that installs on Android as an app and keeps working offline.

The UI is mobile-first and fully responsive: a compact single-column chat on phones (including landscape), a two-pane layout on tablets and desktops, and safe-area aware on notched devices.

<br>

<div align="center">
  <img src="https://i.imgur.com/gOJZLdF.png" alt="Screenshot of TSun Chat Viewer Interface" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
  <p><em>The elegant "Milk White Glass" interface in action.</em></p>
</div>

<br>

## 🚀 Key Features

### Chat rendering
- **WhatsApp-accurate bubbles** — outgoing messages right-aligned in WhatsApp green with single/double ticks, incoming messages on the left, tails, per-participant sender colours in groups.
- **“Who am I?” switch** — exports don't record the device owner, so tap the avatar → **Chat details** and pick yourself; your messages move to the right. The choice is remembered.
- **Full text formatting** — `*bold*`, `_italic_`, `~strikethrough~`, ```` ```monospace``` ````, links, emoji, and the custom `[rrggbb]text[c]` colour syntax.
- **Real export parsing** — 24-hour and 12-hour timestamps, `[bracketed]` iOS-style lines, unicode dashes, multi-line messages, system notices (rendered as centred chips) and `<Media omitted>` placeholders.
- **Live search** — filters the conversation as you type, highlights every match, and jumps to the first hit.

### Android / mobile experience
- **Installable PWA** — Add to Home screen, standalone window, splash screen, themed status bar, app shortcut, and offline support (the last chat is cached).
- **Material 3 UI** — top app bar that elevates on scroll and transforms into a search field, modal bottom sheets with drag-to-dismiss, FABs, snackbars, banners, ripple feedback from the exact touch point.
- **Android system integration** — the back gesture dismisses the topmost sheet instead of leaving the app, the on-screen keyboard is tracked so nothing hides behind it, and touch targets are 48dp with haptic ticks.
- **Pull-to-refresh**, long-press-to-copy a message, offline-safe initials avatars (zero external image requests).
- **Fast on real phones** — a compiled Tailwind stylesheet (no runtime CSS-in-JS CDN), paged rendering plus `content-visibility` for exports with tens of thousands of messages.

### Platform
- **Fully responsive** — 360 px phones through 4K desktops, portrait and landscape, notch and gesture-bar safe areas, `100dvh` sizing so the URL bar never breaks the layout.
- **Light & dark modes** — follows the Android system setting on first launch, then remembers your choice; the browser/status-bar colour follows the theme.
- **Strict TypeScript** and a real test suite (parser unit tests + app integration tests + headless layout verification).
- **Custom styled scrollbar**, reduced-motion support, and keyboard-accessible controls with visible focus rings.

---

## 📱 Android

Three ways to run it on Android — details in **[docs/ANDROID.md](docs/ANDROID.md)**.

| Option | How |
| --- | --- |
| **PWA (recommended)** | Open the deployed site in Chrome → **Install app** (or use the in-app banner). Full-screen, offline, home-screen icon. |
| **Native APK** | `npm run build` → `npx cap add android` → `./gradlew assembleDebug` (Capacitor config in `capacitor.config.json`). |
| **CI-built APK** | Drop the workflow from [docs/ANDROID.md](docs/ANDROID.md#3-build-the-apk-in-ci) into `.github/workflows/`, then Actions → *Run workflow* → download the artifact. |

Android behaviours wired into the web app: system back gesture handling
(`hooks/useBackHandler.ts`), keyboard insets (`hooks/useKeyboardInset.ts`),
install prompt (`hooks/useInstallPrompt.ts`), pull-to-refresh
(`hooks/usePullToRefresh.ts`), haptics (`utils/haptics.ts`), and safe-area /
`dvh` layout rules (`styles/android.css`).

---

## 📐 Responsive layout

| Width | Layout |
| --- | --- |
| `< 480 px` | Full-bleed chat, 56 px app bar, bubbles up to 85 % width, bottom sheets, FABs |
| `480–767 px` | Same single column, slightly wider bubbles (75 %), search opens in the app bar |
| `768–1023 px` | Tablet: inline search field in the app bar, 65 % bubbles, credits footer visible |
| `≥ 1024 px` | Two panes: chat + participant sidebar with chat stats and quick actions |
| Landscape phone | Shorter app bar (56 px), same content, no wasted vertical space |

The chat scrolls inside a `100dvh` shell (no page scroll), so the app bar stays
pinned exactly like a native app.

---

## 🛠️ How to Use

1. **Export your WhatsApp chat** — open the chat → ⋮ → `More` → `Export chat` → **Without media**. Save the `.txt` file.
2. **Publish it somewhere the browser can read** — e.g. paste the contents into a [GitHub Gist](https://gist.github.com/) and copy the **Raw** URL (`https://gist.githubusercontent.com/...`).
3. **Load it in TSun Chat Viewer** —
   - paste the raw URL into the *Load a WhatsApp chat* sheet and tap **View chat**, **or**
   - tap **Open a .txt export from this device** and pick the file straight from Android Files / Downloads, **or**
   - tap **Try a sample chat** to explore the UI immediately.
4. Tap the avatar in the app bar → **Chat details** → choose which participant you are.

Nothing is uploaded: the file is fetched or read locally in your browser.

---

## 💻 Tech Stack

- **Frontend:** [React 19](https://react.dev/) with hooks (no state library)
- **Language:** [TypeScript](https://www.typescriptlang.org/) in `strict` mode
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) compiled at build time via PostCSS, plus a small Material 3 layer in `styles/android.css`
- **Icons:** [lucide-react](https://lucide.dev/)
- **Build:** [Vite 6](https://vite.dev/)
- **Tests:** [Vitest](https://vitest.dev/) + Testing Library (jsdom), and [Playwright](https://playwright.dev/) for headless layout verification
- **Packaging:** Web App Manifest + Service Worker (PWA), optional [Capacitor](https://capacitorjs.com/) shell for a native APK

---

## 🧱 Project Structure

```
├── App.tsx                     # app shell: state, data loading, sheets, snackbar
├── index.html                  # Android/PWA meta, boot splash, Roboto
├── index.tsx                   # mount + service-worker registration
├── components/
│   ├── AppBar.tsx              # Material 3 top app bar (elevates, expands to search)
│   ├── ChatView.tsx            # chat canvas: paging, pull-to-refresh, scroll FABs
│   ├── MessageBubble.tsx       # WhatsApp bubbles, formatting, long-press to copy
│   ├── ChatSidebar.tsx         # tablet/desktop participant pane
│   ├── ChatMenuSheet.tsx       # overflow menu (bottom sheet)
│   ├── LoadChatSheet.tsx       # load from URL / device file (bottom sheet)
│   ├── ParticipantsSheet.tsx   # chat details + “which one is you?”
│   ├── InstallBanner.tsx       # Android install banner
│   ├── Footer.tsx              # credits (tablet/desktop)
│   └── ui/                     # Material primitives: Button, IconButton, Fab, BottomSheet, Snackbar, Avatar
├── hooks/                      # useRipple, useBackHandler, useKeyboardInset, usePullToRefresh,
│                               # useInstallPrompt, useDevice
├── utils/                      # parser.ts (WhatsApp export parser), clipboard, haptics
├── styles/android.css          # Material 3 foundations: safe areas, ripple, motion, canvas
├── public/                     # manifest.webmanifest, sw.js, icons, sample-chat.txt
├── scripts/verify-ui.mjs       # headless responsive/Android layout verification
├── test/setup.ts               # jsdom stubs (matchMedia, clipboard, scroll APIs)
└── docs/ANDROID.md             # PWA install + native APK guide
```

---

## 🚀 Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production bundle in dist/
npm run preview      # serve the production build

npm run typecheck    # strict TypeScript, no emit
npm test             # unit + integration tests
npm run verify:ui    # Playwright screenshots + layout assertions
```

`npm run verify:ui` expects Playwright (`npm i -D playwright && npx playwright
install chromium`) once, a running
`npm run preview`, and writes screenshots to `ui-screenshots/`. It fails if any
viewport overflows horizontally, clips a bubble, shows the sidebar on a phone, or
reports a runtime error.

---

## 🙏 Credits & Acknowledgements

- **Development:** Made With 🫀 By ༯𝙎ค૯𝙀𝘿✘🫀
- **Studio:** All Credits To TSun Studio
- **Icons:** [lucide.dev](https://lucide.dev/)

---

This project is open-source and available for personal use. Feel free to fork, modify, and share!
