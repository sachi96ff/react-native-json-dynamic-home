// src/engine/JsonWidgetEngine.tsx

import React from 'react';
import { View, ScrollView, ViewStyle, ImageBackground } from 'react-native';
import { WidgetNode } from '../models/WidgetNode';
import { DynamicScreenConfig } from '../models/DynamicScreenConfig';
import { WidgetRegistry } from './WidgetRegistry';
import { StyleParser } from './StyleParser';
import { AnimationWrapper } from './AnimationWrapper';
import { ErrorBoundary, buildSafe } from './ErrorBoundary';
import { JsonAnalyticsDelegate } from './JsonAnalyticsDelegate';

/** Callback type for native actions. */
export type NativeActionCallback = (params: Record<string, any>) => void;

/**
 * Registry for custom native click actions.
 */
export class NativeActionRegistry {
  private actions: Map<string, NativeActionCallback> = new Map();

  /** Register a native action by ID. */
  register(id: string, callback: NativeActionCallback): void {
    this.actions.set(id, callback);
  }

  /** Execute an action if registered. Returns true if handled. */
  execute(id: string, params: Record<string, any>): boolean {
    const callback = this.actions.get(id);
    if (callback) {
      callback(params);
      return true;
    }
    return false;
  }
}

/** Navigation ref interface for engine to use. */
export interface NavigationRef {
  navigate(screenName: string, params?: Record<string, any>): void;
  goBack(): void;
}

/**
 * React Context to provide the engine down the component tree.
 */
export const JsonWidgetEngineContext = React.createContext<
  JsonWidgetEngine | undefined
>(undefined);

/**
 * Hook to access the engine from context.
 */
export function useJsonWidgetEngine(): JsonWidgetEngine | undefined {
  return React.useContext(JsonWidgetEngineContext);
}

/**
 * The main JSON-to-Component rendering engine.
 *
 * Usage:
 * ```ts
 * const engine = new JsonWidgetEngine();
 * const config = parseDynamicScreenConfig(jsonMap);
 * // In your component:
 * return engine.buildScreen(config, isDark);
 * ```
 *
 * To add custom widget types:
 * ```ts
 * engine.registry.registerSimple('MyWidget', (node, isDark) => <MyWidget />);
 * ```
 */
export class JsonWidgetEngine {
  /** The widget registry mapping type strings to builders. */
  readonly registry: WidgetRegistry;

  /** Track animation delay index for staggered animations. */
  private animationIndex: number = 0;

  /** Registry for custom native actions. */
  readonly actionRegistry: NativeActionRegistry;

  /** Optional delegate to handle analytics events. */
  analyticsDelegate?: JsonAnalyticsDelegate;

  /** Navigation reference for navigate actions. */
  navigationRef?: NavigationRef;

  constructor(options?: {
    registry?: WidgetRegistry;
    actionRegistry?: NativeActionRegistry;
    analyticsDelegate?: JsonAnalyticsDelegate;
    navigationRef?: NavigationRef;
  }) {
    this.registry = options?.registry ?? new WidgetRegistry();
    this.actionRegistry = options?.actionRegistry ?? new NativeActionRegistry();
    this.analyticsDelegate = options?.analyticsDelegate;
    this.navigationRef = options?.navigationRef;
  }

  /** Set the navigation reference (call this from your navigation container). */
  setNavigationRef(ref: NavigationRef): void {
    this.navigationRef = ref;
  }

