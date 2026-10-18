import { useState } from "react";
import { ScrollView, View } from "react-native";

import {
  Badge,
  Button,
  Card,
  Chip,
  InputField,
  ProfileRow,
  SegmentedControl,
  StatusAlert,
  Stepper,
  ThemedText,
} from "@/components/ui";
import { shadows } from "@/theme";

import { router } from "expo-router";


/**
 * Design-system smoke test. Every screen replaces this; it stays until there
 * is a real screen to look at, and it is the fastest way to see a token or a
 * primitive change across every variant at once.
 */
export default function Index() {
  const [query, setQuery] = useState("");
  const [guests, setGuests] = useState(2);
  const [view, setView] = useState<"list" | "map">("list");

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


      <View className="gap-sm">
        <ThemedText variant="heading">Find your next stay</ThemedText>
        <InputField
          variant="search"
          icon="search"
          placeholder="Cabins in California"
          trailingIcon="sliders"
          trailingAccessibilityLabel="Open filters"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View className="flex-row flex-wrap gap-sm">
        <Chip label="All Stays" icon="home" variant="primary" selected />
        <Chip label="Cabins" icon="cabin" />
        <Chip label="Beach" icon="beach" />
        <Chip label="Cabins" icon="cabin" variant="lavender" selected />
      </View>

      <View className="flex-row gap-sm">
        <Button title="Book this stay" trailingIcon="arrowRight" />
        <Button title="Continue with Google" variant="secondary" />
      </View>

      <View style={shadows.card}>
        <Card className="gap-sm p-md">
          <View className="flex-row items-center justify-between">
            <ThemedText variant="title">Modern Cabin with Hot Tub</ThemedText>
            <Badge label="Guest favorite" variant="favorite" icon="star" />
          </View>
          <ThemedText variant="caption" tone="muted">
            Lake Arrowhead, CA
          </ThemedText>
          <View className="flex-row items-baseline gap-xs">
            <ThemedText variant="title">$289</ThemedText>
            <ThemedText variant="caption" tone="muted">
              / night
            </ThemedText>
          </View>
        </Card>
      </View>

      <Card variant="tinted" className="p-md">
        <ProfileRow label="Ask about policies" icon="sparkle" onPress={() => { }} />
        <ProfileRow label="Payment methods" icon="calendar" onPress={() => { }} />
      </Card>

      <SegmentedControl
        options={[
          { value: "list", label: "List", icon: "sliders" },
          { value: "map", label: "Map", icon: "location" },
        ]}
        value={view}
        onChange={setView}
        accessibilityLabel="Result view"
      />

      <StatusAlert message="Account created successfully" />

      <Card className="p-md">
        <Stepper label="Guests" unit="guests" value={guests} onChange={setGuests} />
      </Card>
    </ScrollView>
  );
}
