import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme, ThemeProvider } from '@lib/theme';
import { DrawerProvider } from '@lib/drawer';
import { I18nProvider } from '@lib/i18n';
import { DataSourceProvider } from '@lib/data-source';
import { AuthProvider } from '@lib/auth';
import { MainMenu, About, ToastProvider } from '@components/ui';
import { StatusBar } from 'expo-status-bar';
import { getDatabase } from '@lib/database';
import { TabNavigator } from './navigation';

function AppContent() {
  const { isDark, colors } = useTheme();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const content = (
    <AuthProvider>
      <DataSourceProvider>
        <DrawerProvider>
          <GestureHandlerRootView style={styles.gestureRoot}>
            <SafeAreaProvider>
              <ToastProvider>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <TabNavigator />
                <MainMenu onOpenAbout={() => setIsAboutOpen(true)} />
                <About isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
              </ToastProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </DrawerProvider>
      </DataSourceProvider>
    </AuthProvider>
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
        <AppContent />
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
