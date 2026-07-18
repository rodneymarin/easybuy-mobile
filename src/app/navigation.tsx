import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
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
    <View style={[styles.tabBar, { backgroundColor: colors.background, borderTopColor: colors.border }, { paddingBottom: insets.bottom }]}>
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
export type { ListsStackParamList, ProductsStackParamList, StoresStackParamList };
