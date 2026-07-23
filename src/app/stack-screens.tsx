import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

export { ListsStackScreen, ProductsStackScreen, StoresStackScreen };
export type { ListsStackParamList, ProductsStackParamList, StoresStackParamList };
