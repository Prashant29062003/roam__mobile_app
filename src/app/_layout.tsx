import "../global.css";

import { Stack } from "expo-router";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}