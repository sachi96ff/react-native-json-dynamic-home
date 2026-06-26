// src/widgets/content/DynamicText.tsx

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import {
  WidgetNode,
  getString,
  getInt,
  getClickAction,
} from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import { ActionHandler } from '../../engine/ActionHandler';

/**
 * Renders body text / paragraph.
 *
 * JSON example:
 * ```json
 * {
 *   "type": "Text",
 *   "properties": { "text": "Practice daily to improve your scores.", "maxLines": 3 },
 *   "style": { "fontSize": 14, "textColor": "#6B7280" }
 * }
 * ```
 */
export class DynamicText {
  static build(node: WidgetNode, isDark: boolean): React.ReactElement {
    const text = getString(node, 'text', '') ?? '';
    const maxLines = getInt(node, 'maxLines') ?? node.style?.maxLines;
    const textStyle = StyleParser.buildTextStyle(
      node.style,
      isDark,
      14,
      'normal'
    );
    const textAlign = StyleParser.parseTextAlign(
      node.style?.textAlign ?? node.style?.alignment
    );

    const onTap = ActionHandler.buildCallback(
      undefined,
      getClickAction(node),
      node.analytics
    );

    const textElement = (
      <Text
        style={[textStyle, { textAlign }]}
        numberOfLines={maxLines}
        ellipsizeMode={maxLines ? 'tail' : undefined}
      >
        {text}
      </Text>
    );

    if (onTap) {
      return (
        <TouchableOpacity onPress={onTap} activeOpacity={0.7}>
          {textElement}
        </TouchableOpacity>
      );
    }

    return textElement;
  }
}
