// src/engine/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorBoundaryProps {
  widgetType: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Wraps dynamic widget rendering in a safe error boundary.
 *
 * If the child widget throws during render, this shows a compact
 * error card instead of crashing the app. In __DEV__ mode it shows
 * the error details; in production it shows a generic message.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `❌ DynamicUI: Error building "${this.props.widgetType}": ${error.message}`
    );
    console.error('Stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorCard
          widgetType={this.props.widgetType}
          error={this.state.error?.message ?? 'Unknown error'}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Build a widget safely — wraps the builder call with try/catch
 * and returns an error card if it fails.
 */
export function buildSafe(
  widgetType: string,
  builder: () => React.ReactElement
): React.ReactElement {
  try {
    return builder();
  } catch (e: any) {
    console.error(`❌ DynamicUI: Error building "${widgetType}": ${e}`);
    return (
      <ErrorCard widgetType={widgetType} error={e?.message ?? String(e)} />
    );
  }
}

// ─── Error Card Component ──────────────────────────────────

interface ErrorCardProps {
  widgetType: string;
  error: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ widgetType, error }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Widget "{widgetType}" failed</Text>
        {__DEV__ && (
          <Text style={styles.errorText} numberOfLines={2}>
            {error}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  errorText: {
    fontSize: 10,
    color: '#991B1B',
    marginTop: 2,
  },
});
