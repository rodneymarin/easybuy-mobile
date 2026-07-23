import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import { ListsStackScreen, ProductsStackScreen, StoresStackScreen } from './stack-screens';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.cardBackground,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        initialRouteName="inicio"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: insets.bottom + 24,
            height: 56 + insets.bottom + 24,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarLabelStyle: { fontSize: 10, marginTop: 2 },
        }}
      >
        <Tab.Screen name="inicio" component={ListsStackScreen} options={{ tabBarLabel: t('tab.lists'), tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} /> }} />
        <Tab.Screen name="productos" component={ProductsStackScreen} options={{ tabBarLabel: t('tab.products'), tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} /> }} />
        <Tab.Screen name="tiendas" component={StoresStackScreen} options={{ tabBarLabel: t('tab.stores'), tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} /> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});

export { TabNavigator };
export type { ListsStackParamList, ProductsStackParamList, StoresStackParamList } from './stack-screens';
