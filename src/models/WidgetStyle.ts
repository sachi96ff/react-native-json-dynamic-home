// src/models/WidgetStyle.ts

/**
 * Parsed style object from JSON.
 *
 * Supports all style properties: background, radius, padding, margin,
 * border, shadow, width, height, textColor, fontSize, fontWeight, alignment.
 */

export interface EdgeInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface WidgetStyle {
  background?: string;
  radius?: number;
  padding?: EdgeInsets;
  margin?: EdgeInsets;
  border?: string;
  borderWidth?: number;
  shadow: boolean;
  width?: string | number;
  height?: string | number;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  alignment?: string;
  gradient?: string;
  gradientColors?: string[];
  opacity?: number;
  elevation?: number;
  overflow?: string;
  maxLines?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: string;
  backgroundImage?: string;
  backgroundFit?: string;
}

/**
 * Parse EdgeInsets from JSON — supports:
 * - number: uniform padding
 * - object: { top, bottom, left, right }
 * - object: { vertical, horizontal }
 */
export function parseEdgeInsets(value: any): EdgeInsets | undefined {
  if (value == null) return undefined;

  if (typeof value === 'number') {
    return { top: value, bottom: value, left: value, right: value };
  }

  if (typeof value === 'object') {
    // Check for vertical/horizontal shorthand
    if ('vertical' in value || 'horizontal' in value) {
      const v = toDouble(value.vertical) ?? 0;
      const h = toDouble(value.horizontal) ?? 0;
      return { top: v, bottom: v, left: h, right: h };
    }

    return {
      top: toDouble(value.top) ?? 0,
      bottom: toDouble(value.bottom) ?? 0,
      left: toDouble(value.left) ?? 0,
      right: toDouble(value.right) ?? 0,
    };
  }

  return undefined;
}

function toDouble(value: any): number | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

export function parseWidgetStyle(json: Record<string, any>): WidgetStyle {
  return {
    background: json.background as string | undefined,
    radius: toDouble(json.radius),
    padding: parseEdgeInsets(json.padding),
    margin: parseEdgeInsets(json.margin),
    border: json.border as string | undefined,
    borderWidth: toDouble(json.borderWidth ?? json.border_width),
    shadow: json.shadow === true,
    width: json.width,
    height: json.height,
    textColor: (json.textColor ?? json.text_color) as string | undefined,
    fontSize: toDouble(json.fontSize ?? json.font_size),
    fontWeight: (json.fontWeight ?? json.font_weight) as string | undefined,
    alignment: json.alignment as string | undefined,
    gradient: json.gradient as string | undefined,
    gradientColors: Array.isArray(json.gradientColors)
      ? (json.gradientColors as string[])
      : undefined,
    opacity: toDouble(json.opacity),
    elevation: toDouble(json.elevation),
    overflow: json.overflow as string | undefined,
    maxLines: typeof json.maxLines === 'number' ? json.maxLines : undefined,
    letterSpacing: toDouble(json.letterSpacing ?? json.letter_spacing),
    lineHeight: toDouble(json.lineHeight ?? json.line_height),
    textAlign: (json.textAlign ?? json.text_align) as string | undefined,
    backgroundImage: (json.backgroundImage ?? json.background_image) as string | undefined,
    backgroundFit: (json.backgroundFit ?? json.background_fit) as string | undefined,
  };
}
