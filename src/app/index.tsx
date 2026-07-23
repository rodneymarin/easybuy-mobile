import { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View, Text, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme, ThemeProvider } from '@lib/theme';
import { DrawerProvider, useDrawer } from '@lib/drawer';
import { I18nProvider, useI18n } from '@lib/i18n';
import { DataSourceProvider, useDataSource } from '@lib/data-source';
import { AuthProvider, subscribeToAuthError, useAuth } from '@lib/auth';
import { MainMenu, About, AuthSheet, ToastProvider, useToast } from '@components/ui';
import { StatusBar } from 'expo-status-bar';
import { getDatabase } from '@lib/database';
import { TabNavigator } from './navigation';

function AppContent() {
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const { dataSource, setDataSource, refresh } = useDataSource();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { closeDrawer } = useDrawer();
  const toast = useToast();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const hasCheckedInitialSession = useRef(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthError(() => {
      setIsSessionExpired(true);
      setIsAuthSheetOpen(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (hasCheckedInitialSession.current) return;
    if (isAuthLoading) return;
    hasCheckedInitialSession.current = true;
    if (dataSource === 'cloud' && !isAuthenticated) {
      setIsSessionExpired(true);
      setIsAuthSheetOpen(true);
    }
  }, [dataSource, isAuthenticated, isAuthLoading]);

  function handleAuthenticated() {
    const wasExpired = isSessionExpired;
    setIsSessionExpired(false);
    setDataSource('cloud');
    closeDrawer();
    setIsAuthSheetOpen(false);
    if (wasExpired) refresh();
  }

  function handleUseLocalData() {
    setIsSessionExpired(false);
    setIsAuthSheetOpen(false);
    setDataSource('local');
    toast.show({ message: t('toast.switchedToLocal'), type: 'info' });
    closeDrawer();
  }

  function handleCloseAuthSheet() {
    setIsAuthSheetOpen(false);
    setIsSessionExpired(false);
  }

  const content = (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <TabNavigator />
        <MainMenu onOpenAbout={() => setIsAboutOpen(true)} onOpenAuth={() => setIsAuthSheetOpen(true)} />
        <About isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        <AuthSheet isOpen={isAuthSheetOpen} onClose={handleCloseAuthSheet} onAuthenticated={handleAuthenticated} sessionExpired={isSessionExpired} onUseLocalData={handleUseLocalData} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, { backgroundColor: colors.background }]}>
        <View style={styles.webContent}>
          {content}
        </View>
      </View>
    );
  }

  return content;
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

function DatabaseErrorScreen({ onRetry }: { onRetry: () => void }) {
  const [isRetrying, setIsRetrying] = useState(false);

  function handleRetry() {
    setIsRetrying(true);
    onRetry();
  }

  return (
    <View style={[styles.loadingContainer, { backgroundColor: '#fff' }]}>
      <Text style={[styles.loadingText, { color: '#E05555', marginBottom: 16 }]}>Unable to initialize the database.</Text>
      <Pressable onPress={handleRetry} disabled={isRetrying} style={styles.retryButton}>
        <Text style={styles.retryText}>{isRetrying ? 'Retrying...' : 'Retry'}</Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasDbError, setHasDbError] = useState(false);

  function initDatabase() {
    setHasDbError(false);
    setIsReady(false);
    getDatabase().then(() => setIsReady(true)).catch((error) => {
      console.error('Database initialization failed:', error);
      setHasDbError(true);
      setIsReady(true);
    });
  }

  useEffect(() => {
    initDatabase();
  }, []);

  if (hasDbError) {
    return <DatabaseErrorScreen onRetry={initDatabase} />;
  }

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataSourceProvider>
            <DrawerProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </DrawerProvider>
          </DataSourceProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4A5DF9',
  },
  retryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  webContainer: {
    flex: 1,
    alignItems: 'center',
  },
  webContent: {
    flex: 1,
    width: '100%',
    maxWidth: 768,
    overflow: 'hidden',
  },
});
