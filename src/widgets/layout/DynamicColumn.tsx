// src/widgets/layout/DynamicColumn.tsx

import React from 'react';
import { View } from 'react-native';
import { WidgetNode, getString, getDouble } from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import type { JsonWidgetEngine } from '../../engine/JsonWidgetEngine';

/**
 * Renders children vertically in a column.
 */
export class DynamicColumn {
  static build(
    node: WidgetNode,
    isDark: boolean,
    engine: JsonWidgetEngine
  ): React.ReactElement {
    const mainAxis = StyleParser.parseMainAxisAlignment(
      getString(node, 'mainAxisAlignment') ??
        getString(node, 'main_axis_alignment')
    );
    const crossAxis = StyleParser.parseCrossAxisAlignment(
      getString(node, 'crossAxisAlignment') ??
        getString(node, 'cross_axis_alignment')
    );
    const spacing = getDouble(node, 'spacing', 0) ?? 0;

    const children: React.ReactElement[] = [];
    for (let i = 0; i < node.children.length; i++) {
      children.push(
        <React.Fragment key={`col_${i}`}>
          {engine.buildWidget(node.children[i], isDark)}
        </React.Fragment>
      );
      if (spacing > 0 && i < node.children.length - 1) {
        children.push(<View key={`col_sp_${i}`} style={{ height: spacing }} />);
      }
    }

    return (
      <View
        style={{
          justifyContent: mainAxis,
          alignItems: crossAxis,
        }}
      >
        {children}
      </View>
    );
  }
}
