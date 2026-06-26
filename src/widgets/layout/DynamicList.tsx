// src/widgets/layout/DynamicList.tsx

import React from 'react';
import { View } from 'react-native';
import {
  WidgetNode,
  parseWidgetNode,
  getBool,
  getDouble,
} from '../../models/WidgetNode';
import type { JsonWidgetEngine } from '../../engine/JsonWidgetEngine';

/**
 * Renders children in a vertical list with optional separators.
 */
export class DynamicList {
  static build(
    node: WidgetNode,
    isDark: boolean,
    engine: JsonWidgetEngine
  ): React.ReactElement {
    const separator = getBool(node, 'separator', false);
    const spacing = getDouble(node, 'spacing', 0) ?? 0;

    // Gather items
    let items = node.children;
    if (items.length === 0 && Array.isArray(node.properties.items)) {
      items = node.properties.items
        .filter((item: any) => typeof item === 'object' && item !== null)
        .map((item: Record<string, any>) => parseWidgetNode(item));
    }

    if (items.length === 0) return <View />;

    return (
      <View>
        {items.map((item, index) => (
          <React.Fragment key={`list_${index}`}>
            {engine.buildWidget(item, isDark)}
            {index < items.length - 1 && (
              <>
                {separator ? (
                  <View>
                    {spacing > 0 && (
                      <View style={{ height: spacing / 2 }} />
                    )}
                    <View
                      style={{
                        height: 1,
                        backgroundColor: isDark ? '#333333' : '#E0E0E0',
                      }}
                    />
                    {spacing > 0 && (
                      <View style={{ height: spacing / 2 }} />
                    )}
                  </View>
                ) : (
                  spacing > 0 && <View style={{ height: spacing }} />
                )}
              </>
            )}
          </React.Fragment>
        ))}
      </View>
    );
  }
}
