// src/screens/DynamicScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  ImageBackground,
} from 'react-native';
import {
  JsonWidgetEngine,
  JsonWidgetEngineContext,
} from '../engine/JsonWidgetEngine';
import { DynamicScreenConfig } from '../models/DynamicScreenConfig';
import { JsonLoaderService } from '../services/JsonLoaderService';
import { StyleParser } from '../engine/StyleParser';
import { DynamicIcon } from '../widgets/content/DynamicIcon';
import { ActionHandler } from '../engine/ActionHandler';

/**
 * Universal screen that renders its entire UI from a JSON file.
 *
 * Usage:
 * ```tsx
 * <DynamicScreen
 *   jsonFile="home.json"
 *   engine={engine}
 * />
 * ```
 */
interface DynamicScreenProps {
  /** JSON file name or full URL to load */
  jsonFile?: string;
  /** Optional screen title */
  title?: string;
  /** Engine instance (creates default if not provided) */
  engine?: JsonWidgetEngine;
  /** Custom loading component */
  loadingComponent?: React.ReactElement;
  /** Custom error component builder */
  errorBuilder?: (
    error: string,
    onRetry: () => void
  ) => React.ReactElement;
  /** Callback when back button is pressed */
  onBack?: () => void;
  /** Route params (when used with navigation) */
  route?: { params?: { json_file?: string; title?: string } };
}

