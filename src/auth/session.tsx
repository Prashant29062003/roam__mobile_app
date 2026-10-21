import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { isClerkAPIResponseError, useAuth, useSignIn, useSignUp, useUser } from "@clerk/expo";

/**
 * The auth seam.
 *
 * `useSession()` is the only way a screen learns whether anyone is signed in,
 * and `signIn`/`signUp` are the only way a screen tries. The bodies are
 * Clerk's now: the mock is gone, the session is real, and it survives a
 * restart because Clerk keeps the token in the device keychain.
 *
 * The contract with the screens has not changed. A screen still calls
 * `signIn({ email, password })`, still calls `signUp({ email, password,
 * fullName })` and lands on the verification screen, and still calls
 * `verifyCode({ email, code })`. What changed is what happens underneath, and
 * one addition: `resendCode()`, so the "Resend code" button on the
 * verification screen resends instead of pretending to.
 */
export type Session = {
  userId: string;
  email: string;
  fullName?: string;
};

export type Credentials = {
  email: string;
  password: string;
  fullName?: string;
};

/**
 * `{ field, message }` names the input to blame, so a screen can hand it
 * straight to `InputField`'s `error`/`errorMessage` rather than showing a
 * banner and leaving the user to find the offending box.
 */
export type AuthError = {
  field: "email" | "password" | "fullName" | "code";
  message: string;
};

export type AuthResult =
  | { ok: true; needsCode?: boolean }
  | { ok: false; error: AuthError };

