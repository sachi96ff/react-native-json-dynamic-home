// src/widgets/layout/DynamicContainer.tsx

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { WidgetNode, getString, getClickAction } from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import { ActionHandler } from '../../engine/ActionHandler';
import type { JsonWidgetEngine } from '../../engine/JsonWidgetEngine';

/**
 * Renders a styled container that wraps its children.
 * This is the most versatile layout widget.
 */
export class DynamicContainer {
  static build(
    node: WidgetNode,
    isDark: boolean,
    engine: JsonWidgetEngine
  ): React.ReactElement {
    const style = node.style;
    const decoration = StyleParser.buildDecoration(style, isDark);
    const padding = style?.padding
      ? StyleParser.edgeInsetsToPadding(style.padding)
      : {};
    const margin = style?.margin
      ? StyleParser.edgeInsetsToMargin(style.margin)
      : {};
    const width = StyleParser.resolveWidth(style);
    const height = StyleParser.resolveHeight(style);
    const alignment = style?.alignment
      ? StyleParser.parseAlignment(style.alignment)
      : undefined;
    const opacity = style?.opacity;

    const onTap = ActionHandler.buildCallback(
      engine,
      getClickAction(node),
      node.analytics
    );

    // Child content
    let child: React.ReactElement | null = null;
    if (node.children.length > 0) {
      const alignStr = getString(node, 'alignment') ?? 'start';
      let alignItems: 'flex-start' | 'center' | 'flex-end' = 'flex-start';
      if (alignStr === 'center') alignItems = 'center';
      else if (alignStr === 'end') alignItems = 'flex-end';

      child = (
        <View style={{ alignItems }}>
          {node.children.map((c, i) => (
            <React.Fragment key={`container_${i}`}>
              {engine.buildWidget(c, isDark)}
            </React.Fragment>
          ))}
        </View>
      );
    }

    const containerStyle = {
      ...decoration,
      ...padding,
      ...margin,
      ...(width != null && { width: width as number }),
      ...(height != null && { height: height as number }),
      ...(alignment && {
        justifyContent: alignment.justifyContent,
        alignItems: alignment.alignItems,
      }),
      ...(opacity != null && opacity < 1 && { opacity }),
    };

    if (onTap) {
      return (
        <TouchableOpacity
          onPress={onTap}
          activeOpacity={0.8}
          style={containerStyle}
        >
          {child}
        </TouchableOpacity>
      );
    }

    return <View style={containerStyle}>{child}</View>;
  }
}
