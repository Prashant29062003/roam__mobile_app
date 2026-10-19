import { ScrollView, View } from "react-native";

import { router } from "expo-router";
import { Button, ThemedText } from "@/components/ui";

export default function Index() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-lg p-md pb-xxl"
    >
      <View className="gap-xs">
        <ThemedText variant="display">roam</ThemedText>
        <ThemedText variant="caption" tone="muted">
          Find unforgettable stays for every kind of trip.
        </ThemedText>
      </View>

      <Button
        title="View Design System"
        variant="secondary"
        onPress={() => router.push("/design-system")}
      />
    </ScrollView>
  );
}