type SessionContextValue = {
  session: Session | null;
  /** True until Clerk has restored the session. The splash screen waits on this. */
  isLoading: boolean;
  signIn: (credentials: Credentials) => Promise<AuthResult>;
  signUp: (credentials: Credentials) => Promise<AuthResult>;
  verifyCode: (input: { email: string; code: string }) => Promise<AuthResult>;
  resendCode: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Clerk's field names, mapped onto ours.
 *
 * Clerk blames `identifier` for an email address, and splits a name into
 * `first_name` and `last_name`. The screens have one "Full name" field, so
 * both name errors land on it.
 */
const FIELD_BY_PARAM: Record<string, AuthError["field"]> = {
  identifier: "email",
  email_address: "email",
  emailAddress: "email",
  password: "password",
  code: "code",
  first_name: "fullName",
  firstName: "fullName",
  last_name: "fullName",
  lastName: "fullName",
};

/**
 * The field a Clerk error belongs to.
 *
 * The API knows which input it was talking about, and it says so in the
 * error's `meta.paramName`. When that is missing, the error code is the next
 * best thing.
 */
function fieldFor(error: { code?: string; cause?: unknown }): AuthError["field"] {
  if (isClerkAPIResponseError(error.cause)) {
    const param = error.cause.errors[0]?.meta?.paramName;
    const mapped = param ? FIELD_BY_PARAM[param] : undefined;
    if (mapped) {
      return mapped;
    }
  }

  const code = error.code ?? "";
  if (code.includes("password")) return "password";
  if (code.includes("code")) return "code";
  if (code.includes("identifier") || code.includes("email")) return "email";
  if (code.includes("name")) return "fullName";
  return "email";
}

/**
 * A Clerk error, in the shape the screens want: which box to light up, and
 * what to say.
 *
 * `longMessage` is the copy Clerk writes for people; `message` is for
 * developers. The screens show the first.
 */
function toAuthError(error: {
  code?: string;
  message?: string;
  longMessage?: string;
  cause?: unknown;
}): AuthError {
  return {
    field: fieldFor(error),
    message:
      error.longMessage ||
      error.message ||
      "Something went wrong. Try again.",
  };
}

/** "Ada Lovelace" → first name "Ada", last name "Lovelace". */
function splitName(fullName: string | undefined): {
  firstName?: string;
  lastName?: string;
} {
  const trimmed = fullName?.trim();
  if (!trimmed) {
    return {};
  }

  const [first, ...rest] = trimmed.split(/\s+/);
  return {
    firstName: first,
    lastName: rest.length > 0 ? rest.join(" ") : undefined,
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId, signOut: clerkSignOut } = useAuth();
  const { user } = useUser();
  const { signIn: clerkSignIn } = useSignIn();
  const { signUp: clerkSignUp } = useSignUp();

  /**
   * Which attempt the code on the verification screen belongs to.
   *
   * Sign-up always verifies the email address. Sign-in only needs a code when
   * Clerk asks for a second factor — the instance has Device Trust on, so a
   * password sign-in on a new device is challenged with an email code.
   */
  const pending = useRef<"sign-up" | "sign-in-mfa">("sign-up");

  const session = useMemo<Session | null>(() => {
    if (!isSignedIn || !userId) {
      return null;
    }

    const fullName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ");

    return {
      userId,
      email: user?.primaryEmailAddress?.emailAddress ?? "",
      fullName: fullName || undefined,
    };
  }, [isSignedIn, userId, user]);

  const signIn = useCallback(
    async (credentials: Credentials): Promise<AuthResult> => {
      const { error } = await clerkSignIn.password({
        emailAddress: credentials.email.trim(),
        password: credentials.password,
      });

      if (error) {
        return { ok: false, error: toAuthError(error) };
      }

      if (clerkSignIn.status === "needs_second_factor") {
        // Device Trust is on for this instance, so a password sign-in on a
        // new device is always challenged with a second factor. The email
        // code goes to the same address, and the verification screen takes it
        // from there.
        const { error: sendError } = await clerkSignIn.mfa.sendEmailCode();
        if (sendError) {
          return { ok: false, error: toAuthError(sendError) };
        }
        pending.current = "sign-in-mfa";
        return { ok: true, needsCode: true };
      }

      if (clerkSignIn.status === "complete") {
        const { error: finalizeError } = await clerkSignIn.finalize();
        if (finalizeError) {
          return { ok: false, error: toAuthError(finalizeError) };
        }
        return { ok: true };
      }

      return {
        ok: false,
        error: {
          field: "password",
          message: "We could not sign you in. Try again.",
        },
      };
    },
    [clerkSignIn],
  );

  const signUp = useCallback(
    async (credentials: Credentials): Promise<AuthResult> => {
      const { error } = await clerkSignUp.password({
        emailAddress: credentials.email.trim(),
        password: credentials.password,
        ...splitName(credentials.fullName),
      });

      if (error) {
        return { ok: false, error: toAuthError(error) };
      }

      // The instance verifies the email at sign-up with a code, so the code
      // is sent here and checked on the verification screen.
      const { error: sendError } = await clerkSignUp.verifications.sendEmailCode();
      if (sendError) {
        return { ok: false, error: toAuthError(sendError) };
      }

      pending.current = "sign-up";
      return { ok: true };
    },
    [clerkSignUp],
  );

  const verifyCode = useCallback(
    async (input: { email: string; code: string }): Promise<AuthResult> => {
      const code = input.code.trim();

      if (!/^\d{6}$/.test(code)) {
        return {
          ok: false,
          error: { field: "code", message: "Enter a 6-digit code" },
        };
      }

      if (pending.current === "sign-in-mfa") {
        const { error } = await clerkSignIn.mfa.verifyEmailCode({ code });
        if (error) {
          return { ok: false, error: toAuthError(error) };
        }

        const { error: finalizeError } = await clerkSignIn.finalize();
        if (finalizeError) {
          return { ok: false, error: toAuthError(finalizeError) };
        }
        pending.current = "sign-up";
        return { ok: true };
      }

      const { error } = await clerkSignUp.verifications.verifyEmailCode({ code });
      if (error) {
        return { ok: false, error: toAuthError(error) };
      }

      if (clerkSignUp.status === "complete") {
        const { error: finalizeError } = await clerkSignUp.finalize();
        if (finalizeError) {
          return { ok: false, error: toAuthError(finalizeError) };
        }
        return { ok: true };
      }

      return {
        ok: false,
        error: {
          field: "code",
          message: "That code did not work. Try again.",
        },
      };
    },
    [clerkSignIn, clerkSignUp],
  );

  const resendCode = useCallback(async (): Promise<AuthResult> => {
    if (pending.current === "sign-in-mfa") {
      const { error } = await clerkSignIn.mfa.sendEmailCode();
      if (error) {
        return { ok: false, error: toAuthError(error) };
      }
      return { ok: true };
    }

    const { error } = await clerkSignUp.verifications.sendEmailCode();
    if (error) {
      return { ok: false, error: toAuthError(error) };
    }
    return { ok: true };
  }, [clerkSignIn, clerkSignUp]);

  const signOut = useCallback(async () => {
    await clerkSignOut();
  }, [clerkSignOut]);

  const value = useMemo(
    () => ({
      session,
      isLoading: !isLoaded,
      signIn,
      signUp,
      verifyCode,
      resendCode,
      signOut,
    }),
    [session, isLoaded, signIn, signUp, verifyCode, resendCode, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error("useSession must be used inside a <SessionProvider />");
  }

  return value;
}
