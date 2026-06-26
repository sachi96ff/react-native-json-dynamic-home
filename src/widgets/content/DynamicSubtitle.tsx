// src/widgets/content/DynamicSubtitle.tsx

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { WidgetNode, getString, getClickAction } from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import { ActionHandler } from '../../engine/ActionHandler';

/**
 * Renders a subtitle / sub-heading.
 *
 * JSON example:
 * ```json
 * {
 *   "type": "Subtitle",
 *   "properties": { "text": "Recommended for you" },
 *   "style": { "fontSize": 16, "fontWeight": "semibold", "textColor": "#6B7280" }
 * }
 * ```
 */
export class DynamicSubtitle {
  static build(node: WidgetNode, isDark: boolean): React.ReactElement {
    const text = getString(node, 'text', '') ?? '';
    const textStyle = StyleParser.buildTextStyle(
      node.style,
      isDark,
      16,
      'semibold'
    );
    const textAlign = StyleParser.parseTextAlign(
      node.style?.textAlign ?? node.style?.alignment
    );

    const onTap = ActionHandler.buildCallback(
      undefined,
      getClickAction(node),
      node.analytics
    );

    const subtitleElement = (
      <Text
        style={[textStyle, { textAlign }]}
        numberOfLines={node.style?.maxLines}
        ellipsizeMode={node.style?.maxLines ? 'tail' : undefined}
      >
        {text}
      </Text>
    );

    if (onTap) {
      return (
        <TouchableOpacity onPress={onTap} activeOpacity={0.7}>
          {subtitleElement}
        </TouchableOpacity>
      );
    }

    return subtitleElement;
  }
}
