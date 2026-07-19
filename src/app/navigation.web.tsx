import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  StoreForm: { store?: { id: string; description: string; color?: number } };
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
            paddingBottom: insets.bottom,
            height: 56 + insets.bottom,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarLabelStyle: { fontSize: 10, marginTop: 2 },
        }}
      >
        <Tab.Screen
          name="inicio"
          component={ListsStackScreen}
          options={{ tabBarLabel: t('tab.lists'), tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} /> }}
        />
        <Tab.Screen
          name="productos"
          component={ProductsStackScreen}
          options={{ tabBarLabel: t('tab.products'), tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} /> }}
        />
        <Tab.Screen
          name="tiendas"
          component={StoresStackScreen}
          options={{ tabBarLabel: t('tab.stores'), tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});

export { TabNavigator };
export type { ListsStackParamList, ProductsStackParamList, StoresStackParamList };
