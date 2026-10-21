# 12 . Google sign-in through useSSO

Status: done

## Goal

Replace the "Continue with Google" placeholder with a real Google sign-in,
using Clerk's browser SSO flow. Apple's button stays hidden until the
connection is enabled on the instance.

## Decisions

| # | Decision | Choice | Why |
|---|----------|--------|-----|
| 1 | Which Google flow | **Browser SSO (`useSSO`)**, not the native sheet | The user asked for `useSSO`. It works in a development build without a Google Cloud project, and the instance already has Google enabled with Clerk's built-in credentials. The native sheet (`useSignInWithGoogle`) would need iOS, Android and web OAuth clients of their own. |
| 2 | Which `useSSO` | **The Core 3 one, `@clerk/expo/experimental`** | The rest of the app's auth already speaks in future resources (`signIn.password`, `finalize()`). This hook activates the completed session itself, so there is no `setActive` call and no second API generation in the codebase. The legacy hook is still there as a one-line fallback. |
| 3 | Where the button lives | **`src/components/auth/google-button.tsx`**, used by both screens | Sign-in and sign-up are the only callers, and the auth folder already holds the other auth-specific pieces. |
| 4 | Apple | **Hidden** | `connection_oauth_apple.enabled` is `false` on the instance. The button is removed from both screens rather than left showing a "not available yet" alert. `src/components/brand/apple-mark.tsx` stays for when it is enabled. |
| 5 | App identity | **`com.roam.mobileapp`** for the bundle id and the Android package | The app had neither, so prebuild generated an anonymous identity. A stable one is what has to be registered in Clerk's Native Applications page and what the deep link is matched against. A placeholder — change it if there is a real one. |
| 6 | Cancellation | **Silent** | Closing the browser is not an error: `startSSOFlow` resolves with no session and no error. Nothing is shown. |
| 7 | Missing requirements | **An alert, and a route to email sign-up** | If Google does not supply what the instance asks for, only the email path can finish the sign-up. |

## What the instance already is (read through the MCP server)

| Setting | Value | What it means |
|---------|-------|---------------|
| `connection_oauth_google` | `enabled: true`, `client_id: ""`, `client_secret: ""` | Google is on, using Clerk's **built-in** credentials. No Google Cloud project, no client ids in the env. |
| `connection_oauth_apple` | `enabled: false` | Apple stays hidden. |
| `auth_email` | `required_for_sign_up: true` | Google supplies the email, so the transfer into a new account works. |
| `user_model` | `first_name` / `last_name` enabled, not required | Google does not send a name, and the instance does not demand one. |
| `native_settings.api_enabled` | `true` | The Native API is on. |

## Steps

### 1. Install the SSO dependencies — done

`expo-auth-session` 58.0.13. `expo-web-browser` 58.0.6 was already
installed. Both are loaded lazily by Clerk's SSO hook, which throws a clear
error if they are missing.

`npx expo install` dies on npm 12's allow-scripts gate, so
`npm install --save --ignore-scripts expo-auth-session` was used — neither
package has an install script.

### 2. Give the app a stable identity — done

`app.json`: `ios.bundleIdentifier` and `android.package` are both
`com.roam.mobileapp`. The `scheme` (`roammobileapp`) was already there, and
it is what the deep link is built from.

### 3. The button — done

`src/components/auth/google-button.tsx`:

- `useSSO()` from `@clerk/expo/experimental`, `startSSOFlow({ strategy: "oauth_google" })`.
- The default `redirectUrl` is Clerk's — `AuthSession.makeRedirectUri({ path: "sso-callback" })` — so it is not overridden.
- A session means the user is signed in: route to `/home`.
- A cancelled browser session shows nothing.
- A failed session shows the error.
- The button is disabled while the flow is open, so a second tap cannot start a second browser session.

### 4. The screens — done

`sign-in.tsx` and `sign-up.tsx` now render `<GoogleButton />` where the two
placeholder buttons were. The "or" divider stays. The "Continue with Apple"
button and the `onSocial` alert are gone, along with the now-unused imports.

### 5. Documentation — done

`AGENTS.md` → **Who owns what** → Auth gained a **Google sign-in** bullet: a
browser session through `useSSO`, needing a development build and a
whitelisted redirect URL, on Clerk's built-in credentials, with Apple hidden
until it is enabled.

## Verification

| # | Check | Result |
|---|-------|--------|
| 1 | `npx tsc --noEmit` | ✅ clean |
| 2 | `npx expo lint` | ✅ clean |
| 3 | `npx expo-doctor` | ✅ 20/20 |
| 4 | `expo export --platform ios` builds | ✅ |
| 5 | The bundle carries the SSO path | ✅ `makeRedirectUri`, `sso-callback`, `openAuthSessionAsync`, `oauth_google`, `startSSOFlow`, `expo-auth-session` all present |
| 6 | A real Google round trip on a device | ⏳ needs a development build and the Dashboard registration |

## Out of scope

| Item | Belongs to / why |
|------|------------------|
| Native Google sign-in (Credential Manager sheet) | Needs a Google Cloud project with iOS, Android and web clients. The browser flow does the job today. |
| Apple sign-in | Not enabled on the instance. The button is hidden until it is. |
| The Clerk CLI's `link` for this repo | The app is already linked — the publishable key in `.env.local` is this application's. |

## AGENTS.md updates

- Who owns what → Auth: a **Google sign-in** bullet.

## Result

Built. Google sign-in is a real browser session through Clerk: the button on
both auth screens opens Google's OAuth, Clerk exchanges it, and the session
that comes back is the same one the email flow produces — the same seam, the
same guard, the same keychain-backed persistence. Apple's button is gone
until the connection is enabled.

Verified: type check, lint and `expo-doctor` clean, the iOS bundle builds, and
the SSO path is in the bundle.

Not verified: the round trip itself. It needs a development build (the
callback in Expo Go lands on a rotating `exp://` URL that cannot be
whitelisted) and the app registered in Clerk's Dashboard.
