import { useEffect, useMemo, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme, ThemeProvider } from '@lib/theme';
import { DrawerProvider } from '@lib/drawer';
import { I18nProvider } from '@lib/i18n';
import { MainMenu, ToastProvider } from '@components/ui';
import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { getDatabase } from '@lib/database';
import { TabNavigator } from './navigation';

function AppContent() {
  const { isDark, colors } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.cardBackground,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
      },
    };
  }, [isDark, colors]);

  return (
    <DrawerProvider>
      <SafeAreaProvider>
        <ToastProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <TabNavigator />
          </NavigationContainer>
          <MainMenu />
        </ToastProvider>
      </SafeAreaProvider>
    </DrawerProvider>
  );
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
});
