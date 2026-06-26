// src/widgets/content/DynamicImage.tsx

import React from 'react';
import {
  Image,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { WidgetNode, getString } from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';

/**
 * Renders an image from network URL.
 *
 * JSON example:
 * ```json
 * {
 *   "type": "Image",
 *   "properties": {
 *     "url": "https://example.com/image.png",
 *     "fit": "cover"
 *   },
 *   "style": { "width": "100%", "height": 200, "radius": 16 }
 * }
 * ```
 */
export class DynamicImage {
  static build(node: WidgetNode, isDark: boolean): React.ReactElement {
    const url = getString(node, 'url') ?? getString(node, 'image_url');
    const fit = StyleParser.parseResizeMode(
      getString(node, 'fit', 'cover')
    );
    const width = StyleParser.resolveWidth(node.style);
    const height = StyleParser.resolveHeight(node.style);
    const radius = node.style?.radius ?? 0;

    if (!url) {
      return (
        <View
          style={{
            width: (width as number) ?? undefined,
            height: (height as number) ?? 100,
          }}
        />
      );
    }

    const placeholderBg = isDark ? '#1A2040' : '#E4EAF8';

    return (
      <View
        style={{
          width: width as number | undefined,
          height: (height as number) ?? undefined,
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: placeholderBg,
        }}
      >
        <Image
          source={{ uri: url }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: radius,
          }}
          resizeMode={fit}
          defaultSource={undefined}
        />
      </View>
    );
  }
}
