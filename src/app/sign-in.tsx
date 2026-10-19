import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { AuthShell, AuthSwitch } from "@/components/auth/auth-shell";
import { Button, InputField } from "@/components/ui";
import { useSession, type AuthError } from "@/auth/session";

type FieldErrors = Partial<Record<AuthError["field"], string>>;

export default function SignIn() {
  const { signIn } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    const result = await signIn({ email, password });
    setLoading(false);

    if (!result.ok) {
      setErrors({ [result.error.field]: result.error.message });
      return;
    }

    router.replace("/home");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off — your saved stays and recommendations are waiting."
      footer={
        <AuthSwitch
          prompt="New here?"
          actionLabel="Create an account"
          onPress={() => router.replace("/sign-up")}
        />
      }
    >
      <View className="gap-md">
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
          autoComplete="password"
          textContentType="password"
          error={!!errors.password}
          errorMessage={errors.password}
        />

        <Button
          title="Sign in"
          size="md"
          trailingIcon="arrowRight"
          loading={loading}
          onPress={onSubmit}
        />
      </View>
    </AuthShell>
  );
}
