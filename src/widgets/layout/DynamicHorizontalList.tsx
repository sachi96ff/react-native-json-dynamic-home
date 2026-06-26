// src/widgets/layout/DynamicHorizontalList.tsx

import React from 'react';
import { View, ScrollView } from 'react-native';
import {
  WidgetNode,
  parseWidgetNode,
  getDouble,
} from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import type { JsonWidgetEngine } from '../../engine/JsonWidgetEngine';

/**
 * Renders children in a horizontally scrolling list.
 */
export class DynamicHorizontalList {
  static build(
    node: WidgetNode,
    isDark: boolean,
    engine: JsonWidgetEngine
  ): React.ReactElement {
    const itemWidth =
      getDouble(node, 'item_width') ?? getDouble(node, 'itemWidth');
    const spacing = getDouble(node, 'spacing', 12) ?? 12;
    const height = (StyleParser.resolveHeight(node.style) as number) ?? 180;
    const padding = node.style?.padding;

    // Gather items from children or properties.items
    let items = node.children;
    if (items.length === 0 && Array.isArray(node.properties.items)) {
      items = node.properties.items
        .filter((item: any) => typeof item === 'object' && item !== null)
        .map((item: Record<string, any>) => parseWidgetNode(item));
    }

    if (items.length === 0) return <View />;

    return (
      <View style={{ height }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            padding ? StyleParser.edgeInsetsToPadding(padding) : {}
          }
        >
          {items.map((item, index) => (
            <View
              key={`hlist_${index}`}
              style={{
                ...(itemWidth != null && { width: itemWidth }),
                marginRight: index < items.length - 1 ? spacing : 0,
              }}
            >
              {engine.buildWidget(item, isDark)}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}
