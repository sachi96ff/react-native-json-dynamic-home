// src/screens/DynamicWidgetArea.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { JsonWidgetEngine } from '../engine/JsonWidgetEngine';
import { DynamicScreenConfig } from '../models/DynamicScreenConfig';
import { JsonLoaderService } from '../services/JsonLoaderService';

/**
 * A component that renders its content from a JSON file.
 * Designed to be embedded inside existing screens (e.g. inside a ScrollView or FlatList).
 *
 * Usage:
 * ```tsx
 * <DynamicWidgetArea jsonFile="promotional_banner.json" />
 * ```
 */
interface DynamicWidgetAreaProps {
  /** The JSON file name or full URL to load */
  jsonFile: string;
  /** Optional custom loading component */
  loadingComponent?: React.ReactElement;
  /** Optional custom error component builder */
  errorBuilder?: (
    error: string,
    onRetry: () => void
  ) => React.ReactElement;
  /** Optional engine instance */
  engine?: JsonWidgetEngine;
}

export const DynamicWidgetArea: React.FC<DynamicWidgetAreaProps> = ({
  jsonFile,
  loadingComponent,
  errorBuilder,
  engine: engineProp,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const loader = JsonLoaderService.getInstance();
  const [engine] = useState(() => engineProp ?? new JsonWidgetEngine());

  const [config, setConfig] = useState<DynamicScreenConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJson = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedConfig = await loader.loadConfig(jsonFile);
      setConfig(loadedConfig);
      setIsLoading(false);

      if (!loadedConfig) {
        setError('Failed to load content');
      } else {
        engine.analyticsDelegate?.logScreenView(jsonFile);
      }
    } catch (e) {
      setError('Something went wrong');
      setIsLoading(false);
    }
  }, [jsonFile]);

  useEffect(() => {
    loadJson();
  }, [loadJson]);

  // Loading state
  if (isLoading) {
    return loadingComponent ?? <ShimmerBlock isDark={isDark} />;
  }

  // Error state
  if (error || !config) {
    if (errorBuilder) {
      return errorBuilder(error ?? 'Unknown error', loadJson);
    }
    return <ErrorBlock error={error ?? 'Error'} onRetry={loadJson} isDark={isDark} />;
  }

  // Since this is embedded, use buildArea to avoid scroll conflicts
  return engine.buildArea(config, isDark);
};

// ─── Shimmer ──────────────────────────────────────────────

const ShimmerBlock: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const baseColor = isDark ? '#1A2040' : '#E4EAF8';

  return (
    <View style={styles.shimmerContainer}>
      <View
        style={[
          styles.shimmerBlock,
          { backgroundColor: baseColor },
        ]}
      />
    </View>
  );
};

// ─── Error ────────────────────────────────────────────────

const ErrorBlock: React.FC<{
  error: string;
  onRetry: () => void;
  isDark: boolean;
}> = ({ error, onRetry, isDark }) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={{ fontSize: 24 }}>⚠️</Text>
      <Text
        style={[
          styles.errorText,
          { color: isDark ? '#FF6B6B' : '#DC2626' },
        ]}
      >
        {error}
      </Text>
      <TouchableOpacity onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  shimmerContainer: {
    padding: 16,
  },
  shimmerBlock: {
    width: '100%',
    height: 100,
    borderRadius: 16,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#1A3BCC',
    fontWeight: '600',
    marginTop: 8,
  },
});
