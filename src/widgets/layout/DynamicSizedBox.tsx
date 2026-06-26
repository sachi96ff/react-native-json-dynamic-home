// src/widgets/layout/DynamicSizedBox.tsx

import React from 'react';
import { View } from 'react-native';
import { WidgetNode, getDouble } from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import type { JsonWidgetEngine } from '../../engine/JsonWidgetEngine';

/**
 * Renders a SizedBox/Spacer with fixed width/height.
 */
export class DynamicSizedBox {
  static build(
    node: WidgetNode,
    isDark: boolean,
    engine: JsonWidgetEngine
  ): React.ReactElement {
    const width =
      (StyleParser.resolveWidth(node.style) as number) ??
      getDouble(node, 'width');
    const height =
      (StyleParser.resolveHeight(node.style) as number) ??
      getDouble(node, 'height');

    let child: React.ReactElement | undefined;
    if (node.children.length === 1) {
      child = engine.buildWidget(node.children[0], isDark);
    }

    return (
      <View
        style={{
          ...(width != null && { width }),
          ...(height != null && { height }),
        }}
      >
        {child}
      </View>
    );
  }
}
