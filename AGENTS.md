# Roam

Expo React Native rental app. Guests describe a stay in one sentence ("quiet pet friendly cabin with a hot tub under $300 a night") and get ranked stays back. They can also ask booking and policy questions about a stay, answered with exact text from Roam's own content.

This file is the project's memory: it holds every decision that is still true. Plans in `prompts/` are history.

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm install: resolves SDK-compatible versions
npm install               # fallback when `expo install` dies on npm's allow-scripts check
npx expo start              # dev server (press i for the iOS simulator)
npx expo start --clear      # restart the dev server after a metro.config.js change — the resolver is read at startup
npx expo lint               # lint
npx tsc --noEmit            # type check
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
npx eas-cli@latest <cmd>    # EAS builds, submits, and updates (use instead of bare `eas`)
```

## Expo

- Expo ships breaking changes every SDK release, so don't trust memory. Before touching an Expo, EAS, or React Native API, check the `expo` major version in `package.json` and read `https://docs.expo.dev/versions/v<major>.0.0/`. For anything else, start from https://docs.expo.dev/llms.txt and follow its links.
- Routes live in `src/app/`: every file is a screen and `_layout.tsx` files define navigators. API routes are `src/app/api/*+api.ts`. Keep components, hooks, and utils outside `src/app/`. Today: `/` is onboarding, `/sign-in`, `/sign-up`, `/verify-email`, `/home` behind a session guard, `/design-system` always open. `/` is the signed-out anchor, so the post-auth screen must not also be an `index.tsx` — that collides on `/`.
- `ios/` and `android/` are generated. Never create or edit them by hand; configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, switch to a development build (`npx expo run:ios`).

## Who owns what

Each tool has one job. Ask before moving a responsibility to a different tool.

- **Auth:** Clerk is the source of truth. The app keeps its own custom auth screens. Set Clerk up through the Clerk CLI and use the Clerk MCP for current Expo patterns. Clerk is **not installed yet**: `src/auth/session.tsx` is a mock behind a `useSession()` seam, and `Stack.Protected` in `src/app/_layout.tsx` guards on it. Clerk replaces the bodies of `signIn`/`signUp`/`verifyCode` and nothing else — screens, the guard, and the hook signature stay. The mock keeps nothing, so every reload returns to onboarding.
- **Content:** Sanity (properties, hosts, policies, house rules). Studio is a standalone app in `studio/`. Schema deploys and content changes go through the Sanity MCP, and generated property copy uses Agent Actions.
- **Exact constraints** (price, guests, type, amenities, pets, place): GROQ filters, with values always passed as params.
- **Soft intent** (quiet, cozy, secluded): Dataset Embeddings via `text::semanticSimilarity()` inside `score()`.
- **Policy knowledge:** a Sanity Context endpoint in Knowledge Base mode. Context endpoints are created in the Dashboard's Context app and read with an organization token (Context Viewer), per https://www.sanity.io/docs/ai/context-migration-guide. One endpoint serves one mode. The Context skill still describes `sanity.agentContext` Studio documents with a project token; that route is deprecated, so don't use it.
- **Typed decisions** (which stay topics and policies answer a question): Jev, called from API routes through the AI SDK's `experimental_evaluate` with the `@ai-sdk/typesafe-ai` provider and `TYPESAFE_AI_API_KEY`. No Vercel AI Gateway. Keep `ai` and `@ai-sdk/typesafe-ai` pinned to exact versions, since the API is experimental.
- **Answer text:** none generated. Answers show the stay's own fields and policy text word for word, with their source. No LLM runs in the app.
- **Analytics:** PostHog, identified through Clerk.

## Rules

