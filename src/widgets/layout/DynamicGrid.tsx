// src/widgets/layout/DynamicGrid.tsx

import React from 'react';
import { View, FlatList } from 'react-native';
import {
  WidgetNode,
  parseWidgetNode,
  getInt,
  getDouble,
} from '../../models/WidgetNode';
import type { JsonWidgetEngine } from '../../engine/JsonWidgetEngine';

/**
 * Renders children in a grid layout.
 */
export class DynamicGrid {
  static build(
    node: WidgetNode,
    isDark: boolean,
    engine: JsonWidgetEngine
  ): React.ReactElement {
    const columns = getInt(node, 'columns', 2) ?? 2;
    const spacing = getDouble(node, 'spacing', 12) ?? 12;
    const runSpacing =
      getDouble(node, 'runSpacing') ??
      getDouble(node, 'run_spacing', 12) ??
      12;

    // Gather items from children or properties.items
    let items = node.children;
    if (items.length === 0 && Array.isArray(node.properties.items)) {
      items = node.properties.items
        .filter((item: any) => typeof item === 'object' && item !== null)
        .map((item: Record<string, any>) => parseWidgetNode(item));
    }

    if (items.length === 0) return <View />;

    // Build grid rows manually
    const rows: WidgetNode[][] = [];
    for (let i = 0; i < items.length; i += columns) {
      rows.push(items.slice(i, i + columns));
    }

    return (
      <View>
        {rows.map((row, rowIndex) => (
          <View
            key={`grid_row_${rowIndex}`}
            style={{
              flexDirection: 'row',
              marginBottom:
                rowIndex < rows.length - 1 ? runSpacing : 0,
            }}
          >
            {row.map((item, colIndex) => (
              <View
                key={`grid_item_${rowIndex}_${colIndex}`}
                style={{
                  flex: 1,
                  marginRight:
                    colIndex < columns - 1 ? spacing : 0,
                }}
              >
                {engine.buildWidget(item, isDark)}
              </View>
            ))}
            {/* Fill remaining columns with empty views */}
            {row.length < columns &&
              Array.from({ length: columns - row.length }).map(
                (_, i) => (
                  <View
                    key={`grid_empty_${rowIndex}_${i}`}
                    style={{
                      flex: 1,
                      marginRight:
                        i + row.length < columns - 1 ? spacing : 0,
                    }}
                  />
                )
              )}
          </View>
        ))}
      </View>
    );
  }
}
