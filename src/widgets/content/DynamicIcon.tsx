// src/widgets/content/DynamicIcon.tsx

import React from 'react';
import { View } from 'react-native';
import { WidgetNode, getString, getDouble } from '../../models/WidgetNode';
import { StyleParser } from '../../engine/StyleParser';

/**
 * Icon name to component mapping.
 * Uses lucide-react-native if available, falls back to text emoji.
 */

// We try to dynamically require lucide-react-native
let lucideIcons: Record<string, any> = {};
try {
  lucideIcons = require('lucide-react-native');
} catch {
  // lucide-react-native not installed — fallback to emoji
}

/**
 * Renders an icon widget.
 *
 * JSON example:
 * ```json
 * {
 *   "type": "Icon",
 *   "properties": { "icon": "star", "size": 24 },
 *   "style": { "textColor": "#F59E0B" }
 * }
 * ```
 */
export class DynamicIcon {
  static build(node: WidgetNode, isDark: boolean): React.ReactElement {
    const iconName = getString(node, 'icon', 'circle') ?? 'circle';
    const size = getDouble(node, 'size', 24) ?? 24;
    const color =
      StyleParser.parseColor(node.style?.textColor) ??
      (isDark ? '#FFFFFF' : '#1A1A1A');

    return DynamicIcon.renderIcon(iconName, size, color);
  }

  /** Resolve and render an icon by name. */
  static renderIcon(
    name: string,
    size: number = 24,
    color: string = '#1A1A1A'
  ): React.ReactElement {
    // Map common icon names to Lucide component names (PascalCase)
    const lucideNameMap: Record<string, string> = {
      home: 'Home',
      search: 'Search',
      bell: 'Bell',
      star: 'Star',
      heart: 'Heart',
      bookmark: 'Bookmark',
      play: 'Play',
      pause: 'Pause',
      check: 'Check',
      check_circle: 'CheckCircle',
      x: 'X',
      plus: 'Plus',
      minus: 'Minus',
      arrow_right: 'ArrowRight',
      arrow_left: 'ArrowLeft',
      arrow_back: 'ArrowLeft',
      chevron_right: 'ChevronRight',
      chevron_left: 'ChevronLeft',
      chevron_down: 'ChevronDown',
      chevron_up: 'ChevronUp',
      clock: 'Clock',
      calendar: 'Calendar',
      user: 'User',
      users: 'Users',
      settings: 'Settings',
      share: 'Share2',
      download: 'Download',
      upload: 'Upload',
      edit: 'Edit',
      trash: 'Trash',
      copy: 'Copy',
      lock: 'Lock',
      unlock: 'Unlock',
      eye: 'Eye',
      eye_off: 'EyeOff',
      info: 'Info',
      alert: 'AlertTriangle',
      warning: 'AlertTriangle',
      target: 'Target',
      trophy: 'Trophy',
      medal: 'Medal',
      crown: 'Crown',
      flame: 'Flame',
      zap: 'Zap',
      lightning: 'Zap',
      book: 'BookOpen',
      book_open: 'BookOpen',
      trending_up: 'TrendingUp',
      trending_down: 'TrendingDown',
      bar_chart: 'BarChart2',
      pie_chart: 'PieChart',
      refresh: 'RefreshCw',
      filter: 'Filter',
      tag: 'Tag',
      link: 'Link',
      external_link: 'ExternalLink',
      globe: 'Globe',
      map: 'Map',
      image: 'Image',
      camera: 'Camera',
      file: 'File',
      folder: 'Folder',
      inbox: 'Inbox',
      send: 'Send',
      message: 'MessageSquare',
      phone: 'Phone',
      mail: 'Mail',
      wifi: 'Wifi',
      volume: 'Volume2',
      music: 'Music',
      video: 'Video',
      mic: 'Mic',
      award: 'Award',
      gift: 'Gift',
      code: 'Code',
      terminal: 'Terminal',
      cpu: 'Cpu',
      database: 'Database',
      server: 'Server',
      cloud: 'Cloud',
      sun: 'Sun',
      moon: 'Moon',
      circle: 'Circle',
      square: 'Square',
      triangle: 'Triangle',
      hexagon: 'Hexagon',
      layout_grid: 'LayoutGrid',
      list: 'List',
      grid: 'Grid3x3',
      menu: 'Menu',
      more_horizontal: 'MoreHorizontal',
      more_vertical: 'MoreVertical',
    };

    const componentName = lucideNameMap[name.toLowerCase()] ?? 'Circle';

    // Try to use lucide icon
    if (lucideIcons[componentName]) {
      const IconComponent = lucideIcons[componentName];
      return <IconComponent size={size} color={color} />;
    }

    // Fallback: render emoji-based icon
    const emojiMap: Record<string, string> = {
      star: '⭐',
      heart: '❤️',
      check: '✓',
      x: '✕',
      plus: '+',
      minus: '-',
      home: '🏠',
      search: '🔍',
      bell: '🔔',
      user: '👤',
      settings: '⚙️',
      lock: '🔒',
      play: '▶',
      pause: '⏸',
      arrow_right: '→',
      arrow_left: '←',
      chevron_right: '›',
      chevron_left: '‹',
    };

    const emoji = emojiMap[name.toLowerCase()] ?? '●';

    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {React.createElement(
              require('react-native').Text,
              { style: { fontSize: size * 0.7, color, textAlign: 'center' as const } },
              emoji
            )}
          </View>
        </View>
      </View>
    );
  }

  /** Resolve an icon name to a Lucide component (for use in other widgets). */
  static resolveIconName(name: string): string {
    const lucideNameMap: Record<string, string> = {
      arrow_back: 'ArrowLeft',
      arrow_left: 'ArrowLeft',
      arrow_right: 'ArrowRight',
      chevron_right: 'ChevronRight',
      chevron_left: 'ChevronLeft',
      close: 'X',
      x: 'X',
    };
    return lucideNameMap[name.toLowerCase()] ?? 'Circle';
  }
}