  /**
   * Build the full screen content from a DynamicScreenConfig.
   * Returns a scrollable or non-scrollable component tree based on config.
   */
  buildScreen(
    config: DynamicScreenConfig,
    isDark: boolean
  ): React.ReactElement {
    this.animationIndex = 0; // Reset for each screen build

    const children = config.widgets.map((node, index) =>
      React.cloneElement(this.buildWidget(node, isDark), { key: `w_${index}` })
    );

    let content: React.ReactElement;

    if (config.scrollable) {
      content = (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignSelf: 'stretch' }}>{children}</View>
        </ScrollView>
      );
    } else {
      content = <View style={{ alignSelf: 'stretch' }}>{children}</View>;
    }

    // Apply screen-level padding
    if (config.padding) {
      content = (
        <View style={StyleParser.edgeInsetsToPadding(config.padding)}>
          {content}
        </View>
      );
    }

    // Apply screen-level background
    content = this.applyScreenBackground(content, config);

    // Apply screen-level margin
    if (config.margin) {
      content = (
        <View style={StyleParser.edgeInsetsToMargin(config.margin)}>
          {content}
        </View>
      );
    }

    return (
      <JsonWidgetEngineContext.Provider value={this}>
        {content}
      </JsonWidgetEngineContext.Provider>
    );
  }

  /**
   * Build the dynamic area (non-scrollable, for embedding).
   * Returns a View of widgets without its own scroll behavior.
   */
  buildArea(
    config: DynamicScreenConfig,
    isDark: boolean
  ): React.ReactElement {
    this.animationIndex = 0;

    const children = config.widgets.map((node, index) =>
      React.cloneElement(this.buildWidget(node, isDark), { key: `w_${index}` })
    );

    let content: React.ReactElement = (
      <View style={{ alignSelf: 'stretch' }}>{children}</View>
    );

    // Apply screen-level padding
    if (config.padding) {
      content = (
        <View style={StyleParser.edgeInsetsToPadding(config.padding)}>
          {content}
        </View>
      );
    }

    // Apply screen-level background
    content = this.applyScreenBackground(content, config);

    // Apply screen-level margin
    if (config.margin) {
      content = (
        <View style={StyleParser.edgeInsetsToMargin(config.margin)}>
          {content}
        </View>
      );
    }

    return (
      <JsonWidgetEngineContext.Provider value={this}>
        {content}
      </JsonWidgetEngineContext.Provider>
    );
  }

  /** Apply background color and/or background image to screen content. */
  private applyScreenBackground(
    content: React.ReactElement,
    config: DynamicScreenConfig
  ): React.ReactElement {
    const bgColor = StyleParser.parseColor(config.background);
    const bgImage = config.backgroundImage;

    if (bgImage) {
      return (
        <ImageBackground
          source={{ uri: bgImage }}
          style={{ flex: 1, backgroundColor: bgColor ?? 'transparent' }}
          resizeMode="cover"
        >
          {content}
        </ImageBackground>
      );
    } else if (bgColor) {
      return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>{content}</View>
      );
    }

    return content;
  }

  /**
   * Build a single widget from a WidgetNode.
   *
   * This is the recursive core of the engine:
   * 1. Check visibility
   * 2. Build the widget via registry
   * 3. Apply styling container
   * 4. Wrap with animation
   * 5. Wrap with error boundary
   */
  buildWidget(node: WidgetNode, isDark: boolean): React.ReactElement {
    return buildSafe(node.type, () => this.buildWidgetInternal(node, isDark));
  }

  private buildWidgetInternal(
    node: WidgetNode,
    isDark: boolean
  ): React.ReactElement {
    // ─── 1. Visibility check ─────────────────────────────────
    if (node.visibility && !node.visibility.visible) {
      return <View style={{ width: 0, height: 0 }} />;
    }

    // ─── 2. Build via registry ───────────────────────────────
    let widget = this.registry.build(node, isDark, this);

    if (!widget) {
      // Unknown widget type — log and show empty
      console.warn(`⚠️ DynamicUI: Unknown widget type "${node.type}"`);
      return <View style={{ width: 0, height: 0 }} />;
    }

    // ─── 3. Apply style container (margin, width/height) ─────
    widget = this.applyStyleWrapper(widget, node, isDark);

    // ─── 4. Animation ────────────────────────────────────────
    if (node.animation && node.animation.length > 0) {
      widget = (
        <AnimationWrapper
          animationType={node.animation}
          delay={50 * this.animationIndex}
        >
          {widget}
        </AnimationWrapper>
      );
      this.animationIndex++;
    }

    return widget;
  }

  /** Apply margin and dimension wrapper around a widget if needed. */
  private applyStyleWrapper(
    widget: React.ReactElement,
    node: WidgetNode,
    isDark: boolean
  ): React.ReactElement {
    const style = node.style;
    if (!style) return widget;

    const margin = style.margin;
    const width = StyleParser.resolveWidth(style);
    const height = StyleParser.resolveHeight(style);

    const isLayout = this.isLayoutType(node.type);

    if (!isLayout) {
      // For content widgets, apply margin/dimensions
      if (margin || width != null || height != null) {
        const wrapperStyle: ViewStyle = {
          ...StyleParser.edgeInsetsToMargin(margin),
          ...(width != null && { width: width as number }),
          ...(height != null && { height: height as number }),
        };
        widget = <View style={wrapperStyle}>{widget}</View>;
      }
    } else if (margin) {
      // For layout widgets, only apply margin
      widget = (
        <View style={StyleParser.edgeInsetsToMargin(margin)}>{widget}</View>
      );
    }

    return widget;
  }

  /** Check if a widget type is a layout/container type. */
  private isLayoutType(type: string): boolean {
    const layoutTypes = new Set([
      'container',
      'card',
      'column',
      'row',
      'grid',
      'list',
      'horizontallist',
      'padding',
      'center',
      'sizedbox',
      'spacer',
      'expanded',
      'banner',
    ]);
    return layoutTypes.has(type.toLowerCase());
  }
}
