/**
 * The module behind every `react-native` import in this app.
 *
 * `react-native-css` re-exports React Native by hand, so its components can
 * take a `className`, and its metro resolver points every `react-native`
 * import at that barrel. The hand-written list covers 95 of React Native's 96
 * public exports — the one it misses is `AssetRegistry`.
 *
 * `expo-asset` needs `AssetRegistry` to resolve a bundled asset, so with the
 * barrel in place every `require()`-style asset fails to load:
 * "Cannot read property 'getAssetByID' of undefined". That is what broke the
 * font loading in `src/app/_layout.tsx`.
 *
 * This wrapper keeps the barrel and adds the missing export back. The app and
 * every package keep importing from "react-native"; only the module behind
 * that name changes. See `metro.config.js`, which points the resolver here.
 */
export * from "react-native-css/components";

export { AssetRegistry } from "react-native";
