import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useI18n } from '@lib/i18n';
import { useTheme } from '@lib/theme';
import InicioScreen from './(tabs)/inicio';
import ProductosScreen from './(tabs)/productos';
import TiendasScreen from './(tabs)/tiendas';
import { ShoppingListDetailScreen } from '@features/shopping-lists';
import { ProductFormScreen } from '@features/products';
import { StoreFormScreen } from '@features/stores';
import { ShoppingListItemFormScreen } from '@features/shopping-lists/components';
import type { Price } from '@models/price.model';
import type { Product } from '@models/product.model';
import type { Store } from '@models/store.model';
import type { StoreListData } from '@features/stores';

const Tab = createBottomTabNavigator();

type ListsStackParamList = {
  InicioList: undefined;
  ShoppingListDetail: { shoppingListId: string };
  ShoppingListItemForm: { item?: { rowId: number; productId: string; quantity: number; storeId?: string }; shoppingListId: string; products: Product[]; stores: Store[] };
};

type ProductsStackParamList = {
  ProductList: undefined;
  ProductForm: { product?: { id: string; productName: string; unitOfMeasurement: string; prices?: Price[] }; stores: StoreListData[] };
};

type StoresStackParamList = {
  StoreList: undefined;
  StoreForm: { store?: { id: string; description: string } };
};

const ListsStack = createNativeStackNavigator<ListsStackParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const StoresStack = createNativeStackNavigator<StoresStackParamList>();

function ListsStackScreen() {
  const { colors } = useTheme();

  return (
    <ListsStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <ListsStack.Screen name="InicioList" component={InicioScreen} />
      <ListsStack.Screen name="ShoppingListDetail" component={ShoppingListDetailScreen} />
      <ListsStack.Screen name="ShoppingListItemForm" component={ShoppingListItemFormScreen} />
    </ListsStack.Navigator>
  );
}

function ProductsStackScreen() {
  const { colors } = useTheme();

  return (
    <ProductsStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <ProductsStack.Screen name="ProductList" component={ProductosScreen} />
      <ProductsStack.Screen name="ProductForm" component={ProductFormScreen} />
    </ProductsStack.Navigator>
  );
}

function StoresStackScreen() {
  const { colors } = useTheme();

  return (
    <StoresStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <StoresStack.Screen name="StoreList" component={TiendasScreen} />
      <StoresStack.Screen name="StoreForm" component={StoreFormScreen} />
    </StoresStack.Navigator>
  );
}

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
      <Tab.Screen name="inicio" component={ListsStackScreen} options={{
          tabBarLabel: t('tab.lists'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
        }} />
      <Tab.Screen name="productos" component={ProductsStackScreen} options={{
          tabBarLabel: t('tab.products'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={size} color={color} />
          ),
        }} />
      <Tab.Screen name="tiendas" component={StoresStackScreen} options={{
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
export type { ListsStackParamList, ProductsStackParamList, StoresStackParamList };
