// src/index.ts

/**
 * react-native-json-dynamic-home
 *
 * A powerful JSON-to-React-Native-UI rendering engine.
 * Build entire React Native screens dynamically from JSON configuration.
 * Perfect for server-driven UI, no-code app builders, and dynamic
 * content delivery.
 *
 * ## Quick Start
 *
 * ```ts
 * import {
 *   JsonWidgetEngine,
 *   JsonLoaderService,
 *   DynamicScreen,
 * } from 'react-native-json-dynamic-home';
 *
 * // 1. Set the base URL where your JSON files are hosted
 * JsonLoaderService.defaultBaseUrl = 'https://api.yourdomain.com/dynamic_ui';
 *
 * // 2. Create the engine
 * const engine = new JsonWidgetEngine();
 *
 * // 3. Use DynamicScreen to render
 * <DynamicScreen jsonFile="home.json" engine={engine} />
 * ```
 */

// ─── Models ──────────────────────────────────────────────────
export {
  WidgetNode,
  ClickAction,
  VisibilityConfig,
  AnalyticsConfig,
  parseWidgetNode,
  getClickAction,
  getString,
  getInt,
  getDouble,
  getBool,
} from './models/WidgetNode';

export {
  WidgetStyle,
  EdgeInsets,
  parseEdgeInsets,
  parseWidgetStyle,
} from './models/WidgetStyle';

export {
  DynamicScreenConfig,
  parseDynamicScreenConfig,
  dynamicScreenConfigToJson,
} from './models/DynamicScreenConfig';

// ─── Engine ──────────────────────────────────────────────────
export {
  JsonWidgetEngine,
  NativeActionRegistry,
  NativeActionCallback,
  NavigationRef,
  JsonWidgetEngineContext,
  useJsonWidgetEngine,
} from './engine/JsonWidgetEngine';

export {
  WidgetRegistry,
  SimpleWidgetBuilder,
  EngineWidgetBuilder,
} from './engine/WidgetRegistry';

export { StyleParser } from './engine/StyleParser';
export { ActionHandler } from './engine/ActionHandler';
export { AnimationWrapper } from './engine/AnimationWrapper';
export { ErrorBoundary, buildSafe } from './engine/ErrorBoundary';
export { JsonAnalyticsDelegate } from './engine/JsonAnalyticsDelegate';

// ─── Services ────────────────────────────────────────────────
export { JsonLoaderService } from './services/JsonLoaderService';

// ─── Ready-to-use Screens ────────────────────────────────────
export { DynamicScreen } from './screens/DynamicScreen';
export { DynamicWidgetArea } from './screens/DynamicWidgetArea';

// ─── State Providers ─────────────────────────────────────────
export {
  DynamicUiProvider,
  useDynamicUi,
  DynamicUiStatus,
} from './providers/DynamicUiProvider';
