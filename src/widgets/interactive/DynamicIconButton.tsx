// src/widgets/interactive/DynamicIconButton.tsx

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
  WidgetNode,
  getString,
  getDouble,
  getClickAction,
} from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import { ActionHandler } from '../../engine/ActionHandler';
import { DynamicIcon } from '../content/DynamicIcon';

/**
 * Renders a circular icon button.
 *
 * JSON example:
 * ```json
 * {
 *   "type": "IconButton",
 *   "properties": {
 *     "icon": "play",
 *     "size": 20,
 *     "on_click": { "action": "navigate_named", "route": "/practice" }
 *   },
 *   "style": {
 *     "background": "#1A3BCC",
 *     "textColor": "#FFFFFF",
 *     "radius": 16
 *   }
 * }
 * ```
 */
export class DynamicIconButton {
  static build(node: WidgetNode, isDark: boolean): React.ReactElement {
    const iconName = getString(node, 'icon', 'circle') ?? 'circle';
    const size = getDouble(node, 'size', 20) ?? 20;
    const containerSize = getDouble(node, 'container_size', 40) ?? 40;
    const style = node.style;

    const bgColor = StyleParser.parseColor(style?.background);
    const iconColor =
      StyleParser.parseColor(style?.textColor) ??
      (isDark ? '#FFFFFF' : '#1A1A1A');
    const radius = style?.radius ?? 16;

    const onTap = ActionHandler.buildCallback(
      undefined,
      getClickAction(node),
      node.analytics
    );

    return (
      <View style={{ alignSelf: 'flex-start' }}>
        <TouchableOpacity
          onPress={onTap}
          activeOpacity={0.7}
          style={{
            width: containerSize,
            height: containerSize,
            borderRadius: radius,
            backgroundColor: bgColor ?? 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {DynamicIcon.renderIcon(iconName, size, iconColor)}
        </TouchableOpacity>
      </View>
    );
  }
}
