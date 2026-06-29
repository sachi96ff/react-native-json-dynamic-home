// src/engine/WidgetRegistry.tsx

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
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

    // ─── New Advanced Widgets ─────────────────────────────────
    this.registerEngine('Stack', this.buildStack);
    this.registerEngine('Wrap', this.buildWrap);
    this.registerSimple('Chip', this.buildChip);
    this.registerSimple('ProgressBar', this.buildProgressBar);
    this.registerEngine('Badge', this.buildBadge);
    this.registerSimple('Avatar', this.buildAvatar);
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

  /** Stack widget — overlapping children. */
  private buildStack(node: WidgetNode, isDark: boolean, engine: JsonWidgetEngine): React.ReactElement {
    const children = node.children.map((child, i) =>
      React.cloneElement(engine.buildWidget(child, isDark), { key: `s_${i}` })
    );

    return (
      <View style={{ position: 'relative', minHeight: (node.style?.height ?? 200) as import('react-native').DimensionValue }}>
        {children.map((child, i) => (
          <View key={`stack_${i}`} style={i === 0 ? {} : { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {child}
          </View>
        ))}
      </View>
    );
  }

  /** Wrap widget — flow layout. */
  private buildWrap(node: WidgetNode, isDark: boolean, engine: JsonWidgetEngine): React.ReactElement {
    const spacing = node.properties.spacing ?? 8;
    const runSpacing = node.properties.runSpacing ?? 8;

    const children = node.children.map((child, i) =>
      React.cloneElement(engine.buildWidget(child, isDark), { key: `w_${i}` })
    );

    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing, rowGap: runSpacing }}>
        {children}
      </View>
    );
  }

  /** Chip widget — small label/tag. */
  private buildChip(node: WidgetNode, isDark: boolean): React.ReactElement {
    const text = node.properties.text ?? 'Chip';
    const variant = node.properties.variant ?? 'filled';
    const bgColor = node.style?.background ?? '#EEF2FF';
    const textColor = node.style?.textColor ?? '#4338CA';
    const radius = node.style?.radius ?? 20;

    const chipStyle: any = {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: radius,
    };

    if (variant === 'outlined') {
      chipStyle.borderWidth = 1.5;
      chipStyle.borderColor = textColor;
      chipStyle.backgroundColor = 'transparent';
    } else {
      chipStyle.backgroundColor = bgColor;
    }

    return (
      <View style={chipStyle}>
        <View><Text style={{ color: textColor, fontSize: node.style?.fontSize ?? 12, fontWeight: '500' }}>{text}</Text></View>
      </View>
    );
  }

  /** ProgressBar widget — linear progress indicator. */
  private buildProgressBar(node: WidgetNode, isDark: boolean): React.ReactElement {
    const value = Math.min(1, Math.max(0, node.properties.value ?? 0.65));
    const label = node.properties.label ?? '';
    const showLabel = node.properties.show_label !== false;
    const trackColor = node.properties.track_color ?? '#E5E7EB';
    const barColor = node.properties.bar_color ?? '#6366F1';
    const height = node.style?.height ?? 8;
    const radius = node.style?.radius ?? 4;

    return (
      <View style={{ width: '100%' }}>
        {showLabel && label ? (
          <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{label}</Text>
        ) : null}
        <View style={{ height: height as import('react-native').DimensionValue, borderRadius: radius, backgroundColor: trackColor, overflow: 'hidden' }}>
          <View style={{ width: `${value * 100}%`, height: '100%', borderRadius: radius, backgroundColor: barColor }} />
        </View>
      </View>
    );
  }

  /** Badge widget — notification badge. */
  private buildBadge(node: WidgetNode, isDark: boolean, engine: JsonWidgetEngine): React.ReactElement {
    const count = node.properties.count ?? 0;
    const maxCount = node.properties.max_count ?? 99;
    const showDot = node.properties.show_dot ?? false;
    const badgeColor = node.properties.badge_color ?? '#EF4444';
    const display = count > maxCount ? `${maxCount}+` : `${count}`;

    const children = node.children.map((child, i) =>
      React.cloneElement(engine.buildWidget(child, isDark), { key: `b_${i}` })
    );

    const childContent = children.length > 0 ? children[0] : <View style={{ width: 24, height: 24 }} />;

    return (
      <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
        {childContent}
        {showDot ? (
          <View style={{
            position: 'absolute', top: -3, right: -3,
            width: 10, height: 10, borderRadius: 5,
            backgroundColor: badgeColor, borderWidth: 2, borderColor: 'white',
          }} />
        ) : count > 0 ? (
          <View style={{
            position: 'absolute', top: -6, right: -6,
            minWidth: 18, height: 18, borderRadius: 9,
            backgroundColor: badgeColor, justifyContent: 'center',
            alignItems: 'center', paddingHorizontal: 4,
            borderWidth: 2, borderColor: 'white',
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>{display}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  /** Avatar widget — circular user image. */
  private buildAvatar(node: WidgetNode, isDark: boolean): React.ReactElement {
    const imageUrl = node.properties.image_url ?? '';
    const text = node.properties.text ?? 'U';
    const size = node.properties.size ?? 48;
    const bgColor = node.style?.background ?? '#6366F1';

    return (
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: bgColor, justifyContent: 'center',
        alignItems: 'center', overflow: 'hidden',
      }}>
        {imageUrl ? (
          <View><Image source={{ uri: imageUrl }} style={{ width: size, height: size }} /></View>
        ) : (
          <Text style={{
            color: 'white', fontSize: size * 0.4,
            fontWeight: '700', textTransform: 'uppercase',
          }}>
            {text.substring(0, 2)}
          </Text>
        )}
      </View>
    );
  }
}
