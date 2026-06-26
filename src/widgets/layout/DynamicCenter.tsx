// src/widgets/layout/DynamicCenter.tsx

import React from 'react';
import { View } from 'react-native';
import { WidgetNode } from '../../models/WidgetNode';
import type { JsonWidgetEngine } from '../../engine/JsonWidgetEngine';

/**
 * Centers its child.
 */
export class DynamicCenter {
  static build(
    node: WidgetNode,
    isDark: boolean,
    engine: JsonWidgetEngine
  ): React.ReactElement {
    let child: React.ReactElement | undefined;
    if (node.children.length > 0) {
      child = engine.buildWidget(node.children[0], isDark);
    }

    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        {child ?? <View />}
      </View>
    );
  }
}
