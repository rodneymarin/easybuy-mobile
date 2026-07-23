import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import { ListsStackScreen, ProductsStackScreen, StoresStackScreen } from './stack-screens';

const Tab = createMaterialTopTabNavigator();

const TAB_ICONS = [
  { focused: 'list', unfocused: 'list-outline' },
  { focused: 'cube', unfocused: 'cube-outline' },
  { focused: 'storefront', unfocused: 'storefront-outline' },
] as const;

const TAB_ROUTES = ['inicio', 'productos', 'tiendas'] as const;

interface CustomBottomBarProps {
  currentIndex: number;
  onTabPress: (routeName: string) => void;
}

function CustomBottomBar({ currentIndex, onTabPress }: CustomBottomBarProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 24 }]}>
      {TAB_ICONS.map((icons, index) => {
        const isFocused = index === currentIndex;
        return (
          <Pressable key={index} onPress={() => onTabPress(TAB_ROUTES[index])} style={styles.tabItem}>
            <Ionicons name={isFocused ? icons.focused : icons.unfocused} size={24} color={isFocused ? colors.primary : colors.tabBarInactive} />
            <Text style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.tabBarInactive }]}>
              {index === 0 ? t('tab.lists') : index === 1 ? t('tab.products') : t('tab.stores')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabNavigator() {
  const { isDark, colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigationRef = useRef<any>(null);

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

  function handleTabPress(routeName: string) {
    navigationRef.current?.navigate(routeName);
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} onStateChange={(state) => setCurrentIndex(state?.index ?? 0)}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          initialRouteName="inicio"
          tabBar={() => null}
          screenOptions={{
            swipeEnabled: true,
            lazy: false,
            animationEnabled: false,
          }}
        >
          <Tab.Screen name="inicio" component={ListsStackScreen} />
          <Tab.Screen name="productos" component={ProductsStackScreen} />
          <Tab.Screen name="tiendas" component={StoresStackScreen} />
        </Tab.Navigator>
        <CustomBottomBar currentIndex={currentIndex} onTabPress={handleTabPress} />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});

export { TabNavigator };
export type { ListsStackParamList, ProductsStackParamList, StoresStackParamList } from './stack-screens';
