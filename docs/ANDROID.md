# Running TSun Chat Viewer on Android

The app is built mobile-first, so it feels like a native Android application in
three different ways — pick whichever suits you.

| Option | Effort | What you get |
| --- | --- | --- |
| **1. PWA (recommended)** | none | Full-screen standalone window, home-screen icon, offline support, app shortcuts, splash screen, no Play Store review |
| **2. Native APK (Capacitor)** | ~5 min | A real `.apk` you can sideload or publish |
| **3. CI-built APK** | none | Same as (2), built by GitHub Actions |

---

## 1. Install as a PWA

1. Serve the app over **HTTPS** (or `localhost`). A production build works out of
   the box:

   ```bash
   npm ci
   npm run build
   npm run preview -- --host        # http://localhost:4173
   ```

2. Open it in **Chrome on Android**.
3. Either tap the in-app **Install on Android** banner, or open the ⋮ menu and
   choose **Add to Home screen / Install app**.

What makes it behave like a native app on Android:

- `public/manifest.webmanifest` — `display: standalone`, portrait/landscape,
  maskable icons, `theme_color` (`#00a884`), a *Open last chat* app shortcut.
- `public/sw.js` — offline-first app shell; the last loaded chat export is cached
  with a stale-while-revalidate strategy, so it opens without a connection.
- `index.html` — `viewport-fit=cover` + `interactive-widget=resizes-content`, so
  the layout extends under the notch and the keyboard resizes (instead of
  scrolling) the app.
- `styles/android.css` — `env(safe-area-inset-*)` variables, `100dvh` sizing,
  `overscroll-behavior-y: none` (kills the browser's pull-to-refresh), Roboto,
  and the Material ripple keyframes.
- `hooks/useInstallPrompt.ts` — captures `beforeinstallprompt` so install can be
  triggered from an in-app Material banner.
- `hooks/useBackHandler.ts` — the system back gesture dismisses the topmost
  bottom sheet instead of leaving the app.
- `hooks/useKeyboardInset.ts` — tracks the on-screen keyboard via
  `visualViewport` and exposes it as `--keyboard-inset` for floating actions.

---

## 2. Build a native APK locally

Requirements: Node 18+, JDK 17/21, Android SDK (Android Studio or
`cmdline-tools`).

```bash
npm ci
npm run build

# Capacitor wrapper (config lives in capacitor.config.json)
npm install --no-save @capacitor/cli@^6 @capacitor/core@^6 @capacitor/android@^6
npx cap add android        # creates ./android (git-ignored)
npx cap sync android

cd android
./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

Install on a connected device:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

For a release build, create a keystore and run `./gradlew assembleRelease` with
`android/app/build.gradle` configured for signing, or use **Android Studio →
Build → Generate Signed Bundle / APK**.

After changing web code, re-run `npm run build && npx cap sync android`.

---

## 3. Build the APK in CI

Save this as `.github/workflows/android-apk.yml` (add it through the GitHub UI
or with a token that has the `workflows` scope) and it will build a debug APK on
demand: **Actions → Android APK → Run workflow** → download the
`tsun-chat-viewer-debug-apk` artifact. It also runs on `v*` tags.

```yaml
name: Android APK

on:
  workflow_dispatch:
  push:
    tags:
      - 'v*'

jobs:
  build-apk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Type-check and test
        run: |
          npm run typecheck
          npm test

      - name: Build web bundle
        run: npm run build

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'

      - uses: android-actions/setup-android@v3

      - name: Add Capacitor Android platform
        run: |
          npm install --no-save @capacitor/cli@^6 @capacitor/core@^6 @capacitor/android@^6
          npx cap add android
          npx cap sync android

      - name: Build debug APK
        working-directory: android
        run: |
          chmod +x gradlew
          ./gradlew assembleDebug --no-daemon

      - uses: actions/upload-artifact@v4
        with:
          name: tsun-chat-viewer-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
          if-no-files-found: error
```

---

## Android-specific behaviour implemented in the web app

| Feature | Where |
| --- | --- |
| Material 3 top app bar, elevation on scroll, in-bar search transform | `components/AppBar.tsx` |
| Ripple feedback from the touch coordinate, on `pointerdown` | `hooks/useRipple.ts`, `styles/android.css` |
| Modal bottom sheets with drag-to-dismiss + scrim | `components/ui/BottomSheet.tsx` |
| Overflow menu as a bottom sheet, FABs, snackbars, banners | `components/ChatMenuSheet.tsx`, `components/ui/Fab.tsx`, `components/ui/Snackbar.tsx`, `components/InstallBanner.tsx` |
| System back gesture support (single history sentinel, nested layers) | `hooks/useBackHandler.ts` |
| Pull-to-refresh on the chat canvas | `hooks/usePullToRefresh.ts` |
| Haptic ticks (guarded to touch devices) | `utils/haptics.ts` |
| WhatsApp-style bubbles: own messages right/green with ticks, system chips, media placeholders | `components/MessageBubble.tsx`, `utils/parser.ts` |
| Offline-safe initials avatars (no network image requests) | `components/ui/Avatar.tsx` |
| Windowing for very large exports (`content-visibility`, paged rendering) | `components/ChatView.tsx` |
| Two-pane tablet/desktop layout | `components/ChatSidebar.tsx`, `App.tsx` |

## Verifying on Android

```bash
npm run typecheck     # strict TypeScript
npm test              # parser + app integration tests (jsdom)
npm run build && npm run preview &
npm run verify:ui     # headless screenshots + layout assertions (Playwright)
```

On a device, check: rotation, the keyboard over the bottom sheet, the back
gesture, install prompt, and dark mode following the system setting on first
launch.