- Secret keys (Clerk secret key, TypeSafe key, Sanity organization token, Sanity write token) never reach the app bundle. Use them only in API routes and local scripts such as seeding. Never put them behind `EXPO_PUBLIC_`, which is bundled into the app. Never commit `.env`. Keep variable names, without values, in `.env.example`.
- Sanity Context needs a deployed Studio for the dataset. Redeploy Studio from `studio/` after schema changes.
- Jev is not an agent. It answers typed questions (Choice, Noul, Score) with probabilities. It never writes GROQ, calls tools, or generates text. Code builds queries from its answers.
- Prices, guest counts, and dates are parsed in code. Jev may choose between candidates code found, but never produces the value.
- Embeddings rank, they don't filter, and they only see the document itself (no references). Hard constraints are always GROQ filters, and text that should affect ranking lives on the property document.
- Policy answers show only text from the stay's data and Roam's policies, word for word. If nothing answers the question, say so and point to support.
- API routes verify the Clerk session before doing any work.
- PostHog failures never block the app. Never send what guests type, tokens, or personal data in events.
- Let Sanity generate document IDs. Model relationships as references.
- Ask before adding a dependency or service, changing the Sanity schema once content exists, or deleting data. Prefer Expo modules over third-party libraries.
- Whenever you need input from the user, ask through your tool's built-in question panel so they pick from options instead of typing. Give two to four clear options with the recommended one first. Fall back to plain text only if no such panel exists.

## How we build features

For a new feature or a change across several files. Small fixes and questions skip this.

1. **Understand.** Read the code involved. Open an earlier plan only if this feature builds directly on it (pick by file name). Read the current docs pages for the APIs you'll use, and load a matching skill if one exists (e.g. the Expo, Clerk, Sanity, Sanity Context, or TypeSafe skills). Don't write version-specific APIs from memory.
2. **Ask.** If a real decision is unclear (scope, visible behavior, data shape), ask in the question panel, batching questions into one round and following up only if the answers raise new ones. Pick defaults for the rest and list them. If a decision in this file looks wrong, raise it instead of changing it.
3. **Plan.** Copy `prompts/TEMPLATE.md` to `prompts/NN-feature-name.md` (next number) and fill it in. Write decisions as tables, never bullets, and add a Mermaid diagram only where it clarifies a chain or a branch. The plan must be self-contained, so a fresh session can build it from this file plus the plan alone.
4. **IMPORTANT: stop and wait.** Write no app code until the user approves the plan. Ask for approval in the question panel (approve, or request changes). If they request changes, update the plan and ask again. On approval, set `Status: approved`.
5. **Build** step by step, checking each one. If a step turns out wrong, stop and explain instead of redesigning.
6. **Close out.**
   - Run the plan's Verification and give the report described under Reporting.
   - Add a short `## Result` to the plan and set `Status: done`.
   - Update this file: put each lasting decision in the section it belongs to. Replace or remove rules that are no longer true instead of appending. Keep this file under 150 lines.

## Building from designs

Designs are attached in the chat. Screens must match them exactly: layout, spacing, sizes, colors, type, radii, icons, and copy.

