// src/models/DynamicScreenConfig.ts

import { WidgetNode, parseWidgetNode } from './WidgetNode';
import { EdgeInsets, parseEdgeInsets } from './WidgetStyle';

/**
 * Top-level JSON configuration for a dynamic screen or area.
 *
 * Example JSON:
 * ```json
 * {
 *   "screen_id": "home_dynamic_area",
 *   "version": "1.0.0",
 *   "title": "Home",
 *   "scrollable": true,
 *   "height": "auto",
 *   "background": "#F5F5F5",
 *   "widgets": [ ... ]
 * }
 * ```
 */
export interface DynamicScreenConfig {
  screenId: string;
  version: string;
  title?: string;
  showHeader: boolean;
  headerTitleColor?: string;
  headerTitleAlignment?: string;
  headerBackIcon?: string;
  headerBgColor?: string;
  scrollable: boolean;
  height: string | number;
  background?: string;
  backgroundImage?: string;
  gradientColors?: string[];
  padding?: EdgeInsets;
  margin?: EdgeInsets;
  widgets: WidgetNode[];
  rawJson?: Record<string, any>;
}

export function parseDynamicScreenConfig(
  json: Record<string, any>
): DynamicScreenConfig {
  const widgetsList: WidgetNode[] = [];
  if (Array.isArray(json.widgets)) {
    for (const w of json.widgets) {
      if (typeof w === 'object' && w !== null) {
        widgetsList.push(parseWidgetNode(w));
      }
    }
  }

  return {
    screenId: (json.screen_id as string) ?? 'unknown',
    version: (json.version as string) ?? '1.0.0',
    title: json.title as string | undefined,
    showHeader: (json.show_header as boolean) ?? true,
    headerTitleColor: json.header_title_color as string | undefined,
    headerTitleAlignment: json.header_title_alignment as string | undefined,
    headerBackIcon: json.header_back_icon as string | undefined,
    headerBgColor: json.header_bg_color as string | undefined,
    scrollable: (json.scrollable as boolean) ?? true,
    height: json.height ?? 'auto',
    background: json.background as string | undefined,
    backgroundImage: (json.background_image ?? json.backgroundImage) as
      | string
      | undefined,
    gradientColors: Array.isArray(json.gradient_colors)
      ? json.gradient_colors.map((e: any) => String(e))
      : undefined,
    padding: parseEdgeInsets(json.padding),
    margin: parseEdgeInsets(json.margin),
    widgets: widgetsList,
    rawJson: json,
  };
}

export function dynamicScreenConfigToJson(
  config: DynamicScreenConfig
): Record<string, any> {
  if (config.rawJson) return config.rawJson;
  return {
    screen_id: config.screenId,
    version: config.version,
    title: config.title,
    show_header: config.showHeader,
    ...(config.headerTitleColor && {
      header_title_color: config.headerTitleColor,
    }),
    ...(config.headerTitleAlignment && {
      header_title_alignment: config.headerTitleAlignment,
    }),
    ...(config.headerBackIcon && { header_back_icon: config.headerBackIcon }),
    ...(config.headerBgColor && { header_bg_color: config.headerBgColor }),
    scrollable: config.scrollable,
    height: config.height,
    background: config.background,
    background_image: config.backgroundImage,
    ...(config.gradientColors && { gradient_colors: config.gradientColors }),
    widgets: [],
  };
}
