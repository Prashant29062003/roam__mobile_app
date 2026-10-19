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
  field: "email" | "password" | "fullName";
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
  // Starts false because there is nothing to read yet. Clerk turns this into a
  // real async read of the token cache, at which point it starts true and the
  // splash controller in `src/app/_layout.tsx` waits on it as intended.
  const [isLoading] = useState(false);

  const authenticate = useCallback(
    async (
      credentials: Credentials,
      fullName: string | undefined,
    ): Promise<AuthResult> => {
      await wait(NETWORK_DELAY_MS);

      const error = validate(credentials);
      if (error) {
        return { ok: false, error };
      }

      setSession({
        userId: `mock_${credentials.email.trim().toLowerCase()}`,
        email: credentials.email.trim().toLowerCase(),
        fullName,
      });
      return { ok: true };
    },
    [],
  );

  const signIn = useCallback(
    (credentials: Credentials) => authenticate(credentials, undefined),
    [authenticate],
  );

  const signUp = useCallback(
    (credentials: Credentials) =>
      authenticate(credentials, credentials.fullName?.trim()),
    [authenticate],
  );

  const signOut = useCallback(() => setSession(null), []);

  const value = useMemo(
    () => ({ session, isLoading, signIn, signUp, signOut }),
    [session, isLoading, signIn, signUp, signOut],
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
