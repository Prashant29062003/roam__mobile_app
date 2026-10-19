import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { AuthShell, AuthSwitch } from "@/components/auth/auth-shell";
import { Button, InputField } from "@/components/ui";
import { useSession, type AuthError } from "@/auth/session";

/** Keyed by `AuthError["field"]` so each message lands on the box that caused it. */
type FieldErrors = Partial<Record<AuthError["field"], string>>;

export default function SignUp() {
  const { signUp } = useSession();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    const result = await signUp({ email, password, fullName });
    setLoading(false);

    if (!result.ok) {
      setErrors({ [result.error.field]: result.error.message });
      return;
    }

    router.replace("/home");
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join roam to save your stays, get personalized recommendations and access them across all your devices."
      footer={
        <AuthSwitch
          prompt="Already have an account?"
          actionLabel="Sign in"
          onPress={() => router.replace("/sign-in")}
        />
      }
    >
      <View className="gap-md">
        <InputField
          icon="person"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name"
          autoComplete="name"
          textContentType="name"
          error={!!errors.fullName}
          errorMessage={errors.fullName}
        />
        <InputField
          icon="mail"
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          error={!!errors.email}
          errorMessage={errors.email}
        />
        <InputField
          variant="password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          autoCapitalize="none"
          autoComplete="password-new"
          textContentType="newPassword"
          error={!!errors.password}
          errorMessage={errors.password}
        />

        <Button
          title="Create account"
          size="md"
          trailingIcon="arrowRight"
          loading={loading}
          onPress={onSubmit}
        />
      </View>
    </AuthShell>
  );
}
