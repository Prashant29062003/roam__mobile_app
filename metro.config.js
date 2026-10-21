const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const withCss = withNativewind(config, {
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

/**
 * React Native behind a wrapper of our own.
 *
 * `react-native-css` points every `react-native` import at its barrel, and
 * that barrel is missing `AssetRegistry` — which `expo-asset` needs to
 * resolve a bundled asset, so every `require()`-style asset (the fonts) fails
 * to load. `src/native.ts` re-exports the barrel and adds that one export
 * back; this resolver is what makes it the module behind "react-native".
 *
 * `react-native-css` keeps the real React Native for its own files, and the
 * wrapper keeps the real React Native for itself, so neither ends up in a
 * cycle.
 */
const nativeWrapper = path.resolve(__dirname, "src/native.ts");
const realReactNative = require.resolve("react-native");
const isReactNativeCss = (filePath) =>
  filePath.includes(`${path.sep}react-native-css${path.sep}`);

const resolveRequest = withCss.resolver?.resolveRequest;

module.exports = {
  ...withCss,
  resolver: {
    ...withCss.resolver,
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === "react-native" && !isReactNativeCss(context.originModulePath)) {
        return {
          type: "sourceFile",
          filePath:
            context.originModulePath === nativeWrapper
              ? realReactNative
              : nativeWrapper,
        };
      }

      return resolveRequest
        ? resolveRequest(context, moduleName, platform)
        : context.resolveRequest(context, moduleName, platform);
    },
  },
};
