import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import {
  Field,
  Frame,
  RadiusBox,
  ScaleBar,
  Section,
  Swatch,
} from "@/components/design-system/preview";
import { Diagnostics } from "@/components/design-system/diagnostics";
import {
  Badge,
  Button,
  Card,
  Chip,
  Icon,
  IconButton,
  InputField,
  ProfileRow,
  SegmentedControl,
  StatusAlert,
  Stepper,
  TabBar,
  ThemedText,
  Toggle,
  type IconName,
} from "@/components/ui";
import {
  darkColors,
  lightColors,
  shadows,
  applyColorScheme,
  type Scheme,
  type ThemeColors,
} from "@/theme";

const COLOR_ROWS = [
  { token: "primary", cls: "bg-primary", key: "primary" },
  { token: "star", cls: "bg-star", key: "star" },
  { token: "lavender", cls: "bg-lavender", key: "lavender" },
  { token: "on-primary", cls: "bg-on-primary", key: "onPrimary" },
  { token: "on-lavender", cls: "bg-on-lavender", key: "onLavender" },
  { token: "foreground", cls: "bg-foreground", key: "foreground" },
  { token: "muted", cls: "bg-muted", key: "muted" },
  { token: "surface", cls: "bg-surface", key: "surface" },
  { token: "background", cls: "bg-background", key: "background" },
  { token: "border", cls: "bg-border", key: "border" },
  { token: "lavender-tint", cls: "bg-lavender-tint", key: "lavenderTint" },
  { token: "glass", cls: "bg-glass", key: "glass" },
  { token: "success", cls: "bg-success", key: "success" },
  { token: "success-tint", cls: "bg-success-tint", key: "successTint" },
  { token: "error", cls: "bg-error", key: "error" },
  { token: "error-tint", cls: "bg-error-tint", key: "errorTint" },
  { token: "star-tint", cls: "bg-star-tint", key: "starTint" },
  { token: "info-tint", cls: "bg-info-tint", key: "infoTint" },
] as const satisfies readonly {
  token: string;
  cls: string;
  key: keyof ThemeColors;
}[];

const SPACING = [
  { label: "xs", px: 4 },
  { label: "sm", px: 8 },
  { label: "md", px: 16 },
  { label: "lg", px: 24 },
  { label: "xl", px: 32 },
  { label: "xxl", px: 48 },
] as const;

const ICONS: IconName[] = [
  "home", "search", "heart", "heartOutline", "bookmark", "calendar", "person",
  "gear", "location", "sliders", "arrowRight", "chevronRight", "check", "close",
  "alert", "mail", "lock", "star", "share", "plus", "minus", "eye", "eyeOff",
  "sparkle", "cabin", "beach", "city", "villa",
];

const TABS = [
  { value: "home", label: "Home", icon: "home" },
  { value: "search", label: "Search", icon: "search" },
  { value: "trips", label: "Trips", icon: "calendar" },
  { value: "profile", label: "Profile", icon: "person" },
] as const;

/**
 * Live reference for the design system: every token and every primitive, with
 * the values a screen would actually use.
 *
 * The scheme switch drives `colorScheme` from `react-native-css`, which is the
 * same observable `@media (prefers-color-scheme)` is evaluated against — so
 * "Dark" here exercises the real `:root` overrides rather than a mock. That
 * makes it the fastest way to review dark mode without changing the device.
 */
