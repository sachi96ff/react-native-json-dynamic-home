// src/engine/JsonAnalyticsDelegate.ts

/**
 * A delegate to handle analytics events from the JSON UI.
 *
 * Implement this interface in your app to capture analytics events.
 *
 * Example:
 * ```ts
 * const myAnalytics: JsonAnalyticsDelegate = {
 *   logEvent: (eventName, parameters) => {
 *     firebase.analytics().logEvent(eventName, parameters);
 *   },
 *   logScreenView: (screenName) => {
 *     firebase.analytics().logScreenView({ screen_name: screenName });
 *   },
 * };
 * ```
 */
export interface JsonAnalyticsDelegate {
  /** Called when an interactive widget with an "analytics" block is clicked. */
  logEvent(eventName: string, parameters: Record<string, any>): void;

  /** Called when a JSON screen or widget area is successfully loaded. */
  logScreenView(screenName: string): void;
}
