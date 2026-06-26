// src/widgets/content/DynamicTitle.tsx

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { WidgetNode, getString, getClickAction } from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import { ActionHandler } from '../../engine/ActionHandler';

/**
 * Renders a section title/heading.
 *
 * JSON example:
 * ```json
 * {
 *   "type": "Title",
 *   "properties": { "text": "Continue Learning" },
 *   "style": { "fontSize": 20, "fontWeight": "bold", "textColor": "#1A1A1A" }
 * }
 * ```
 */
export class DynamicTitle {
  static build(node: WidgetNode, isDark: boolean): React.ReactElement {
    const text = getString(node, 'text', '') ?? '';
    const textStyle = StyleParser.buildTextStyle(
      node.style,
      isDark,
      20,
      'bold'
    );
    const textAlign = StyleParser.parseTextAlign(
      node.style?.textAlign ?? node.style?.alignment
    );

    const onTap = ActionHandler.buildCallback(
      undefined,
      getClickAction(node),
      node.analytics
    );

    const titleElement = (
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
          {titleElement}
        </TouchableOpacity>
      );
    }

    return titleElement;
  }
}
