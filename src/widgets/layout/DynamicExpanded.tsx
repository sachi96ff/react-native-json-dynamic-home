// src/widgets/layout/DynamicExpanded.tsx

import React from 'react';
import { View } from 'react-native';
import { WidgetNode, getInt } from '../../models/WidgetNode';
import type { JsonWidgetEngine } from '../../engine/JsonWidgetEngine';

/**
 * Wraps a child in a flex-expanding view (for use inside Row/Column).
 */
export class DynamicExpanded {
  static build(
    node: WidgetNode,
    isDark: boolean,
    engine: JsonWidgetEngine
  ): React.ReactElement {
    const flex = getInt(node, 'flex', 1) ?? 1;

    let child: React.ReactElement | undefined;
    if (node.children.length > 0) {
      child = engine.buildWidget(node.children[0], isDark);
    }

    return <View style={{ flex }}>{child ?? <View />}</View>;
  }
}
