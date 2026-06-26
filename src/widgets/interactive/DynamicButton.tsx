// src/widgets/interactive/DynamicButton.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import {
  WidgetNode,
  getString,
  getBool,
  getClickAction,
} from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import { ActionHandler } from '../../engine/ActionHandler';

/**
 * Renders a button (filled, outlined, or text variant).
 *
 * JSON example:
 * ```json
 * {
 *   "type": "Button",
 *   "properties": {
 *     "text": "Start Practice",
 *     "variant": "filled",
 *     "icon": "play",
 *     "on_click": { "action": "navigate_named", "route": "/practice" }
 *   },
 *   "style": { "radius": 12, "background": "#1A3BCC" }
 * }
 * ```
 */
export class DynamicButton {
  static build(node: WidgetNode, isDark: boolean): React.ReactElement {
    const text = getString(node, 'text', 'Button') ?? 'Button';
    const variant = getString(node, 'variant', 'filled') ?? 'filled';
    const disabled = getBool(node, 'disabled');
    const fullWidth = getBool(node, 'full_width', false);

    const style = node.style;
    const bgColor =
      StyleParser.parseColor(style?.background) ?? '#1A3BCC';
    const textColor = StyleParser.parseColor(style?.textColor);
    const borderColor = StyleParser.parseColor(style?.border);
    const radius = style?.radius ?? 12;
    const fontSize = style?.fontSize ?? 14;

    const onTap = disabled
      ? undefined
      : ActionHandler.buildCallback(
          undefined,
          getClickAction(node),
          node.analytics
        ) ?? (() => {});

    let button: React.ReactElement;

    switch (variant) {
      case 'outlined':
        button = buildOutlined({
          text,
          bgColor,
          textColor,
          borderColor,
          radius,
          fontSize,
          onTap,
        });
        break;

      case 'text':
        button = buildTextButton({
          text,
          textColor: textColor ?? bgColor,
          fontSize,
          onTap,
        });
        break;

      case 'filled':
      default:
        button = buildFilled({
          text,
          bgColor,
          textColor,
          radius,
          fontSize,
          onTap,
        });
        break;
    }

    if (fullWidth) {
      return <View style={{ width: '100%' }}>{button}</View>;
    }

    return <View style={{ alignSelf: 'flex-start' }}>{button}</View>;
  }
}

// ─── Button Builders ─────────────────────────────────────

function buildFilled(props: {
  text: string;
  bgColor: string;
  textColor?: string;
  radius: number;
  fontSize: number;
  onTap?: () => void;
}): React.ReactElement {
  const fgColor = props.textColor ?? '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={props.onTap}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: props.bgColor,
          borderRadius: props.radius,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: fgColor,
            fontSize: props.fontSize,
          },
        ]}
      >
        {props.text}
      </Text>
    </TouchableOpacity>
  );
}

function buildOutlined(props: {
  text: string;
  bgColor: string;
  textColor?: string;
  borderColor?: string;
  radius: number;
  fontSize: number;
  onTap?: () => void;
}): React.ReactElement {
  const fgColor = props.textColor ?? props.bgColor;

  return (
    <TouchableOpacity
      onPress={props.onTap}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: 'transparent',
          borderRadius: props.radius,
          borderWidth: 1.5,
          borderColor: props.borderColor ?? props.bgColor,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: fgColor,
            fontSize: props.fontSize,
          },
        ]}
      >
        {props.text}
      </Text>
    </TouchableOpacity>
  );
}

function buildTextButton(props: {
  text: string;
  textColor: string;
  fontSize: number;
  onTap?: () => void;
}): React.ReactElement {
  return (
    <TouchableOpacity onPress={props.onTap} activeOpacity={0.7}>
      <Text
        style={[
          styles.buttonText,
          {
            color: props.textColor,
            fontSize: props.fontSize,
          },
        ]}
      >
        {props.text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
});
