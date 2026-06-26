// src/widgets/layout/DynamicPadding.tsx

import React from 'react';
import { View } from 'react-native';
import { WidgetNode } from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import { parseEdgeInsets } from '../../models/WidgetStyle';
import type { JsonWidgetEngine } from '../../engine/JsonWidgetEngine';

/**
 * Wraps children with padding.
 */
export class DynamicPadding {
  static build(
    node: WidgetNode,
    isDark: boolean,
    engine: JsonWidgetEngine
  ): React.ReactElement {
    // Get padding from style or properties
    let paddingInsets = node.style?.padding;

    // Also check properties for padding
    const propPadding = node.properties.padding;
    if (propPadding != null) {
      paddingInsets = parseEdgeInsets(propPadding);
    }

    const paddingStyle = paddingInsets
      ? StyleParser.edgeInsetsToPadding(paddingInsets)
      : {};

    let child: React.ReactElement;
    if (node.children.length === 1) {
      child = engine.buildWidget(node.children[0], isDark);
    } else if (node.children.length > 1) {
      child = (
        <View>
          {node.children.map((c, i) => (
            <React.Fragment key={`padding_${i}`}>
              {engine.buildWidget(c, isDark)}
            </React.Fragment>
          ))}
        </View>
      );
    } else {
      child = <View />;
    }

    return <View style={paddingStyle}>{child}</View>;
  }
}
