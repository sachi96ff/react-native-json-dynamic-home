// src/engine/ActionHandler.ts

import { Linking } from 'react-native';
import {
  WidgetNode,
  ClickAction,
  AnalyticsConfig,
  getClickAction,
} from '../models/WidgetNode';
import type { JsonWidgetEngine } from './JsonWidgetEngine';

/**
 * Handles on_click actions from dynamic widgets.
 *
 * Supported actions:
 * - `navigate` → Opens DynamicScreen with a JSON file
 * - `navigate_named` → Pushes a named route (via navigation ref)
 * - `open_url` → Opens a URL in external browser
 */
export class ActionHandler {
  /**
   * Build a callback function for a click action.
   * Returns undefined if no action or analytics configured.
   */
  static buildCallback(
    engine: JsonWidgetEngine | undefined,
    action?: ClickAction,
    analytics?: AnalyticsConfig
  ): (() => void) | undefined {
    if (!action && !analytics) return undefined;

    return () => {
      // 1. Log analytics if present
      if (engine && analytics) {
        engine.analyticsDelegate?.logEvent(
          analytics.eventName,
          analytics.params
        );
      }

      if (!action) return;

      // 2. Let the native app handle the action first via the registry
      if (engine) {
        const handled = engine.actionRegistry.execute(
          action.action,
          action.params
        );
        if (handled) return; // Stop if the host app handled it
      }

      // 3. Default built-in actions
      switch (action.action) {
        case 'navigate':
          ActionHandler.handleNavigate(action, engine);
          break;
        case 'navigate_named':
          ActionHandler.handleNavigateNamed(action, engine);
          break;
        case 'open_url':
          ActionHandler.handleOpenUrl(action);
          break;
        default:
          console.warn(
            `⚠️ DynamicUI: Unknown or unhandled action "${action.action}"`
          );
          break;
      }
    };
  }

  /** Navigate to DynamicScreen with a JSON file. */
  private static handleNavigate(
    action: ClickAction,
    engine?: JsonWidgetEngine
  ): void {
    const jsonFile = action.jsonFile;
    if (!jsonFile) {
      console.warn('⚠️ DynamicUI: navigate action missing json_file');
      return;
    }

    // Use the navigation ref if available
    if (engine?.navigationRef) {
      engine.navigationRef.navigate('DynamicScreen', {
        jsonFile,
        title: action.params?.title,
      });
    } else {
      console.warn(
        '⚠️ DynamicUI: No navigation ref set. Call engine.setNavigationRef() to enable navigate action.'
      );
    }
  }

  /** Navigate to an existing named route. */
  private static handleNavigateNamed(
    action: ClickAction,
    engine?: JsonWidgetEngine
  ): void {
    const route = action.route;
    if (!route) {
      console.warn('⚠️ DynamicUI: navigate_named action missing route');
      return;
    }

    if (engine?.navigationRef) {
      engine.navigationRef.navigate(route, action.params);
    } else {
      console.warn(
        '⚠️ DynamicUI: No navigation ref set for named navigation.'
      );
    }
  }

  /** Open a URL in external browser. */
  private static async handleOpenUrl(action: ClickAction): Promise<void> {
    const urlString = action.url;
    if (!urlString) {
      console.warn('⚠️ DynamicUI: open_url action missing url');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(urlString);
      if (canOpen) {
        await Linking.openURL(urlString);
      } else {
        console.warn(`⚠️ DynamicUI: Cannot open URL: ${urlString}`);
      }
    } catch (e) {
      console.error(`❌ DynamicUI: Error launching URL: ${e}`);
    }
  }
}
