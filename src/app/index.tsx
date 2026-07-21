import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme, ThemeProvider } from '@lib/theme';
import { DrawerProvider, useDrawer } from '@lib/drawer';
import { I18nProvider, useI18n } from '@lib/i18n';
import { DataSourceProvider, useDataSource } from '@lib/data-source';
import { AuthProvider, subscribeToAuthError } from '@lib/auth';
import { MainMenu, About, AuthSheet, ToastProvider, useToast } from '@components/ui';
import { StatusBar } from 'expo-status-bar';
import { getDatabase } from '@lib/database';
import { TabNavigator } from './navigation';

function AppContent() {
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const { setDataSource } = useDataSource();
  const { closeDrawer } = useDrawer();
  const toast = useToast();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthError(() => {
      setIsSessionExpired(true);
      setIsAuthSheetOpen(true);
    });
    return unsubscribe;
  }, []);

  function handleAuthenticated() {
    setIsSessionExpired(false);
    setDataSource('cloud');
    closeDrawer();
    setIsAuthSheetOpen(false);
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

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getDatabase().then(() => setIsReady(true)).catch(() => setIsReady(true));
  }, []);

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
