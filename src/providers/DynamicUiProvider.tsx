// src/providers/DynamicUiProvider.tsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  DynamicScreenConfig,
} from '../models/DynamicScreenConfig';
import { JsonLoaderService } from '../services/JsonLoaderService';

/** State for a dynamic UI loading operation. */
export enum DynamicUiStatus {
  Initial = 'initial',
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
}

interface DynamicUiContextValue {
  status: DynamicUiStatus;
  config: DynamicScreenConfig | null;
  errorMessage: string | null;
  currentJsonFile: string | null;
  isLoading: boolean;
  hasData: boolean;
  loadConfig: (jsonFile: string, forceRefresh?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const DynamicUiContext = createContext<DynamicUiContextValue | undefined>(
  undefined
);

/**
 * Provider for managing dynamic UI state.
 *
 * Loads, caches, and provides DynamicScreenConfig to children.
 *
 * Usage:
 * ```tsx
 * <DynamicUiProvider>
 *   <YourScreen />
 * </DynamicUiProvider>
 * ```
 */
export const DynamicUiProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const loader = JsonLoaderService.getInstance();

  const [status, setStatus] = useState<DynamicUiStatus>(
    DynamicUiStatus.Initial
  );
  const [config, setConfig] = useState<DynamicScreenConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentJsonFile, setCurrentJsonFile] = useState<string | null>(
    null
  );

  const loadConfig = useCallback(
    async (jsonFile: string, forceRefresh: boolean = false) => {
      // Don't reload if already loaded the same file (unless forced)
      if (
        !forceRefresh &&
        currentJsonFile === jsonFile &&
        status === DynamicUiStatus.Loaded &&
        config != null
      ) {
        return;
      }

      setStatus(DynamicUiStatus.Loading);
      setCurrentJsonFile(jsonFile);
      setErrorMessage(null);

      try {
        const loadedConfig = await loader.loadConfig(jsonFile, forceRefresh);

        if (loadedConfig) {
          setConfig(loadedConfig);
          setStatus(DynamicUiStatus.Loaded);
        } else {
          setErrorMessage('Failed to load dynamic content');
          setStatus(DynamicUiStatus.Error);
        }
      } catch (e) {
        console.error(
          `❌ DynamicUiProvider: Error loading "${jsonFile}": ${e}`
        );
        setErrorMessage('Something went wrong');
        setStatus(DynamicUiStatus.Error);
      }
    },
    [currentJsonFile, status, config]
  );

  const refresh = useCallback(async () => {
    if (currentJsonFile) {
      await loadConfig(currentJsonFile, true);
    }
  }, [currentJsonFile, loadConfig]);

  const clearAll = useCallback(async () => {
    setConfig(null);
    setStatus(DynamicUiStatus.Initial);
    setCurrentJsonFile(null);
    setErrorMessage(null);
    await loader.clearAllCaches();
  }, []);

  return (
    <DynamicUiContext.Provider
      value={{
        status,
        config,
        errorMessage,
        currentJsonFile,
        isLoading: status === DynamicUiStatus.Loading,
        hasData: config != null,
        loadConfig,
        refresh,
        clearAll,
      }}
    >
      {children}
    </DynamicUiContext.Provider>
  );
};

/**
 * Hook to access dynamic UI state from context.
 *
 * Usage:
 * ```tsx
 * const { config, loadConfig, isLoading } = useDynamicUi();
 * ```
 */
export function useDynamicUi(): DynamicUiContextValue {
  const context = useContext(DynamicUiContext);
  if (!context) {
    throw new Error('useDynamicUi must be used within a DynamicUiProvider');
  }
  return context;
}
