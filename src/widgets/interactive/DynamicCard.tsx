// src/widgets/interactive/DynamicCard.tsx

import React from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import {
  WidgetNode,
  getString,
  getClickAction,
} from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import { ActionHandler } from '../../engine/ActionHandler';
import type { JsonWidgetEngine } from '../../engine/JsonWidgetEngine';

/**
 * Renders a styled card widget.
 *
 * If `children` are provided, renders them inside the card.
 * Otherwise, renders using `title`, `subtitle`, `body`, `image_url` properties.
 *
 * JSON example:
 * ```json
 * {
 *   "type": "Card",
 *   "properties": {
 *     "title": "SSC CGL 2024",
 *     "subtitle": "120 questions · 60 min",
 *     "image_url": "https://...",
 *     "on_click": { "action": "navigate", "json_file": "exam.json" }
 *   },
 *   "style": { "radius": 16, "shadow": true, "padding": 16 }
 * }
 * ```
 */
export class DynamicCard {
  static build(
    node: WidgetNode,
    isDark: boolean,
    engine: JsonWidgetEngine
  ): React.ReactElement {
    const style = node.style;

    const bgColor =
      StyleParser.parseColor(style?.background) ??
      (isDark ? '#1E1E2E' : '#FFFFFF');
    const borderColor =
      StyleParser.parseColor(style?.border) ??
      (isDark ? '#333333' : '#E5E7EB');
    const radius = style?.radius ?? 16;
    const padding = style?.padding ?? {
      top: 16,
      bottom: 16,
      left: 16,
      right: 16,
    };
    const margin = style?.margin;
    const hasShadow = style?.shadow ?? false;
    const width = StyleParser.resolveWidth(style);
    const height = StyleParser.resolveHeight(style);
    const backgroundImage = style?.backgroundImage;
    const backgroundFit = style?.backgroundFit;

    const onTap = ActionHandler.buildCallback(
      engine,
      getClickAction(node),
      node.analytics
    );

    let cardContent: React.ReactElement;

    if (node.children.length > 0) {
      // Custom card layout with children
      const alignStr = getString(node, 'alignment') ?? 'start';
      let alignItems: 'flex-start' | 'center' | 'flex-end' = 'flex-start';
      let justifyContent: 'flex-start' | 'center' | 'flex-end' = 'flex-start';
      if (alignStr === 'center') {
        alignItems = 'center';
        justifyContent = 'center';
      } else if (alignStr === 'end') {
        alignItems = 'flex-end';
      }

      cardContent = (
        <View style={{ alignItems, justifyContent, flex: height != null ? 1 : undefined }}>
          {node.children.map((child, index) => (
            <React.Fragment key={`card_child_${index}`}>
              {engine.buildWidget(child, isDark)}
            </React.Fragment>
          ))}
        </View>
      );
    } else {
      // Default card layout from properties
      cardContent = buildDefaultContent(node, isDark);
    }

    const cardStyle: any = {
      ...(width != null && { width: width as number }),
      ...(height != null && { height: height as number }),
      ...StyleParser.edgeInsetsToPadding(padding),
      ...(margin ? StyleParser.edgeInsetsToMargin(margin) : {}),
      backgroundColor: bgColor,
      borderRadius: radius,
      borderWidth: 1,
      borderColor,
      overflow: 'hidden' as const,
      ...(hasShadow
        ? {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 4,
          }
        : {}),
    };

    // Determine resize mode from backgroundFit
    const resizeMode: 'cover' | 'contain' | 'stretch' | 'center' =
      backgroundFit === 'contain' ? 'contain'
      : backgroundFit === 'fill' ? 'stretch'
      : 'cover';

    const renderCard = (content: React.ReactElement) => {
      if (backgroundImage) {
        return (
          <View style={cardStyle}>
            <ImageBackground
              source={{ uri: backgroundImage }}
              resizeMode={resizeMode}
              style={{ flex: 1, ...StyleParser.edgeInsetsToPadding(padding) }}
              imageStyle={{ borderRadius: radius }}
            >
              {content}
            </ImageBackground>
          </View>
        );
      }
      return <View style={cardStyle}>{content}</View>;
    };

    // When using backgroundImage, remove padding from outer container (applied on ImageBackground)
    if (backgroundImage) {
      delete cardStyle.paddingTop;
      delete cardStyle.paddingBottom;
      delete cardStyle.paddingLeft;
      delete cardStyle.paddingRight;
    }

    if (onTap) {
      if (backgroundImage) {
        return (
          <TouchableOpacity onPress={onTap} activeOpacity={0.8} style={cardStyle}>
            <ImageBackground
              source={{ uri: backgroundImage }}
              resizeMode={resizeMode}
              style={{ flex: 1, ...StyleParser.edgeInsetsToPadding(padding) }}
              imageStyle={{ borderRadius: radius }}
            >
              {cardContent}
            </ImageBackground>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          onPress={onTap}
          activeOpacity={0.8}
          style={cardStyle}
        >
          {cardContent}
        </TouchableOpacity>
      );
    }

    return renderCard(cardContent);
  }
}

function buildDefaultContent(
  node: WidgetNode,
  isDark: boolean
): React.ReactElement {
  const title = getString(node, 'title');
  const subtitle = getString(node, 'subtitle');
  const body = getString(node, 'body');
  const imageUrl = getString(node, 'image_url');
  const emoji = getString(node, 'emoji');

  return (
    <View style={styles.defaultRow}>
      {/* Left: emoji or image */}
      {emoji ? (
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      ) : imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : null}

      {(emoji || imageUrl) && <View style={{ width: 14 }} />}

      {/* Right: text content */}
      <View style={{ flex: 1 }}>
        {title && (
          <Text
            style={[
              styles.cardTitle,
              { color: isDark ? '#FFFFFF' : '#1A1A1A' },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            style={[
              styles.cardSubtitle,
              { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.54)' },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
        {body && (
          <Text
            style={[
              styles.cardBody,
              { color: isDark ? '#FFFFFF' : '#1A1A1A' },
            ]}
            numberOfLines={3}
          >
            {body}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 59, 204, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  cardImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans',
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter',
    marginTop: 4,
  },
  cardBody: {
    fontSize: 13,
    fontFamily: 'Inter',
    lineHeight: 19.5,
    marginTop: 6,
  },
});
