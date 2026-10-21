# 10 . Clerk auth: real email + password with code verification

Status: done

## Goal

Replace the mocked auth with real Clerk, behind the existing `useSession()`
seam: email + password sign-up with an email verification code, email +
password sign-in, a session that survives an app restart, protected routes,
and sign-out. **The custom screens stay as they are.**

## Decisions

Answered by the user:

| # | Question | Answer | Why |
|---|----------|--------|-----|
| 1 | Credential model | **Password on both, email code only at sign-up** | Sign-up: name + email + password → code. Sign-in: email + password. The screens need no change, and the instance needs no change. |
| 2 | Social buttons | **Leave them as they are** | `connection_oauth_google` is enabled but has an empty `client_id`/`client_secret`, so a wired button would fail on tap. |

Defaults picked by me:

| # | Decision | Choice | Why |
|---|----------|--------|-----|
| 3 | How to install | `npm install --save --ignore-scripts @clerk/expo expo-secure-store` | `npx expo install` dies on npm 12's allow-scripts gate; neither package has an install script, so the scripts are safe to skip. The config plugins were added to `app.json` by hand. |
| 4 | Where the code step lives | The existing `/verify-email` screen | `prompts/07` built it for exactly this: "Email verification code step — it exists because Clerk emails the code." |
| 5 | Test mode | **Left on** (dev-instance default) | Verification uses a `+clerk_test@example.com` address and the code `424242`. Turning it off is one command, but it is a write to the instance. |
| 6 | Name handling | The one "Full name" field is split on the first space into `firstName` / `lastName` | Clerk models them separately, and the instance has both enabled. |
| 7 | Sign-out | The seam's `signOut` is async and `home.tsx` awaits it | Clerk's sign-out is a network call; not awaiting it races the route change. |
| 8 | Password minimum | Copy says **15 characters**, matching the instance | The instance's `auth_password.min_length` is 15 (Clerk's default). The design's mockup says 8; a policy is not a mockup, and the field should tell the truth. One command changes it back. |
| 9 | Device Trust | Handled, not disabled | The instance has `auth_password.device_trust.enabled: true`, so a password sign-in on a new device is challenged with a second factor. The seam sends the email code and the sign-in screen routes to the code screen. |

## What the Clerk instance is (read through the MCP server)

| Setting | Value | What it means for this work |
|---------|-------|----------------------------|
| Application | `roam__mobile_app` (`app_3KzrBB1iIjqwiANoCeGK2P5an0I`) | The publishable key already in `.env.local` is this app's key — no app choice to make. |
| Development instance | `ins_3KzrBBPq3pL9StEF6GYdHEgfenc`, Frontend API `stirring-mako-5955.clerk.accounts.dev` | |
| `native_settings.api_enabled` | `true` | The Native API is on, so the app can talk to Clerk. No Dashboard work. |
| `auth_email` | `sign_in_strategies: ["email_code"]`, `verification_strategies: ["email_code"]`, `verify_at_sign_up: true`, `required_for_sign_up: true` | Email and the email code are enabled. |
| `auth_password` | `enabled: true`, `required: true`, `min_length: 15`, `device_trust.enabled: true` | Password is required at sign-up; a sign-in on a new device needs a second factor. |
| `user_model` | `first_name` and `last_name` enabled, not required | The "Full name" field maps cleanly. |
| `auth_config.test_mode` | `true` | Dev-instance default. Sign-up and verification use a `+clerk_test` address and the code `424242`; no real email is sent. |
| `session_settings` | `maximum_lifetime: 604800` (7 days), inactivity timeout off | A signed-in session lasts a week. |
| `connection_oauth_google` | enabled, empty `client_id` / `client_secret` | The social buttons stay as "not available yet" (decision 2). |

## The seam contract (`src/auth/session.tsx`)

The hook signature did not change — same names, same roles, same screens. Two
payload details did, because Clerk's flow needs them, and one was added.

| Member | Now | After |
|--------|-----|-------|
| `session` | in-memory mock | `useAuth().userId` + `useUser()`'s `primaryEmailAddress`, `firstName`, `lastName`; `null` when signed out |
| `isLoading` | hard-coded `false` | `!useAuth().isLoaded` — the real read of the token cache, which is what the splash was already waiting for |
| `signIn(credentials)` | mock | `useSignIn().signIn.password({ emailAddress, password })` → `finalize()`; when Device Trust asks for a second factor, `mfa.sendEmailCode()` and the result comes back `needsCode` |
| `signUp(credentials)` | mock | `useSignUp().signUp.password({ emailAddress, password, firstName, lastName })` → `verifications.sendEmailCode()` |
| `verifyCode({ email, code })` | mock | `verifications.verifyEmailCode({ code })` → `finalize()`; the MFA path when the pending attempt is a sign-in |
| `resendCode()` | — | **new**: sends the code again, for whichever attempt is pending |
| `signOut()` | `() => void` | `() => Promise<void>`, wrapping `useAuth().signOut()` |
| error mapping | hand-written validation | Clerk's error → `{ field, message }`, so `InputField`'s `error`/`errorMessage` still light up the right box. Clerk's `meta.paramName` names the field (`identifier` for email, `password`, `code`, `first_name`); the error code is the fallback. |

