// src/models/WidgetNode.ts

import { WidgetStyle, parseWidgetStyle } from './WidgetStyle';

/**
 * Represents a single widget node parsed from JSON.
 *
 * Each node has a type (e.g. "Title", "Card", "Column"),
 * optional properties, style, animation, visibility,
 * and children for layout widgets.
 */
export interface WidgetNode {
  type: string;
  properties: Record<string, any>;
  style?: WidgetStyle;
  animation?: string;
  visibility?: VisibilityConfig;
  analytics?: AnalyticsConfig;
  children: WidgetNode[];
}

/** Represents a click action on a widget. */
export interface ClickAction {
  action: string; // "navigate", "open_url", "navigate_named"
  targetScreen?: string;
  jsonFile?: string;
  url?: string;
  route?: string; // for navigate_named
  params: Record<string, any>;
}

/** Controls widget visibility. */
export interface VisibilityConfig {
  visible: boolean;
}

/** Configuration for logging analytics events. */
export interface AnalyticsConfig {
  eventName: string;
  params: Record<string, any>;
}

/**
 * Parse a WidgetNode from raw JSON.
 */
export function parseWidgetNode(json: Record<string, any>): WidgetNode {
  // Parse children from either "children" or "items" key
  let children: WidgetNode[] = [];
  if (Array.isArray(json.children)) {
    children = json.children
      .filter((c: any) => typeof c === 'object' && c !== null)
      .map((c: Record<string, any>) => parseWidgetNode(c));
  }

  // Also parse items inside properties (for List, Grid, HorizontalList, etc.)
  const props: Record<string, any> = { ...(json.properties ?? {}) };
  if (Array.isArray(props.items)) {
    props.items = props.items.map((item: any) => {
      if (typeof item === 'object' && item !== null && 'type' in item) {
        return item; // Keep as raw JSON, parsed later by engine
      }
      return item;
    });
  }

  return {
    type: (json.type as string) ?? 'SizedBox',
    properties: props,
    style: json.style ? parseWidgetStyle(json.style) : undefined,
    animation: json.animation as string | undefined,
    visibility: json.visibility
      ? parseVisibilityConfig(json.visibility)
      : undefined,
    analytics: json.analytics
      ? parseAnalyticsConfig(json.analytics)
      : undefined,
    children,
  };
}

/** Get the click action from a widget node's properties. */
export function getClickAction(node: WidgetNode): ClickAction | undefined {
  const onClick = node.properties.on_click;
  if (typeof onClick === 'object' && onClick !== null) {
    return parseClickAction(onClick);
  }
  return undefined;
}

/** Get a string property with optional default. */
export function getString(
  node: WidgetNode,
  key: string,
  defaultValue?: string
): string | undefined {
  const val = node.properties[key];
  if (typeof val === 'string') return val;
  return defaultValue;
}

/** Get an int property with optional default. */
export function getInt(
  node: WidgetNode,
  key: string,
  defaultValue?: number
): number | undefined {
  const val = node.properties[key];
  if (typeof val === 'number') return Math.floor(val);
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/** Get a double property with optional default. */
export function getDouble(
  node: WidgetNode,
  key: string,
  defaultValue?: number
): number | undefined {
  const val = node.properties[key];
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/** Get a bool property with optional default. */
export function getBool(
  node: WidgetNode,
  key: string,
  defaultValue: boolean = false
): boolean {
  const val = node.properties[key];
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') return val.toLowerCase() === 'true';
  return defaultValue;
}

// ─── Internal Parsers ─────────────────────────────────────

function parseClickAction(json: Record<string, any>): ClickAction {
  return {
    action: (json.action as string) ?? '',
    targetScreen: json.target_screen as string | undefined,
    jsonFile: json.json_file as string | undefined,
    url: json.url as string | undefined,
    route: json.route as string | undefined,
    params: { ...(json.params ?? {}) },
  };
}

function parseVisibilityConfig(json: Record<string, any>): VisibilityConfig {
  return {
    visible: json.visible !== false, // Default to true unless explicitly false
  };
}

function parseAnalyticsConfig(json: Record<string, any>): AnalyticsConfig {
  return {
    eventName: (json.event_name as string) ?? 'unknown_event',
    params: { ...(json.params ?? json.properties ?? {}) },
  };
}
