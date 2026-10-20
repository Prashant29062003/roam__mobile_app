const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config, {
  inlineVariables: {
    exclude: [
      "--roam-primary",
      "--roam-lavender",
      "--roam-on-primary",
      "--roam-on-lavender",
      "--roam-background",
      "--roam-surface",
      "--roam-foreground",
      "--roam-muted",
      "--roam-border",
      "--roam-lavender-tint",
      "--roam-glass",
      "--roam-scrim",
      "--roam-on-scrim",
      "--roam-success",
      "--roam-success-tint",
      "--roam-error",
      "--roam-error-tint",
      "--roam-star-tint",
      "--roam-info-tint",
    ],
  },
});