export default function DesignSystem() {
  const [scheme, setScheme] = useState<Scheme>("system");
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("primary");
  const [filter, setFilter] = useState("lavender");
  const [view, setView] = useState<"list" | "map">("list");
  const [on, setOn] = useState(true);
  const [guests, setGuests] = useState(2);
  const [tab, setTab] = useState<string>("home");

  // Leaving the page must not leave the whole app forced into a scheme.
  useEffect(() => {
    return () => {
      applyColorScheme("system");
    };
  }, []);

  /**
   * `applyColorScheme` writes both halves — `Appearance` for everything read
   * through `useColorScheme()` (icon tints, `Switch`, glass), and
   * react-native-css's `colorScheme` for the `:root` variables behind every
   * `className`. Setting only one is what left icons invisible on a light
   * page.
   *
   * It returns `false` on platforms that cannot override at all (web), and
   * there the switch is a no-op rather than a crash.
   */
  const apply = (next: Scheme) => {
    setScheme(next);
    applyColorScheme(next);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-xl p-md pb-xxl"
    >
      <View className="gap-sm">
        <ThemedText variant="display">roam</ThemedText>
        <ThemedText variant="caption" tone="muted">
          Find unforgettable stays for every kind of trip.
        </ThemedText>
      </View>

      <Diagnostics />

      <SegmentedControl
        options={[
          { value: "system", label: "System" },
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
        value={scheme}
        onChange={apply}
        accessibilityLabel="Color scheme"
      />

      {/* ---------------------------------------------------------------- */}
      <Section
        title="Color"
        description="Each swatch is filled by its utility class, so an empty box means the token did not resolve."
      >
        <Card className="px-md">
          {COLOR_ROWS.map((row) => (
            <Swatch
              key={row.key}
              className={row.cls}
              token={row.token}
              variable={`--color-${row.token}`}
              light={lightColors[row.key]}
              dark={darkColors[row.key]}
            />
          ))}
        </Card>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Typography" description="Geometric Sans once bundled; platform sans until then.">
        <Frame>
          <Field label="display" hint="56 / 1.0 / bold">
            <ThemedText variant="display">Find your next stay</ThemedText>
          </Field>
          <Field label="heading" hint="28 / 1.2 / bold">
            <ThemedText variant="heading">Modern Cabin</ThemedText>
          </Field>
          <Field label="title" hint="22 / 1.2 / bold">
            <ThemedText variant="title">with Hot Tub</ThemedText>
          </Field>
          <Field label="body" hint="16 / 1.5 / regular">
            <ThemedText variant="body">
              From mountain cabins to oceanfront villas.
            </ThemedText>
          </Field>
          <Field label="caption" hint="14 / 1.5 / medium">
            <ThemedText variant="caption">Lake Arrowhead, CA</ThemedText>
          </Field>
          <Field label="button" hint="17 / 1.2 / medium">
            <ThemedText variant="button">Book this stay</ThemedText>
          </Field>
          <Field label="tones" hint="default, muted, primary, lavender, star, success, error">
            <View className="flex-row flex-wrap gap-sm">
              <ThemedText variant="caption" tone="muted">muted</ThemedText>
              <ThemedText variant="caption" tone="primary">primary</ThemedText>
              <ThemedText variant="caption" tone="lavender">lavender</ThemedText>
              <ThemedText variant="caption" tone="star">star</ThemedText>
              <ThemedText variant="caption" tone="success">success</ThemedText>
              <ThemedText variant="caption" tone="error">error</ThemedText>
            </View>
          </Field>
        </Frame>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Spacing and radius" description="4pt grid.">
        <Frame>
          {SPACING.map((step) => (
            <ScaleBar
              key={step.label}
              label={step.label}
              hint={`${step.px}px · p-${step.label}`}
              value={step.px}
            />
          ))}
          <View className="mt-sm gap-xs">
            <RadiusBox label="control" hint="12px · rounded-control" className="rounded-control" />
            <RadiusBox label="card" hint="16px · rounded-card" className="rounded-card" />
            <RadiusBox label="full" hint="9999px · capsule" className="rounded-full" />
          </View>
        </Frame>
      </Section>

      <Section title="Shadows" description="boxShadow as ViewStyle; the design is mostly flat.">
        <View className="gap-md">
          {(["card", "raised", "overlay"] as const).map((level) => (
            <View key={level} style={shadows[level]} className="rounded-card bg-surface p-md">
              <ThemedText variant="body">{level}</ThemedText>
            </View>
          ))}
        </View>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section title="Button" description="primary, secondary, ghost. Press any one for the pressed state.">
        <Frame>
          <Field label="variants">
            <View className="gap-sm">
              <Button title="Book this stay" trailingIcon="arrowRight" onPress={() => { }} />
              <Button title="Continue with Google" variant="secondary" onPress={() => { }} />
              <Button title="Skip for now" variant="ghost" onPress={() => { }} />
            </View>
          </Field>
          <Field label="sizes" hint="sm, md, lg">
            <View className="gap-sm">
              <Button title="Small" size="sm" onPress={() => { }} />
              <Button title="Medium" size="md" onPress={() => { }} />
              <Button title="Large" size="lg" onPress={() => { }} />
            </View>
          </Field>
          <Field label="states" hint="loading keeps its accessible label">
            <View className="gap-sm">
              <Button title="Loading" loading onPress={() => { }} />
              <Button title="Disabled" disabled onPress={() => { }} />
            </View>
          </Field>
          <Field label="IconButton" hint="sm, md, lg">
            <View className="flex-row items-center gap-md">
              <IconButton accessibilityLabel="Save" name="heart" size="sm" onPress={() => { }} />
              <IconButton accessibilityLabel="Share" name="share" onPress={() => { }} />
              <IconButton accessibilityLabel="Settings" name="gear" size="lg" onPress={() => { }} />
            </View>
          </Field>
        </Frame>
      </Section>

      <Section title="Input fields" description="Focus is a lavender border and caret; error is red. Tap a field to focus it.">
        <Frame>
          <InputField
            variant="search"
            icon="search"
            placeholder="Cabins in California"
            trailingIcon="sliders"
            trailingAccessibilityLabel="Open filters"
            value={query}
            onChangeText={setQuery}
          />
          <InputField variant="form" icon="person" placeholder="Enter your name" />
          <InputField variant="form" icon="mail" placeholder="you@example.com" error errorMessage="Enter a valid email address" />
          <InputField variant="password" icon="lock" placeholder="At least 8 characters" />
        </Frame>
      </Section>

      <Section title="Chips" description="default, primary, lavender.">
        <Frame>
          <View className="flex-row flex-wrap items-center gap-sm">
            <Chip label="Cabins" icon="cabin" />
            <Chip label="Under $300" />
            <Chip label="All Stays" icon="home" variant="primary" selected />
            <Chip label="Cabins" icon="cabin" variant="lavender" selected />
            <Chip label="Small" size="sm" />
          </View>
          <Field label="interactive" hint="tap to toggle">
            <View className="flex-row items-center gap-sm">
              <Chip
                label="Pet Friendly"
                icon="heart"
                variant={filter === "lavender" ? "lavender" : "default"}
                selected={filter === "lavender"}
                onPress={() => setFilter(filter === "lavender" ? "none" : "lavender")}
              />
              <Chip
                label="Quiet"
                variant={chip === "primary" ? "primary" : "default"}
                selected={chip === "primary"}
                onPress={() => setChip(chip === "primary" ? "none" : "primary")}
              />
            </View>
          </Field>
        </Frame>
      </Section>

      <Section title="Cards" description="surface, tinted, plain. No shadows by default.">
        <View className="gap-md">
          <Card className="gap-sm p-md">
            <ThemedText variant="title">Modern Cabin</ThemedText>
            <ThemedText variant="caption" tone="muted">Lake Arrowhead, CA</ThemedText>
          </Card>
          <Card variant="tinted" className="p-md">
            <ProfileRow label="Ask about policies" icon="sparkle" onPress={() => { }} />
          </Card>
          <Card bordered className="p-md">
            <ThemedText variant="caption">bordered</ThemedText>
          </Card>
        </View>
      </Section>

      <Section title="Badges, alerts, rows">
        <Frame>
          <Field label="Badge" hint="favorite, new, discount, superhost, accent">
            <View className="flex-row flex-wrap gap-sm">
              <Badge label="Guest favorite" variant="favorite" icon="star" />
              <Badge label="New" variant="new" />
              <Badge label="20% off" variant="discount" />
              <Badge label="Superhost" variant="superhost" />
              <Badge label="Roam Explorer" variant="accent" icon="star" />
            </View>
          </Field>
          <Field label="StatusAlert" hint="success, error">
            <View className="gap-sm">
              <StatusAlert message="Account created successfully" />
              <StatusAlert message="Something went wrong. Try again." variant="error" />
              <StatusAlert message="Tap the cross to dismiss" onDismiss={() => { }} />
            </View>
          </Field>
          <Field label="ProfileRow" hint="with and without detail">
            <View>
              <ProfileRow label="Personal info" icon="person" onPress={() => { }} />
              <ProfileRow label="Payment methods" icon="calendar" detail="Visa ending 4242" onPress={() => { }} />
            </View>
          </Field>
          <Field label="Toggle" hint="native Switch, brand colors">
            <View className="flex-row items-center justify-between">
              <ThemedText variant="body">Instant book</ThemedText>
              <Toggle label="Instant book" value={on} onValueChange={setOn} />
            </View>
          </Field>
          <Stepper label="Guests" unit="guests" value={guests} onChange={setGuests} />
        </Frame>
      </Section>

      <Section title="Segmented control and tab bar">
        <Frame>
          <SegmentedControl
            options={[
              { value: "list", label: "List", icon: "sliders" },
              { value: "map", label: "Map", icon: "location" },
            ]}
            value={view}
            onChange={setView}
            accessibilityLabel="Result view"
          />
        </Frame>
        <TabBar tabs={TABS} value={tab} onChange={setTab} />
      </Section>

      <Section title="Icons" description={`${ICONS.length} glyphs, SF Symbols with Material fallbacks.`}>
        <Frame>
          <View className="flex-row flex-wrap gap-lg">
            {ICONS.map((name) => (
              <View key={name} className="w-20 items-center gap-xs">
                <Icon name={name} size={22} />
                <ThemedText
                  variant="caption"
                  tone="muted"
                  className="text-center"
                  numberOfLines={2}
                >
                  {name}
                </ThemedText>
              </View>
            ))}
          </View>
        </Frame>
      </Section>
    </ScrollView>
  );
}