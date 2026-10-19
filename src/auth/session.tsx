import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * The auth seam.
 *
 * `useSession()` is the only way a screen learns whether anyone is signed in,
 * and `signIn`/`signUp` are the only way a screen tries. Everything below is a
 * mock: there is no Clerk, no network, and nothing is persisted, so a reload
 * puts the user back on onboarding. That is deliberate for now — it keeps the
 * app runnable with no keys while still giving the navigator something real to
 * guard on.
 *
 * When Clerk arrives it replaces the bodies of these functions and nothing else.
 * The guard in `src/app/_layout.tsx`, the screens, and the hook signature all
 * stay as they are. See the plan in `prompts/07-onboarding-and-auth-entry.md`.
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
  | { ok: true }
  | { ok: false; error: AuthError };

type SessionContextValue = {
  session: Session | null;
  /** True until the initial read settles. The splash screen waits on this. */
  isLoading: boolean;
  signIn: (credentials: Credentials) => Promise<AuthResult>;
  signUp: (credentials: Credentials) => Promise<AuthResult>;
  verifyCode: (input: { email: string; code: string }) => Promise<AuthResult>;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

/** Roughly what a real identity round trip costs, so buttons exercise `loading`. */
const NETWORK_DELAY_MS = 450;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password, fullName }: Credentials): AuthError | null {
  if (!email.trim()) {
    return { field: "email", message: "Enter your email address" };
  }
  if (!EMAIL.test(email.trim())) {
    return { field: "email", message: "That email address is not valid" };
  }
  if (!password) {
    return { field: "password", message: "Enter your password" };
  }
  if (password.length < 8) {
    return { field: "password", message: "Use at least 8 characters" };
  }
  if (fullName !== undefined && !fullName.trim()) {
    return { field: "fullName", message: "Enter your name" };
  }
  return null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // Email awaiting email-code verification after sign-up. Clerk replaces this
  // with its own verification flow; the mock keeps it so the verify screen has
  // something real to check the code against.
  const [pending, setPending] = useState<{
    email: string;
    fullName?: string;
  } | null>(null);
  // Starts false because there is nothing to read yet. Clerk turns this into a
  // real async read of the token cache, at which point it starts true and the
  // splash controller in `src/app/_layout.tsx` waits on it as intended.
  const [isLoading] = useState(false);

  const authenticate = useCallback(
    async (credentials: Credentials): Promise<AuthError | null> => {
      await wait(NETWORK_DELAY_MS);
      return validate(credentials);
    },
    [],
  );

  const verifyCode = useCallback(
    async (input: { email: string; code: string }): Promise<AuthResult> => {
      await wait(NETWORK_DELAY_MS);

      const { email, code } = input;
      if (!/^\d{6}$/.test(code.trim())) {
        return {
          ok: false,
          error: { field: "code", message: "Enter a 6-digit code" },
        };
      }
      if (
        !pending ||
        email.trim().toLowerCase() !== pending.email
      ) {
        return {
          ok: false,
          error: {
            field: "email",
            message: "That email doesn't match the sign-up you started.",
          },
        };
      }

      setSession({
        userId: `mock_${pending.email}`,
        email: pending.email,
        fullName: pending.fullName,
      });
      setPending(null);
      return { ok: true };
    },
    [pending],
  );

  const signIn = useCallback(
    async (credentials: Credentials): Promise<AuthResult> => {
      const error = await authenticate(credentials);
      if (error) {
        return { ok: false, error };
      }
      setSession({
        userId: `mock_${credentials.email.trim().toLowerCase()}`,
        email: credentials.email.trim().toLowerCase(),
      });
      return { ok: true };
    },
    [authenticate],
  );

  const signUp = useCallback(
    async (credentials: Credentials): Promise<AuthResult> => {
      // Sign-up defers session creation until the email code is verified, so
      // the flow lands on the verify screen instead of straight into /home.
      const error = await authenticate(credentials);
      if (error) {
        return { ok: false, error };
      }
      setPending({
        email: credentials.email.trim().toLowerCase(),
        fullName: credentials.fullName?.trim(),
      });
      return { ok: true };
    },
    [authenticate],
  );

  const signOut = useCallback(() => setSession(null), []);

  const value = useMemo(
    () => ({ session, isLoading, signIn, signUp, verifyCode, signOut }),
    [session, isLoading, signIn, signUp, verifyCode, signOut],
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
