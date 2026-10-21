# 13 . Apple sign-in (browser SSO)

Status: done

## Goal

Apple is enabled on the Clerk instance, so the "Continue with Apple" button
comes back — wired to the same **browser session** flow as Google, so it works
without an Apple Developer account, without a native entitlement, and without
leaving Expo Go.

## Decisions

| # | Decision | Choice | Why |
|---|----------|--------|-----|
| 1 | Which Apple flow | **Browser SSO** (`useSSO`, `strategy: "oauth_apple"`) | There is no Apple Developer account configured in Clerk, and the round trip has to be testable in Expo Go. The native sheet needs an Apple key, the "Sign in with Apple" capability, a development build, and an iOS-only button. Browser SSO needs none of that. |
| 2 | Which platforms show the button | **All of them** — iOS, Android, web | Unlike the native sheet, the browser flow works everywhere. The design shows both buttons without a platform split. |
| 3 | New native modules | **None** | `expo-auth-session` and `expo-web-browser` are already installed and are pure JavaScript, so the app still runs in Expo Go. |
| 4 | Code shape | **One hook, two thin buttons** | `use-social-sign-in.ts` holds the flow; `google-button.tsx` and `apple-button.tsx` hold the labels and marks. The Google button keeps its file and its behaviour. |
| 5 | Credentials | **Clerk's built-in ones** | `connection_oauth_apple` and `connection_oauth_google` both have empty `client_id`/`client_secret`, which is what the shared-credentials default looks like on a development instance. The schema says so: "not required in development — Clerk provides shared credentials". |
| 6 | Cancellation | **Silent** | A closed browser resolves with no session and no error. |
| 7 | The native sheet | **Deferred, not cancelled** | It is the better iOS experience. It becomes its own task when there is an Apple Developer account. |

## What the instance is (read through the MCP server)

| Setting | Value |
|---------|-------|
| `connection_oauth_apple` | `enabled: true`, `authenticatable: true`, empty `client_id`/`client_secret` — Clerk's shared credentials |
| `connection_oauth_google` | `enabled: true`, empty `client_id`/`client_secret` — Clerk's shared credentials |
| `auth_access_control.sign_up_mode` | `public` |
| `get_deploy_oauth_providers` | `configured: false` for both — production is not ready, development is |

**Credentials: fine for now, for both providers.** The empty fields are the
shared-credentials default, not a gap. The schema says it verbatim for
`client_id` and `client_secret`: *"not required in development — Clerk
provides shared credentials"*. What they mean is that **production** is not
ready: before `clerk deploy`, each provider needs its own credentials
(Google: client id + secret; Apple: Services ID, key id, team id, secret).
That is its own task, and it does not block the button.

The one thing that is still needed is the **redirect URL**: the browser
session comes back to the app on a deep link, and Clerk only completes the
hand-off for a redirect URL it knows. In a development build that is
`roammobileapp://sso-callback`, which is the app's `scheme` plus Clerk's
default `sso-callback` path. In Expo Go it is a rotating `exp://…` URL that
cannot be pre-registered, so the round trip may not complete there. The code
is the same either way; if the callback does not come back cleanly in Expo
Go, that is why.

## Steps

### 1. One hook for the flow — done

`src/components/auth/use-social-sign-in.ts` holds the whole flow:

- `startSSOFlow({ strategy: provider })` with Clerk's default `redirectUrl`.
- A session means the user is signed in: route to `/home`.
- A cancelled browser session shows nothing — it is not an error.
- A missing-requirements result (the instance wants a field the provider did
  not send) says so and points at email sign-up.
- Any other failure shows the error, named after the provider.
- The button is disabled while the browser session is open, so a second tap
  cannot start a second one.

### 2. Two buttons — done

- `src/components/auth/google-button.tsx` — refactored onto the hook. Same
  markup, same behaviour, same file.
- `src/components/auth/apple-button.tsx` — the same, with `AppleMark` and the
  title "Continue with Apple". `src/components/brand/apple-mark.tsx` is the
  official monochrome mark and is used again.

### 3. The screens — done

`sign-in.tsx` and `sign-up.tsx` render `<AppleButton />` under the Google
button, in the order the design shows them. The "or" divider stays.

### 4. Documentation — done

`AGENTS.md` → **Who owns what** → Auth: the Google bullet became a
**Social sign-in** bullet — browser SSO for Google and Apple, every platform,
no native module, Clerk's built-in credentials, the whitelisted redirect URL,
and the native Apple sheet named as the later upgrade.

## Verification

| # | Check | Result |
|---|-------|--------|
| 1 | `npx tsc --noEmit` | ✅ clean |
| 2 | `npx expo lint` | ✅ clean |
| 3 | `npx expo-doctor` | ✅ 20/20 |
| 4 | `expo export --platform ios` builds and the bundle carries `oauth_apple` | ✅ |
| 5 | The app still runs in Expo Go (no new native module) | ✅ no native dependency added |
| 6 | A real Apple round trip on a device | ⏳ needs the redirect URL to be whitelisted, or a development build |

## Out of scope

| Item | Belongs to / why |
|------|------------------|
| The native Sign in with Apple sheet | Needs an Apple Developer account, a key on the instance, the capability, and a development build. Its own task. |
| Production OAuth credentials | Needed before `clerk deploy`. Its own task. |
| Hiding the Google button on iOS | Apple's guideline 4.8 wants an equivalent privacy-preserving option when other third-party login is offered; email + password is that option, and Google stays. |

## AGENTS.md updates

- Who owns what → Auth: the Google bullet became the Social sign-in bullet.

## Result

Built. Both social buttons now run the same Clerk browser session, so Apple
works on the shared credentials with no Apple account, no entitlement, and no
new native module — the app still starts in Expo Go. The flow, the loading
state, the cancellation handling and the errors live in one hook, and each
button is just its label and its mark.

Verified: type check, lint and `expo-doctor` clean, the iOS bundle builds
with `oauth_apple` in it, and nothing native was added.

Not verified: the round trip itself. It needs the app's redirect URL
whitelisted in Clerk's Dashboard — `roammobileapp://sso-callback`, against
the bundle id `com.roam.mobileapp` — and in Expo Go the callback lands on a
rotating `exp://` URL that cannot be pre-registered, so the round trip may
not complete there. The email and password flow is unaffected either way.
