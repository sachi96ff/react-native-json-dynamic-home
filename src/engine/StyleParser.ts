// src/engine/StyleParser.ts

import { Dimensions, FlexAlignType, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { WidgetStyle, EdgeInsets } from '../models/WidgetStyle';

/**
 * Converts WidgetStyle objects into React Native styling primitives.
 * Equivalent of Flutter's StyleParser.
 */
export class StyleParser {
  // ─── Color Parsing ────────────────────────────────────────────

  /**
   * Parse a hex color string like "#FF6B2B", "FF6B2B", 3-char hex like "#FFF",
   * or named colors like "white", "black", "transparent", etc.
   */
  static parseColor(hex?: string): string | undefined {
    if (!hex || hex.trim().length === 0) return undefined;

    hex = hex.trim().toLowerCase();

    // Handle named colors
    const namedColors: Record<string, string> = {
      white: '#FFFFFF',
      black: '#000000',
      transparent: 'transparent',
      red: '#F44336',
      green: '#4CAF50',
      blue: '#2196F3',
      yellow: '#FFEB3B',
      orange: '#FF9800',
      purple: '#9C27B0',
      grey: '#9E9E9E',
      gray: '#9E9E9E',
    };

    if (namedColors[hex]) return namedColors[hex];

    hex = hex.replace('#', '');

    // Handle 3-character hex (e.g., FFF -> FFFFFF)
    if (hex.length === 3) {
      hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    }

    if (hex.length === 6) {
      return `#${hex}`;
    } else if (hex.length === 8) {
      // RRGGBBAA format → convert to #RRGGBBAA (React Native supports this)
      return `#${hex}`;
    }

    return undefined;
  }

  // ─── ViewStyle (BoxDecoration equivalent) ──────────────────────

  /**
   * Build a ViewStyle from a WidgetStyle (equivalent of BoxDecoration).
   */
  static buildDecoration(
    style?: WidgetStyle,
    isDark: boolean = false
  ): ViewStyle {
    if (!style) return {};

    const result: ViewStyle = {};

    const bgColor = this.parseColor(style.background);
    if (bgColor) result.backgroundColor = bgColor;

    if (style.radius != null) {
      result.borderRadius = style.radius;
    }

    const borderColor = this.parseColor(style.border);
    if (borderColor) {
      result.borderColor = borderColor;
      result.borderWidth = style.borderWidth ?? 1;
    }

    if (style.shadow) {
      // iOS shadow
      result.shadowColor = '#000000';
      result.shadowOffset = { width: 0, height: 4 };
      result.shadowOpacity = 0.08;
      result.shadowRadius = 12;
      // Android shadow
      result.elevation = 4;
    }

    return result;
  }

  // ─── TextStyle ────────────────────────────────────────────────

  /**
   * Build a TextStyle from a WidgetStyle.
   */
  static buildTextStyle(
    style?: WidgetStyle,
    isDark: boolean = false,
    defaultFontSize: number = 14,
    defaultWeight: string = 'normal'
  ): TextStyle {
    const result: TextStyle = {};

    const color = this.parseColor(style?.textColor);
    if (color) {
      result.color = color;
    } else {
      result.color = isDark ? '#FFFFFF' : '#1A1A1A';
    }

    result.fontSize = style?.fontSize ?? defaultFontSize;
    result.fontWeight = this.parseFontWeight(
      style?.fontWeight ?? defaultWeight
    );

    // Use Plus Jakarta Sans for bold/heavy, Inter for everything else
    const weight = this.parseFontWeight(style?.fontWeight ?? defaultWeight);
    if (
      weight === '700' ||
      weight === '800' ||
      weight === '900' ||
      weight === 'bold'
    ) {
      result.fontFamily = 'PlusJakartaSans';
    } else {
      result.fontFamily = 'Inter';
    }

    if (style?.letterSpacing != null) {
      result.letterSpacing = style.letterSpacing;
    }

    if (style?.lineHeight != null && result.fontSize) {
      result.lineHeight = style.lineHeight * result.fontSize;
    }

    return result;
  }

  static parseFontWeight(
    weight: string
  ):
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900' {
    switch (weight.toLowerCase()) {
      case 'thin':
      case '100':
        return '100';
      case 'extralight':
      case '200':
        return '200';
      case 'light':
      case '300':
        return '300';
      case 'normal':
      case 'regular':
      case '400':
        return '400';
      case 'medium':
      case '500':
        return '500';
      case 'semibold':
      case 'semi_bold':
      case '600':
        return '600';
      case 'bold':
      case '700':
        return '700';
      case 'extrabold':
      case 'extra_bold':
      case '800':
        return '800';
      case 'black':
      case '900':
        return '900';
      default:
        return '400';
    }
  }

  // ─── TextAlign ────────────────────────────────────────────────

  static parseTextAlign(
    align?: string
  ): 'auto' | 'left' | 'right' | 'center' | 'justify' {
    switch (align?.toLowerCase()) {
      case 'center':
        return 'center';
      case 'right':
      case 'end':
        return 'right';
      case 'justify':
        return 'justify';
      case 'left':
      case 'start':
      default:
        return 'left';
    }
  }

  // ─── Alignment ────────────────────────────────────────────────

  static parseAlignment(align?: string): {
    justifyContent: ViewStyle['justifyContent'];
    alignItems: ViewStyle['alignItems'];
  } {
    switch (align?.toLowerCase()) {
      case 'topleft':
      case 'top_left':
        return { justifyContent: 'flex-start', alignItems: 'flex-start' };
      case 'topcenter':
      case 'top_center':
      case 'top':
        return { justifyContent: 'flex-start', alignItems: 'center' };
      case 'topright':
      case 'top_right':
        return { justifyContent: 'flex-start', alignItems: 'flex-end' };
      case 'centerleft':
      case 'center_left':
      case 'left':
        return { justifyContent: 'center', alignItems: 'flex-start' };
      case 'centerright':
      case 'center_right':
      case 'right':
        return { justifyContent: 'center', alignItems: 'flex-end' };
      case 'bottomleft':
      case 'bottom_left':
        return { justifyContent: 'flex-end', alignItems: 'flex-start' };
      case 'bottomcenter':
      case 'bottom_center':
      case 'bottom':
        return { justifyContent: 'flex-end', alignItems: 'center' };
      case 'bottomright':
      case 'bottom_right':
        return { justifyContent: 'flex-end', alignItems: 'flex-end' };
      case 'center':
      default:
        return { justifyContent: 'center', alignItems: 'center' };
    }
  }

  // ─── MainAxisAlignment ────────────────────────────────────────

  static parseMainAxisAlignment(
    align?: string
  ): ViewStyle['justifyContent'] {
    switch (align?.toLowerCase()) {
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'spacebetween':
      case 'space_between':
        return 'space-between';
      case 'spacearound':
      case 'space_around':
        return 'space-around';
      case 'spaceevenly':
      case 'space_evenly':
        return 'space-evenly';
      case 'start':
      default:
        return 'flex-start';
    }
  }

  // ─── CrossAxisAlignment ───────────────────────────────────────

  static parseCrossAxisAlignment(
    align?: string
  ): FlexAlignType {
    switch (align?.toLowerCase()) {
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'stretch':
        return 'stretch';
      case 'start':
      default:
        return 'flex-start';
    }
  }

  // ─── Width / Height ───────────────────────────────────────────

  /** Resolve width from style. Returns undefined for "auto" or unset. */
  static resolveWidth(style?: WidgetStyle): number | string | undefined {
    return this.resolveDimension(style?.width, false);
  }

  /** Resolve height from style. Returns undefined for "auto" or unset. */
  static resolveHeight(style?: WidgetStyle): number | string | undefined {
    return this.resolveDimension(style?.height, true);
  }

  private static resolveDimension(
    value: any,
    useHeight: boolean
  ): number | string | undefined {
    if (value == null || value === 'auto') return undefined;

    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
      if (value.endsWith('%')) {
        const percent = parseFloat(value.replace('%', ''));
        if (!isNaN(percent)) {
          const { width, height } = Dimensions.get('window');
          const reference = useHeight ? height : width;
          return reference * (percent / 100);
        }
      }
      if (value === 'infinity') {
        return '100%';
      }
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) return parsed;
    }

    return undefined;
  }

  // ─── ResizeMode (BoxFit equivalent) ───────────────────────────

  static parseResizeMode(
    fit?: string
  ): 'cover' | 'contain' | 'stretch' | 'center' {
    switch (fit?.toLowerCase()) {
      case 'cover':
        return 'cover';
      case 'contain':
        return 'contain';
      case 'fill':
        return 'stretch';
      case 'fitwidth':
      case 'fit_width':
        return 'contain';
      case 'fitheight':
      case 'fit_height':
        return 'contain';
      case 'none':
        return 'center';
      case 'scaledown':
      case 'scale_down':
        return 'contain';
      default:
        return 'cover';
    }
  }

  // ─── EdgeInsets to RN style ────────────────────────────────────

  static edgeInsetsToMargin(
    insets?: EdgeInsets
  ): ViewStyle {
    if (!insets) return {};
    return {
      marginTop: insets.top,
      marginBottom: insets.bottom,
      marginLeft: insets.left,
      marginRight: insets.right,
    };
  }

  static edgeInsetsToPadding(
    insets?: EdgeInsets
  ): ViewStyle {
    if (!insets) return {};
    return {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    };
  }
}