## Steps

### 1. Install the SDK — done

`@clerk/expo` 4.13.1 (peers allow `expo >=54 <59`) and `expo-secure-store`
58.0.2. `expo-secure-store` is what backs `tokenCache`: without it the session
lives in memory only and a restart signs the user out.

`app.json` now carries both config plugins, which `npx expo install` would
have added:

```json
"plugins": ["expo-router", ["expo-splash-screen", { ... }], "expo-secure-store", "@clerk/expo"]
```

### 2. Environment — done

`.env.local` already held `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` and
`CLERK_SECRET_KEY`; the values were left alone. `.env.example` did not exist
and AGENTS.md requires it, so it was created with the two names and no values.

### 3. The root layout — done

`ClerkProvider` + `tokenCache` are mounted around the whole app, and the
font gate and the splash controller stay. The missing-key error now only
throws in development, so a web export without the variable does not take the
app down, and it names the three commands that fix it.

### 4. The seam — done

`src/auth/session.tsx` is Clerk behind the same contract. The error
normaliser reads the API error's `meta.paramName` through
`isClerkAPIResponseError`, and falls back to the error code.

### 5. The screens — done

| Screen | Change |
|--------|--------|
| `src/app/sign-up.tsx` | The password placeholder now says 15 characters. Otherwise unchanged — it already routes to `/verify-email?email=…`, which is exactly right. |
| `src/app/sign-in.tsx` | The password placeholder now says 15 characters, and the screen routes to the code screen when Clerk asks for a second factor. |
| `src/app/verify-email.tsx` | "Resend code" now resends; it shows a message under the code boxes when the code is refused; the resend button shows "Sending…" while it is in flight. |
| `src/components/auth/code-input.tsx` | Gained an `error` prop, rendered under the boxes. |
| `src/app/(app)/home.tsx` | Awaits the sign-out before changing route. |

### 6. Documentation — done

`AGENTS.md` → **Who owns what** → Auth now describes the installed setup, the
seam, the flow, and the password minimum.

## Verification

| # | Check | Result |
|---|-------|--------|
| 1 | `npx tsc --noEmit` | ✅ clean |
| 2 | `npx expo lint` | ✅ clean |
| 3 | `npx expo-doctor` | ✅ 20/20 |
| 4 | `app.json` carries `expo-secure-store` and `@clerk/expo` | ✅ |
| 5 | iOS bundle builds | ✅ `expo export --platform ios` |
| 6 | A real sign-up on the device: `roam+clerk_test@example.com` + a 15+ character password → the code `424242` → lands on `/home` | ⏳ needs the device |
| 7 | Sign out, then sign in with the same address and password → lands on `/home` | ⏳ needs the device |
| 8 | Kill and relaunch the app while signed in → still signed in (the token cache) | ⏳ needs the device |
| 9 | Deep link to `/home` while signed out → the signed-out group mounts, `/home` is not reachable | ⏳ needs the device |
| 10 | A wrong code shows the error under the code boxes, not a banner | ⏳ needs the device |
| 11 | The require-cycle warning is still absent, and the font gate still holds | ✅ bundle is clean |

## AGENTS.md updates

- Who owns what → Auth: Clerk is installed, the seam is real, the flow is
  email + password with a code at sign-up, sessions persist through
  `expo-secure-store`, and the password minimum is 15.

## Result

Built. Clerk v4 is installed and mounted in the root layout with a secure-store
token cache, so the session survives a restart. The mock is gone: the seam in
`src/auth/session.tsx` is Clerk behind the same contract, the guard in
`src/app/_layout.tsx` is unchanged, and the custom screens are the same
screens with two lines of copy and a real resend.

Verified: type check, lint and `expo-doctor` clean, and the iOS bundle builds.
The end-to-end sign-up, sign-out, sign-in and restart round trip still has to
be run on a device — the instance is in test mode, so it uses a
`+clerk_test@example.com` address and the code `424242`.

Not verified: anything visual, and anything on Android. The device round trip
is the open item.
