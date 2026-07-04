import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import InicioScreen from './(tabs)/inicio';
import ProductosScreen from './(tabs)/productos';
import TiendasScreen from './(tabs)/tiendas';

const Tab = createBottomTabNavigator();

function TabBarIndicator({ state, ...rest }: BottomTabBarProps) {
  const { colors } = useTheme();
  const tabCount = state.routes.length;
  const tabWidth = 100 / tabCount;
  const barWidth = tabWidth * 0.35;
  const left = state.index * tabWidth + (tabWidth - barWidth) / 2;

  return (
    <View>
      <View style={[styles.indicatorContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.indicator, { backgroundColor: colors.primary, width: `${barWidth}%`, left: `${left}%` }]} />
      </View>
      <BottomTabBar state={state} {...rest} />
    </View>
  );
}

function CustomTabBar(props: BottomTabBarProps) {
  return <TabBarIndicator {...props} />;
}

function TabNavigator() {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <Tab.Navigator tabBar={CustomTabBar} screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.tabBarInactive, tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border } }}>
      <Tab.Screen name="inicio" component={InicioScreen} options={{
          tabBarLabel: t('tab.lists'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
        }} />
      <Tab.Screen name="productos" component={ProductosScreen} options={{
          tabBarLabel: t('tab.products'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={size} color={color} />
          ),
        }} />
      <Tab.Screen name="tiendas" component={TiendasScreen} options={{
          tabBarLabel: t('tab.stores'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'storefront' : 'storefront-outline'} size={size} color={color} />
          ),
        }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  indicatorContainer: {
    flexDirection: 'row',
    height: 2,
  },
  indicator: {
    height: 2,
    position: 'absolute',
  },
});

export { TabNavigator };
