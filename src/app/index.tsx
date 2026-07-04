import { useTheme, ThemeProvider } from '@lib/theme';
import { DrawerProvider } from '@lib/drawer';
import { MainMenu } from '@components/common/main-menu';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { TabNavigator } from './navigation';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <DrawerProvider>
      <NavigationContainer>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <TabNavigator />
      </NavigationContainer>
      <MainMenu />
    </DrawerProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
