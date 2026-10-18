# 03 . Nativewind

Status: done

## Goal

The app styles with `className` through NativeWind v5, matching `AGENTS.md`. A fresh checkout can run `npx expo start`, import `src/global.css` once, and render a styled screen on native and web. This is the groundwork the design system (02) builds its tokens on.

## Decisions

- **NativeWind v5 RC, not stable.** Use `nativewind@5.0.0-rc.0` with its exact engine pair `react-native-css@3.1.0-rc.0` (`--save-exact`). Stable `nativewind@4.2.7` is Tailwind v3 + a Babel preset and only claims Expo SDK 57 support; this project is Expo 58.0.14 / RN 0.88.0 / React 19.3.0, which is inside the RC engine's declared minimums (`react-native >=0.81`, `@expo/metro-config >=54`, `react >=19`). `AGENTS.md` already records this choice.
- **Tailwind v4 CSS-first.** No `tailwind.config.js`. Tailwind 4.1.12 + `@tailwindcss/postcss` 4.1.12 + `postcss` + `lightningcss` 1.30.1, pinned exactly, plus a `package.json` `overrides` entry forcing `lightningcss` 1.30.1 (the guide warns of `global.css` deserialization errors otherwise).
- **CSS lives at `src/global.css`** (not the guide's root `./global.css`), because `AGENTS.md` and the design-system section point there and it keeps app files under `src/`. Imported once in `src/app/_layout.tsx`.
- **`postcss.config.mjs`**, not `.cjs`: Expo 58 discovers `.js`/`.mjs` only. (Same constraint the guide states for Expo 57.)
- **No `babel.config.js`.** The v5 Metro integration applies the className import rewrite; the v4 Babel preset and `jsxImportSource` are gone. `AGENTS.md` states this.
- **`userInterfaceStyle` stays `"automatic"`** as the guide requires for `dark:`. Switching to light-only is the design-system task (02).
- **Committed `nativewind-env.d.ts`** with the `react-native-css/types` reference, so `npx tsc --noEmit` works without first booting the dev server (the generator would otherwise create it).
- **Defaults picked without asking:** no `@source` directives until a class actually lives outside `src/`; no `prettier-plugin-tailwindcss` (no Prettier config in the repo); no design tokens or fonts (that is 02); `withNativewind` takes no options (defaults `globalClassNamePolyfill: true`, `typescriptEnvPath: "nativewind-env.d.ts"`).
- **Verification is Windows-only.** There is no iOS simulator here, so the checks are the Tailwind CLI, `expo export` for native + web, type check, lint and doctor. The simulator comparison stays with the user.

## Out of scope

- Design tokens, `@theme` values, the font ramp, radius/shadow scale, motion values (02-system-design).
- `Stack.Protected` route guards, Clerk, tabs, any screen beyond the smoke test.
- Dark mode values. `dark:` variants compile, but nothing uses them yet.
- Migrating anything from v4 — nothing was ever installed.

## Steps

Each step leaves the app working (`npx expo start` still boots).

### 1. Install the pinned dependency set

From the project root:

```bash
npm install --save-exact nativewind@5.0.0-rc.0 react-native-css@3.1.0-rc.0
npx expo install react-native-reanimated react-native-worklets react-native-safe-area-context expo-system-ui
npm install --save-dev --save-exact tailwindcss@4.1.12 @tailwindcss/postcss@4.1.12 postcss lightningcss@1.30.1
```

Then add to `package.json` (sibling of `devDependencies`, after `scripts` is fine):

```json
"overrides": {
  "lightningcss": "1.30.1"
},
"private": true
```

Keep the existing `private: true` line as the last key. Add `nativewind-env.d.ts` to nothing yet.

Done when: `npm ls nativewind react-native-css lightningcss` shows `5.0.0-rc.0`, `3.1.0-rc.0` and a single deduped `1.30.1`, and `npx expo-doctor` reports no new dependency issues. Note `reanimated 4.7.1` / `worklets 0.13.0` / `safe-area-context 5.10.1` are already the SDK 58 versions, so `expo install` should not move them; if it does, keep its answer.

### 2. Tailwind and PostCSS config

Create `postcss.config.mjs`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

Create `src/global.css`:

```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";

@import "nativewind/theme";
```

Keep the utilities import unlayered — a single `@import "tailwindcss"` can drop utilities below React Native Web's base styles. Reuse the deleted `src/global.css` from the initial commit only for its `:root` font variables if a later task needs them; they are not part of this step.

Done when: `npx @tailwindcss/cli@4.1.12 --input ./src/global.css --output ./tw-check.css` exits 0 and the file contains a `:root`/`@theme` block. Delete `tw-check.css` after looking.

### 3. Metro config

Create `metro.config.js` at the root (equivalent to `npx expo customize metro.config.js` plus the wrapper):

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config);
```

Note the lowercase `w` in `withNativewind` (v5 spelling; `withNativeWind` also still works). There is no `input` option in v5 — the import in step 4 is what registers the stylesheet.

Done when: `npx expo-doctor` still passes and `npx expo start --clear` reaches the Metro prompt without a config error.

### 4. Import the stylesheet once

In `src/app/_layout.tsx`, add `import "../global.css";` as the first line, above the `expo-router` import. Change nothing else in the file.

Done when: the dev server starts and its log has no CSS/metro transform error.

### 5. TypeScript

Create `nativewind-env.d.ts` at the root:

```ts
/// <reference types="react-native-css/types" />