export const DynamicScreen: React.FC<DynamicScreenProps> = ({
  jsonFile: jsonFileProp,
  title: titleProp,
  engine: engineProp,
  loadingComponent,
  errorBuilder,
  onBack,
  route,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const loader = JsonLoaderService.getInstance();
  const engine = engineProp ?? new JsonWidgetEngine();

  const [config, setConfig] = useState<DynamicScreenConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve jsonFile from props or route params
  const jsonFile =
    jsonFileProp ?? route?.params?.json_file;
  const [screenTitle, setScreenTitle] = useState<string | undefined>(
    titleProp ?? route?.params?.title
  );

  const loadJson = useCallback(async () => {
    if (!jsonFile) {
      setError('No JSON file specified');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedConfig = await loader.loadConfig(jsonFile);
      setConfig(loadedConfig);
      setIsLoading(false);

      if (!loadedConfig) {
        setError('Failed to load content');
      } else {
        if (!screenTitle) setScreenTitle(loadedConfig.title);
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

  const refresh = useCallback(async () => {
    if (!jsonFile) return;
    loader.clearCache(jsonFile);
    await loadJson();
  }, [jsonFile, loadJson]);

  // Resolve background color
  let bgColor = isDark ? '#0F0F0F' : '#FFFFFF';
  if (config?.background) {
    const parsedBg = StyleParser.parseColor(config.background);
    if (parsedBg) bgColor = parsedBg;
  }

  // Header colors
  const headerBg =
    StyleParser.parseColor(config?.headerBgColor) ?? bgColor;
  const headerTextColor =
    StyleParser.parseColor(config?.headerTitleColor) ??
    (isDark ? '#FFFFFF' : '#1A1A1A');

  // Render body
  const renderBody = () => {
    if (isLoading) {
      return loadingComponent ?? <LoadingShimmer isDark={isDark} />;
    }

    if (error || !config) {
      if (errorBuilder) {
        return errorBuilder(error ?? 'Unknown error', loadJson);
      }
      return (
        <ErrorState
          error={error ?? 'Unknown error'}
          onRetry={loadJson}
          isDark={isDark}
        />
      );
    }

    const usePullToRefresh = config.pullToRefresh !== false;

    if (usePullToRefresh) {
      return (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {engine.buildScreen(config, isDark)}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {engine.buildScreen(config, isDark)}
      </ScrollView>
    );
  };

  const showHeader = config == null || config.showHeader;
  const useSafeArea = config?.safeArea !== false;

  // Resolve status bar style from config
  let barStyle: 'light-content' | 'dark-content' = isDark ? 'light-content' : 'dark-content';
  if (config?.statusBarStyle === 'light') {
    barStyle = 'light-content';
  } else if (config?.statusBarStyle === 'dark') {
    barStyle = 'dark-content';
  }

  // Background image support
  const bgImageUrl = config?.backgroundImage;
  let resizeMode: 'cover' | 'contain' | 'stretch' | 'center' = 'cover';
  if (config?.backgroundFit === 'contain') resizeMode = 'contain';
  else if (config?.backgroundFit === 'fill') resizeMode = 'stretch';
  else if (config?.backgroundFit === 'none') resizeMode = 'center';

  // FAB support
  const fabConfig = config?.fab;
  const showFab = fabConfig?.icon;

  const innerContent = (
    <>
      {/* AppBar */}
      {showHeader && (
        <View
          style={[styles.appBar, { backgroundColor: headerBg }]}
        >
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
          >
            {config?.headerBackIcon ? (
              DynamicIcon.renderIcon(
                config.headerBackIcon,
                20,
                headerTextColor
              )
            ) : (
              <Text style={[styles.backIcon, { color: headerTextColor }]}>
                ‹
              </Text>
            )}
          </TouchableOpacity>

          {screenTitle && (
            <Text
              style={[
                styles.appBarTitle,
                {
                  color: headerTextColor,
                  textAlign:
                    config?.headerTitleAlignment === 'center' ||
                    !config?.headerTitleAlignment
                      ? 'center'
                      : 'left',
                },
              ]}
              numberOfLines={1}
            >
              {screenTitle}
            </Text>
          )}

          {/* Spacer to center title */}
          <View style={styles.backButton} />
        </View>
      )}

      {/* Body */}
      {renderBody()}

      {/* FAB */}
      {showFab && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor:
                StyleParser.parseColor(fabConfig?.background) ?? '#6366F1',
            },
          ]}
          onPress={() => {
            if (fabConfig?.on_click) {
              const cb = ActionHandler.buildCallback(engine, fabConfig.on_click);
              cb?.();
            }
          }}
          activeOpacity={0.8}
        >
          {DynamicIcon.renderIcon(fabConfig.icon, 24, '#FFFFFF')}
        </TouchableOpacity>
      )}
    </>
  );

  const screenContent = bgImageUrl ? (
    <ImageBackground
      source={{ uri: bgImageUrl }}
      style={[styles.container, { backgroundColor: bgColor }]}
      resizeMode={resizeMode}
    >
      <StatusBar barStyle={barStyle} />
      {useSafeArea ? (
        <SafeAreaView style={{ flex: 1 }}>{innerContent}</SafeAreaView>
      ) : (
        <View style={{ flex: 1 }}>{innerContent}</View>
      )}
    </ImageBackground>
  ) : (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={barStyle} />
      {useSafeArea ? (
        <SafeAreaView style={{ flex: 1 }}>{innerContent}</SafeAreaView>
      ) : (
        <View style={{ flex: 1 }}>{innerContent}</View>
      )}
    </View>
  );

  return screenContent;
};

// ─── Loading Shimmer ──────────────────────────────────────

const LoadingShimmer: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const baseColor = isDark ? '#1A2040' : '#E4EAF8';

  return (
    <View style={styles.shimmerContainer}>
      {/* Title shimmer */}
      <View
        style={[styles.shimmerBlock, { width: 200, height: 24, backgroundColor: baseColor }]}
      />
      <View style={{ height: 16 }} />

      {/* Card shimmers */}
      {[0, 1, 2].map((i) => (
        <React.Fragment key={`shimmer_${i}`}>
          <View
            style={[
              styles.shimmerBlock,
              { width: '100%', height: 100, backgroundColor: baseColor },
            ]}
          />
          <View style={{ height: 12 }} />
        </React.Fragment>
      ))}

      {/* Grid shimmer */}
      <View style={{ height: 8 }} />
      <View style={{ flexDirection: 'row' }}>
        <View
          style={[
            styles.shimmerBlock,
            { flex: 1, height: 120, backgroundColor: baseColor },
          ]}
        />
        <View style={{ width: 12 }} />
        <View
          style={[
            styles.shimmerBlock,
            { flex: 1, height: 120, backgroundColor: baseColor },
          ]}
        />
      </View>
    </View>
  );
};

// ─── Error State ──────────────────────────────────────────

const ErrorState: React.FC<{
  error: string;
  onRetry: () => void;
  isDark: boolean;
}> = ({ error, onRetry, isDark }) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>☁️</Text>
      <Text
        style={[
          styles.errorText,
          { color: isDark ? '#A0A0A0' : '#6B7280' },
        ]}
      >
        {error}
      </Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    minHeight: 48,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '300',
  },
  appBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans',
  },
  shimmerContainer: {
    padding: 20,
  },
  shimmerBlock: {
    borderRadius: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1A3BCC',
    borderRadius: 12,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});