- Icons, fonts, and brand images come from `assets/` or the chosen icon library, never recreated from a screenshot. Sample property photos may be remote placeholder images. If an asset is missing, use a marked placeholder and list it.
- Map every color, font, spacing value, and radius to a design-system token. List values with no token in the plan as proposed new tokens instead of hardcoding them. When creating the design system itself, derive the tokens from the designs.
- UI plans describe the design (elements, states, tokens, assets) well enough to build without the image. If building in a new session, ask for the design to be attached again.
- After building, open the screen in the iOS simulator (deep link with `xcrun simctl openurl booted <url>` when it isn't the first screen; the scheme is in `app.json`), take a screenshot (`xcrun simctl io booted screenshot <path>`), and compare it with the design. List every difference, fix, and repeat. Report which values were estimated from an image.

## Design system

- Tokens live only in `src/global.css`: an `@theme` block maps `--color-*`, `--spacing-*` (4px grid), `--radius-*`, and the `--text-*` ramp to the `--roam-*` values. No hex, font size, or arbitrary `[..]` utility outside `global.css`.
- **Dark mode is not CSS.** Do not put dark values in a `@media (prefers-color-scheme: dark)` block — that compiles and ships but never applies to `:root` custom properties on Android, so every scheme readout said `dark` while the page rendered light. `:root` in `global.css` is the light default only. Dark lives in `src/theme/variables.ts`, and `<ThemeProvider>` (`src/components/theme-provider.tsx`) supplies the active set through react-native-css's `VariableContextProvider`, mounted once in the root layout. One value — `useColorScheme()` — drives the CSS half and everything JS.
- **The theme barrel is a leaf.** `src/theme/index.ts` is imported by screens and components, never by the theme modules themselves. `colors.ts` is data only and imports nothing, the `useThemeColors` hook lives in `use-theme-colors.ts`, and `theme-provider.tsx` imports `@/theme/variables` directly. Any other arrangement closes the cycle `theme-provider → theme/index → theme/colors → theme/theme-context → theme-provider`, which Metro warns about and which breaks as soon as a module-level constant reads across it.
- `--text-*--line-height` must be a unitless ratio. A single-line `TextInput` must use `--text-field` (size only, no line-height); any line-height on one wraps and clips the field on iOS. Text inside a capsule (`Chip`, `Badge`, `StatusAlert`) also needs `leading-none`, because the 1.4 caption ratio leaves the glyphs sitting low in their line box next to the icon.
- Color tokens: `primary`/`star` `#FFC629`, `lavender` `#C984F4`, `on-primary` `#0B0B1A` (fixed in both schemes), `on-lavender` (flips), `foreground` `#0B0B1A`, `muted` `#6B7280`, `surface` `#FFFFFF`, `background` `#F4F5F7`, `border` `#E5E7EB`, plus `lavender-tint`, `glass`, `scrim`/`on-scrim` (fixed in both schemes — a dimmed photo looks the same over a light image as a dark one), `success`/`error` with `success-tint`/`error-tint`, `star-tint`, `info-tint`. `primary` and `star` are deliberately the same yellow: one value, two intents. `glass` is white and `scrim` is dark; use whichever reads against what is behind it.
- Radii: `control` 12, `card` 16, `sheet` 32, `full`. `sheet` exists for large surfaces that rise off the bottom of the screen, not for cards.
- Type ramp: `display` 60, `hero` 32, `heading` 28, `title` 18, `body` 16, `caption` 14, `button` 17, `field` 16. `display` is the wordmark's step, so screen headlines use `hero` rather than shouting over the logotype. The sheet steps (`display`, `heading`, `body`, `caption`, `button`) come from section 03 of `design.png`; `hero` and `title` are the app's two extra steps, confirmed with the user. Weights are in `ThemedText`, not in the tokens. Text goes through `<ThemedText variant tone weight>`; icon color is always a `tone` prop, never a second `text-*` class, because conflicting classes resolve by CSS order.
- **One size and one weight per text element.** React Native's cascade follows the compiled CSS order, not the order of the classes, so two `text-*` or two `font-*` utilities in one class list resolve by whichever Tailwind happens to emit last. `ThemedText` keeps size, weight and tracking in separate slots for that reason, and its `weight` prop replaces the variant's weight instead of adding a second one.
- **The font is Poppins**, the closest match to the design's "Geometric Sans" (single-storey `a`, circular bowls, splayed `M`). The five cuts (400/500/600/700/800) are vendored in `assets/fonts/` under the SIL OFL 1.1, and loaded at runtime by `expo-font` in `src/app/_layout.tsx` as one family with five faces, so `fontFamily` plus `fontWeight` picks a real face on both platforms. The default face must stay first in that list — React Native falls back to the first name when it cannot match a weight. React Native has no font inheritance, so every text element carries `font-sans`; `ThemedText` does it for you, and a raw `Text` or `TextInput` needs it explicitly.
- `--font-sans` is set in a plain `:root` block in `global.css`, **after** `@import "nativewind/theme"`, and that is the only form that works: react-native-css keeps every `:root` declaration as a runtime variable and resolves the first entry whose media query matches, so a block there beats nativewind's `System` / `SystemAndroid` values on iOS and Android. A `@theme` entry would only be the fallback for platforms that match neither `@media ios` nor `@media android`.
- **`react-native` is wrapped by `src/native.ts`.** `react-native-css` re-exports React Native by hand so its components can take a `className`, and its resolver points every `react-native` import at that barrel. The hand-written list misses `AssetRegistry`, which `expo-asset` needs to resolve a bundled asset, so every `require()`-style asset — the fonts among them — fails with "Cannot read property 'getAssetByID' of undefined". The wrapper is the barrel plus that one export, and `metro.config.js` points the resolver at it. The wrapper's own import of `react-native` has to keep resolving to the real package, or the two cycle.
- JS-only values live in `src/theme/`: `colors.ts` (light/dark pairs + `useThemeColors()`, for APIs that can't take `className`: `SymbolView.tintColor`, `Switch.trackColor`, `ActivityIndicator.color`, `GlassView.tintColor`) and `shadows.ts` (`boxShadow` strings as `ViewStyle`, the RN 0.76+ prop — never legacy `shadow*`/`elevation`). `variables.ts` builds the `--roam-*` sets from `colors.ts`, so there is still one list of literals.
- **One scheme value.** `useColorScheme()` is the source of truth: `ThemeProvider` derives the CSS `--roam-*` variables from it, and every JS-side value already reads it through `useThemeColors()`. To force a scheme, call `applyColorScheme()` in `src/theme/scheme.ts` and reset it on the way out of a preview screen. Never call `Appearance` directly, and never react-native-css's `colorScheme` — on web its `set()` invokes the `Appearance.setColorScheme` that react-native-web does not have.
- Primitives live in `src/components/ui/`: `ThemedText`, `Button`/`IconButton`, `InputField`, `Chip`, `Card`, `Badge`, `ProfileRow`, `StatusAlert`, `SegmentedControl`, `Toggle`, `Stepper`, `Icon`, `Wordmark`, `TabBar`. Each takes `className` for layout and `style` merged last. Promote a view there only once two screens use it. Native controls stay native (`Toggle` wraps `Switch`). `Button`'s `trailingIcon` is an `IconName`; its `leading` is a `ReactNode` slot for anything the glyph set cannot express.
- `Wordmark` renders the `roam` logotype from the type ramp (`extrabold` + tight tracking), not as an image, so it scales with Dynamic Type and repaints with the theme. It is a stand-in: the design draws the wordmark as a bespoke geometric logotype, and a typeface only gets close. Replace it with the brand's vector asset when that exists — do not trace the wordmark out of a screenshot.
- `Icon` names are SF Symbols + Material pairs in `icon.tsx`; add a glyph there rather than passing a raw symbol name. No emoji iconography. Brand marks are not in that set and never will be: they live in `src/components/brand/`, drawn from the vendor's brand guidelines rather than a screenshot, and do not take a `tone` because tinting a multi-colour mark misrepresents it.
- Third-party views (`GlassView`, `expo-image`, `react-native-svg`) need `styled(X, { className: "style" })` before `className` works. `styled` over `GlassViewProps` explodes TypeScript's union representation, so it is cast to `ComponentType<ViewProps>` in and back to the real props out — see `tab-bar.tsx`.
- Icons are decorative by default and hidden from assistive tech; the enclosing control carries the label.
- These 14 primitives were built ahead of their first screen, because the design sheet is the second user of each. The two-screens rule applies to everything added after them; do not read it as "these were exempt because they are primitives".
- The reference page is `/design-system` (`src/app/design-system.tsx`, scaffolding in `src/components/design-system/`, which stays out of `ui/` because nothing else uses it). Its System/Light/Dark switch calls `colorScheme` from `react-native-css` and resets to the device value on unmount, so reviewing dark mode never leaks into the rest of the app. That switch exercises the real `useColorScheme()` value, and writes the whole theme at once.
- Category glyphs follow the home design: Cabins is a pine tree, Beach a wave, City a building, Villas a house — no palm glyph exists in SF Symbols or Material.

## Reporting

End every piece of work that changes code (features and fixes, not answers to questions) with this report. Use these headings in this order, and leave out any section that would be empty.

- **Done:** one line on the outcome, then the files changed and what changed in each.
- **Verified:** each check with ✅ or ❌ and its evidence (command output, screenshot). List what wasn't checked as ❌ with the reason. Never mark something ✅ without running it.
- **You need to:** numbered actions only the user can take, such as keys, dashboard settings, manual steps in Sanity, or assets to provide.
- **Test it yourself:** numbered steps to reproduce the result from a fresh start, ending with `Expected:` and what the user should see.
- **Notes:** defaults picked, trade-offs, and anything left for later.

## Checks

- Lint and type check pass before any task is called done.
- Screens that load data handle loading, error, and empty states.
- AI features are tried against realistic inputs, and failures are explained by cause: missing data, the decision Jev made, the query, or the code.