// NOTE: This file should not be edited and should be committed with your source code. It is generated by react-native-css. If you need to move or disable this file, please see the documentation.
```

`tsconfig.json`'s `include` already covers it via `**/*.ts`, so no tsconfig change. Do not name it `nativewind.d.ts`.

Done when: `npx tsc --noEmit` passes and `className` on a `<View>` type-checks.

### 6. Smoke test the placeholder screen

Rewrite `src/app/index.tsx` to use `className` instead of `StyleSheet`, keeping the same copy:

```tsx
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Hi Welcome to Roam Mobile App.
      </Text>
    </View>
  );
}
```

This is the guide's "try it out" element and the only screen that exists. Note `verifyInstallation` is not an RC0 export — a visibly styled element is the check.

Done when: the screen renders centered blue bold text on a white background.

## Verification

Run from the project root, in order.

1. `npm ls nativewind react-native-css tailwindcss lightningcss @tailwindcss/postcss` — expect `5.0.0-rc.0`, `3.1.0-rc.0`, `4.1.12`, one `1.30.1`, `4.1.12`.
2. `npx tsc --noEmit` — passes with the `className` props in `src/app/index.tsx`.
3. `npx expo lint` — passes.
4. `npx expo-doctor` — no new failures versus before this change.
5. Tailwind compile: `npx @tailwindcss/cli@4.1.12 --input ./src/global.css --output ./tw-check.css`, then confirm `tw-check.css` contains the utilities actually used in `src/app/index.tsx` (`.flex-1`, `.bg-white`, `.text-blue-500`, `.font-bold`, `.text-xl`). If they are missing, Tailwind's source discovery is not reaching `src/` from `src/global.css`; fix by adding `@source "../src";` to `src/global.css` and re-run. Delete `tw-check.css`.
6. Integration: `npx expo export --platform web` and `npx expo export --platform ios` both complete, proving the Metro transform and the CSS pipeline survive a full bundle. Inspect the web export's CSS for `.text-blue-500`.
7. `npx expo start --clear`, then open the app (Android emulator, or `w` for web — no iOS simulator on Windows) and confirm the step 6 screen: centered blue bold text on white, no red-box error about `nativewind/metro` or `react-native-css`.
8. End to end: edit the `Text` className to `text-red-500 text-2xl`, save, and confirm Fast Refresh restyles the text without a reload.

Not checkable here: iOS simulator render and `dark:` appearance changes (needs macOS + a device). Flag both as ❌ in the report with that reason.

## AGENTS.md updates

The Expo section already states the v5 decision, so mostly this confirms it and adds the file inventory later tasks depend on:

- Expo section, styling bullet: keep, and add that the pipeline is `postcss.config.mjs` (`@tailwindcss/postcss`) + `metro.config.js` (`withNativewind`) + `nativewind-env.d.ts`, with Tailwind 4 discovering sources from `src/` (add `@source` only if a file with classes lands outside `src/`). Note `@import "nativewind/theme"` is what supplies the `ios:`/`android:`/`native:`/`web:` variants and platform fonts.
- Expo section: note the Tailwind CLI one-liner used to check class generation without Metro.
- Who owns what: nothing new — `nativewind/theme` is the token entry point the "Design system" section will edit, and that section already exists.
- Rules: no change. `AGENTS.md` is at 115 lines; keep the edits to a net +3 lines at most.

## Result

Built. The app styles with `className` through `nativewind@5.0.0-rc.0` + `react-native-css@3.1.0-rc.0`, Tailwind `4.1.12` / `@tailwindcss/postcss@4.1.12` / `postcss` pinned exactly, and `lightningcss` forced to `1.30.1` with a `package.json` `overrides` entry (all four dependency paths dedupe to it).

New: `postcss.config.mjs`, `src/global.css`, `metro.config.js`, `nativewind-env.d.ts`, and `eslint.config.js` (the last created by `expo lint` itself). Changed: `src/app/_layout.tsx` (imports `../global.css`), `src/app/index.tsx` (className smoke test), `package.json`, `tsconfig.json` (`nativewind-env.d.ts` added to `include` by `expo-doctor`), `.gitignore` (`dist/` → `dist*/`, by Expo tooling while exporting).

Verified: `npm ls` shows the exact RC pair and a single `lightningcss@1.30.1`; `npx tsc --noEmit` and `npm run lint` both exit 0; `expo-doctor` 20/20; the Tailwind CLI emits every utility the screen uses; `expo export --platform web` emits an 11 KB stylesheet containing them; `expo export --platform ios` bundles a 4.1 MB `.hbc` whose string table holds the class names plus `react-native-css`; and a `--clear` dev server run serves SSR HTML with the screen text, `font-weight:bold`, and a 9.8 MB iOS bundle with no warnings. Not verifiable here: how it looks on iOS or Android — Windows has no simulator.

Discovered: `npx` injects `--allow-scripts`, which npm 12 rejects for project-scoped installs (`EALLOWSCRIPTS`), so `npx expo install` / `npx expo lint` cannot install anything. `./node_modules/.bin/expo install` does work, and the Commands block now records that. No app code depends on this; it is an install-time issue only.

Two decisions taken after the build, on your call. `expo lint`'s `eslint@^9` + `eslint-config-expo@~58.0.4` and its generated `eslint.config.js` stay, because lint cannot run without them. And `package.json` gained an `allowScripts` field approving the `@tailwindcss/oxide@4.1.12` and `unrs-resolver@1.12.2` postinstalls, which were blocked by npm 12's default-deny; `npm rebuild` ran them and a later `npm install` is warning-free. That field overrides the user-level `.npmrc` `allow-scripts`, which is harmless here because it names a package this project does not use.

