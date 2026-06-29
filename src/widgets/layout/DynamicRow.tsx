// src/widgets/layout/DynamicRow.tsx

import React from 'react';
import { View } from 'react-native';
import { WidgetNode, getString, getDouble } from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import type { JsonWidgetEngine } from '../../engine/JsonWidgetEngine';

/**
 * Renders children horizontally in a row.
 */
export class DynamicRow {
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
    const padding = node.style?.padding
      ? StyleParser.edgeInsetsToPadding(node.style.padding)
      : {};
    const margin = node.style?.margin
      ? StyleParser.edgeInsetsToMargin(node.style.margin)
      : {};

    const children: React.ReactElement[] = [];
    for (let i = 0; i < node.children.length; i++) {
      children.push(
        <React.Fragment key={`row_${i}`}>
          {engine.buildWidget(node.children[i], isDark)}
        </React.Fragment>
      );
      if (spacing > 0 && i < node.children.length - 1) {
        children.push(
          <View key={`row_sp_${i}`} style={{ width: spacing }} />
        );
      }
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: mainAxis,
          alignItems: crossAxis,
          ...padding,
          ...margin,
        }}
      >
        {children}
      </View>
    );
  }
}
