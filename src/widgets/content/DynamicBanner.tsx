// src/widgets/content/DynamicBanner.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  StyleSheet,
  ViewToken,
} from 'react-native';
import {
  WidgetNode,
  ClickAction,
  AnalyticsConfig,
  getBool,
  getInt,
} from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';
import { ActionHandler } from '../../engine/ActionHandler';

/**
 * Renders a hero banner or image carousel.
 *
 * JSON example:
 * ```json
 * {
 *   "type": "Banner",
 *   "properties": {
 *     "auto_scroll": true,
 *     "interval": 4,
 *     "items": [
 *       {
 *         "image_url": "https://...",
 *         "title": "New Mock Tests Available!",
 *         "subtitle": "Attempt now",
 *         "on_click": { "action": "navigate", "json_file": "mock_tests.json" }
 *       }
 *     ]
 *   },
 *   "style": { "height": 180, "radius": 16 }
 * }
 * ```
 */
export class DynamicBanner {
  static build(node: WidgetNode, isDark: boolean): React.ReactElement {
    const items = node.properties.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return <View />;
    }

    const height =
      (StyleParser.resolveHeight(node.style) as number) ?? 180;
    const radius = node.style?.radius ?? 16;
    const autoScroll = getBool(node, 'auto_scroll', true);
    const interval = getInt(node, 'interval', 4) ?? 4;

    if (items.length === 1) {
      return (
        <BannerItem
          item={items[0]}
          height={height}
          radius={radius}
          isDark={isDark}
        />
      );
    }

    return (
      <BannerCarousel
        items={items}
        height={height}
        radius={radius}
        autoScroll={autoScroll}
        interval={interval}
        isDark={isDark}
      />
    );
  }
}

// ─── Banner Carousel ──────────────────────────────────────

interface BannerCarouselProps {
  items: Record<string, any>[];
  height: number;
  radius: number;
  autoScroll: boolean;
  interval: number;
  isDark: boolean;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  items,
  height,
  radius,
  autoScroll,
  interval,
  isDark,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    if (!autoScroll || items.length <= 1) return;

    const timer = setInterval(() => {
      const next = (currentPage + 1) % items.length;
      flatListRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [currentPage, autoScroll, interval, items.length]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentPage(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(_, index) => `banner_${index}`}
        renderItem={({ item }) => (
          <View style={{ width: screenWidth - 4, paddingHorizontal: 2 }}>
            <BannerItem
              item={item}
              height={height}
              radius={radius}
              isDark={isDark}
            />
          </View>
        )}
      />
      {items.length > 1 && (
        <View style={styles.dotsContainer}>
          {items.map((_, i) => {
            const isActive = i === currentPage;
            return (
              <View
                key={`dot_${i}`}
                style={[
                  styles.dot,
                  {
                    width: isActive ? 20 : 8,
                    backgroundColor: isActive
                      ? '#1A3BCC'
                      : 'rgba(26, 59, 204, 0.2)',
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

// ─── Banner Item ──────────────────────────────────────────

interface BannerItemProps {
  item: Record<string, any>;
  height: number;
  radius: number;
  isDark: boolean;
}

const BannerItem: React.FC<BannerItemProps> = ({
  item,
  height,
  radius,
  isDark,
}) => {
  const imageUrl = (item.image_url ?? item.background_image) as
    | string
    | undefined;
  const title = item.title as string | undefined;
  const subtitle = item.subtitle as string | undefined;
  const bgColorStr = item.background as string | undefined;
  const bgColor = StyleParser.parseColor(bgColorStr);
  const showOverlay = item.show_overlay !== false;

  // Build click action
  let onTap: (() => void) | undefined;
  if (item.on_click && typeof item.on_click === 'object') {
    const action: ClickAction = {
      action: item.on_click.action ?? '',
      jsonFile: item.on_click.json_file,
      url: item.on_click.url,
      route: item.on_click.route,
      params: { ...(item.on_click.params ?? {}) },
    };
    const analytics = item.analytics
      ? {
          eventName: item.analytics.event_name ?? 'unknown_event',
          params: { ...(item.analytics.params ?? {}) },
        }
      : undefined;
    onTap = ActionHandler.buildCallback(undefined, action, analytics);
  }

  const isTransparent =
    bgColor === 'transparent' || bgColorStr?.toLowerCase() === 'transparent';

  return (
    <TouchableOpacity
      activeOpacity={onTap ? 0.9 : 1}
      onPress={onTap}
      style={[
        {
          height,
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: bgColor ?? '#1A3BCC',
        },
        !isTransparent && {
          shadowColor: '#1A3BCC',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 6,
        },
      ]}
    >
      {/* Background image */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : null}

      {/* Gradient overlay */}
      {showOverlay && (title || subtitle) && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: 'rgba(0,0,0,0.3)',
            },
          ]}
        />
      )}

      {/* Text content */}
      {(title || subtitle) && (
        <View style={styles.textContainer}>
          {title && (
            <Text style={styles.bannerTitle} numberOfLines={2}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.bannerSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  textContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: 'Inter',
    marginTop: 4,
  },
});
