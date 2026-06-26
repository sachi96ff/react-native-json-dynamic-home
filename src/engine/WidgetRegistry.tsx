// src/engine/WidgetRegistry.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WidgetNode } from '../models/WidgetNode';
import type { JsonWidgetEngine } from './JsonWidgetEngine';
import { StyleParser } from './StyleParser';

// Content widgets
import { DynamicTitle } from '../widgets/content/DynamicTitle';
import { DynamicSubtitle } from '../widgets/content/DynamicSubtitle';
import { DynamicText } from '../widgets/content/DynamicText';
import { DynamicImage } from '../widgets/content/DynamicImage';
import { DynamicBanner } from '../widgets/content/DynamicBanner';
import { DynamicIcon } from '../widgets/content/DynamicIcon';

// Interactive widgets
import { DynamicButton } from '../widgets/interactive/DynamicButton';
import { DynamicIconButton } from '../widgets/interactive/DynamicIconButton';
import { DynamicCard } from '../widgets/interactive/DynamicCard';

// Layout widgets
import { DynamicColumn } from '../widgets/layout/DynamicColumn';
import { DynamicRow } from '../widgets/layout/DynamicRow';
import { DynamicContainer } from '../widgets/layout/DynamicContainer';
import { DynamicPadding } from '../widgets/layout/DynamicPadding';
import { DynamicSizedBox } from '../widgets/layout/DynamicSizedBox';
import { DynamicExpanded } from '../widgets/layout/DynamicExpanded';
import { DynamicCenter } from '../widgets/layout/DynamicCenter';
import { DynamicGrid } from '../widgets/layout/DynamicGrid';
import { DynamicList } from '../widgets/layout/DynamicList';
import { DynamicHorizontalList } from '../widgets/layout/DynamicHorizontalList';

/**
 * Callback type for building a component from a node.
 *
 * - SimpleWidgetBuilder: Widgets that don't need the engine (leaf widgets).
 * - EngineWidgetBuilder: Widgets that need the engine to render children.
 */
export type SimpleWidgetBuilder = (
  node: WidgetNode,
  isDark: boolean
) => React.ReactElement;

export type EngineWidgetBuilder = (
  node: WidgetNode,
  isDark: boolean,
  engine: JsonWidgetEngine
) => React.ReactElement;

/**
 * Registry that maps widget type strings to their builder functions.
 *
 * Usage:
 * ```ts
 * const registry = new WidgetRegistry();
 * // Custom widget:
 * registry.registerSimple('MyWidget', (node, isDark) => <MyWidget ... />);
 * ```
 */
export class WidgetRegistry {
  private simpleBuilders: Map<string, SimpleWidgetBuilder> = new Map();
  private engineBuilders: Map<string, EngineWidgetBuilder> = new Map();

  constructor() {
    this.registerDefaults();
  }

  /** Register a leaf widget builder (no children). */
  registerSimple(type: string, builder: SimpleWidgetBuilder): void {
    this.simpleBuilders.set(type.toLowerCase(), builder);
  }

  /** Register a layout/container widget builder (has children, needs engine). */
  registerEngine(type: string, builder: EngineWidgetBuilder): void {
    this.engineBuilders.set(type.toLowerCase(), builder);
  }

  /** Check if a widget type is registered. */
  hasBuilder(type: string): boolean {
    const key = type.toLowerCase();
    return this.simpleBuilders.has(key) || this.engineBuilders.has(key);
  }

  /** Build a widget from a node. Returns null if type is not registered. */
  build(
    node: WidgetNode,
    isDark: boolean,
    engine: JsonWidgetEngine
  ): React.ReactElement | null {
    const key = node.type.toLowerCase();

    // Try engine builders first (layout widgets)
    const engineBuilder = this.engineBuilders.get(key);
    if (engineBuilder) {
      return engineBuilder(node, isDark, engine);
    }

    // Then simple builders (leaf widgets)
    const simpleBuilder = this.simpleBuilders.get(key);
    if (simpleBuilder) {
      return simpleBuilder(node, isDark);
    }

    return null;
  }

  /** Register all default widget types. */
  private registerDefaults(): void {
    // ─── Content Widgets (leaf — no children) ─────────────────
    this.registerSimple('Title', DynamicTitle.build);
    this.registerSimple('Subtitle', DynamicSubtitle.build);
    this.registerSimple('Text', DynamicText.build);
    this.registerSimple('Image', DynamicImage.build);
    this.registerSimple('Banner', DynamicBanner.build);
    this.registerSimple('Icon', DynamicIcon.build);

    // ─── Interactive Widgets ─────────────────────────────────
    this.registerSimple('Button', DynamicButton.build);
    this.registerSimple('IconButton', DynamicIconButton.build);

    // Card needs engine for children
    this.registerEngine('Card', DynamicCard.build);
    this.registerEngine('DynamicCard', DynamicCard.build);

    // ─── Layout Widgets (need engine for children) ────────────
    this.registerEngine('Column', DynamicColumn.build);
    this.registerEngine('Row', DynamicRow.build);
    this.registerEngine('Container', DynamicContainer.build);
    this.registerEngine('Padding', DynamicPadding.build);
    this.registerEngine('SizedBox', DynamicSizedBox.build);
    this.registerEngine('Spacer', DynamicSizedBox.build); // Alias
    this.registerEngine('Expanded', DynamicExpanded.build);
    this.registerEngine('Center', DynamicCenter.build);
    this.registerEngine('Grid', DynamicGrid.build);
    this.registerEngine('List', DynamicList.build);
    this.registerEngine('HorizontalList', DynamicHorizontalList.build);

    // ─── Aliases for convenience ─────────────────────────────
    this.registerSimple('Heading', DynamicTitle.build);
    this.registerSimple('H1', DynamicTitle.build);
    this.registerSimple('H2', DynamicSubtitle.build);
    this.registerSimple('Paragraph', DynamicText.build);
    this.registerSimple('NetworkImage', DynamicImage.build);
    this.registerSimple('Divider', this.buildDivider);
  }

  /** Built-in divider widget. */
  private buildDivider(node: WidgetNode, isDark: boolean): React.ReactElement {
    const color = node.style?.border
      ? StyleParser.parseColor(node.style.border)
      : undefined;
    const thickness = node.properties.thickness ?? 1;
    const indent = node.properties.indent ?? 0;

    return (
      <View
        style={{
          height: thickness,
          backgroundColor: color ?? (isDark ? '#333333' : '#E0E0E0'),
          marginLeft: indent,
          marginRight: indent,
          marginVertical: node.properties.height ?? 0.5,
        }}
      />
    );
  }
}
