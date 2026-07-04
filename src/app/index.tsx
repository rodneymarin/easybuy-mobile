import { DrawerProvider } from '@lib/drawer';
import { MainMenu } from '@components/common/main-menu';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { TabNavigator } from './navigation';

export default function App() {
  return (
    <DrawerProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TabNavigator />
      </NavigationContainer>
      <MainMenu />
    </DrawerProvider>
  );
}
