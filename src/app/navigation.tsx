import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import InicioScreen from './(tabs)/inicio';
import ProductosScreen from './(tabs)/productos';
import TiendasScreen from './(tabs)/tiendas';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#007AFF', tabBarInactiveTintColor: '#8e8e93' }}>
      <Tab.Screen name="inicio" component={InicioScreen} options={{
          tabBarLabel: 'Listas',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
        }} />
      <Tab.Screen name="productos" component={ProductosScreen} options={{
          tabBarLabel: 'Productos',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={size} color={color} />
          ),
        }} />
      <Tab.Screen name="tiendas" component={TiendasScreen} options={{
          tabBarLabel: 'Tiendas',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'storefront' : 'storefront-outline'} size={size} color={color} />
          ),
        }} />
    </Tab.Navigator>
  );
}

export { TabNavigator };
