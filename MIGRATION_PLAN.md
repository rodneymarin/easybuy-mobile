# PLAN DE MIGRACIÓN DE ARQUITECTURA: EASYBUY (MOBILE A WEB)
**De Expo Managed Workflow a React Web (TypeScript, Vite, Tailwind CSS y Supabase)**

Este documento establece el plano arquitectónico detallado y de nivel empresarial para migrar el repositorio de la aplicación móvil EasyBuy hacia un repositorio web moderno e independiente.

---

## ÍNDICE
1. [SECCIÓN 0: EL CONTRATO ARQUITECTÓNICO GLOBAL (EL ANCLA)](#sección-0-el-contrato-arquitectónico-global-el-ancla)
   - [1. Estrategia de Enrutamiento](#1-estrategia-de-enrutamiento)
   - [2. Sistema de Estilos y Diseño (Equivalencias Tailwind)](#2-sistema-de-estilos-y-diseño-equivalencias-tailwind)
   - [3. Estructura de Carpetas Destino de la Aplicación Web](#3-estructura-de-carpetas-destino-de-la-aplicación-web)
   - [4. Estrategia de Tipado (TypeScript) y Path Aliases](#4-estrategia-de-tipado-typescript-y-path-aliases)
   - [5. Abstracción de la Capa de Datos (SQLite -> Supabase)](#5-abstracción-de-la-capa-de-datos-sqlite---supabase)
   - [6. Tabla Estricta de Equivalencias de Ecosistema](#6-tabla-estricta-de-equivalencias-de-ecosistema)
2. [FASES DE MIGRACIÓN SECUENCIALES (CON IDS ÚNICOS)](#fases-de-migración-secuenciales-con-ids-únicos)
   - [MIG-01-CORE: Inicialización y Scaffolding del Proyecto Web](#mig-01-core-inicialización-y-scaffolding-del-proyecto-web)
   - [MIG-02-DATA-SERVICES: Configuración de Cliente y Repositorios Supabase](#mig-02-data-services-configuración-de-cliente-y-repositorios-supabase)
   - [MIG-03-UI-COMPONENTS: Portado de Componentes de UI Atómicos](#mig-03-ui-components-portado-de-componentes-de-ui-atómicos)
   - [MIG-04-STORES-FEATURE: Migración de la Característica de Tiendas](#mig-04-stores-feature-migración-de-la-característica-de-tiendas)
   - [MIG-05-PRODUCTS-FEATURE: Migración de la Característica de Catálogo de Productos](#mig-05-products-feature-migración-de-la-característica-de-catálogo-de-productos)
   - [MIG-06-LISTS-FEATURE: Migración de la Característica de Listas de Compra](#mig-06-lists-feature-migración-de-la-característica-de-listas-de-compra)
   - [MIG-07-CONTEXTS-INTEGRATION: Portado de Proveedores de Contexto](#mig-07-contexts-integration-portado-de-proveedores-de-contexto)
   - [MIG-08-ROUTING-LAYOUT: Configuración de Enrutador Web y Layout Global](#mig-08-routing-layout-configuración-de-enrutador-web-y-layout-global)
   - [MIG-09-E2E-VALIDATION: Verificación Final y Despliegue de Producción](#mig-09-e2e-validation-verificación-final-y-despliegue-de-producción)
3. [REGLAS DE CONTROL TÉCNICO (INSTRUCCIONES PARA EL PROMPT CLI)](#3-reglas-de-control-técnico-instrucciones-para-el-prompt-cli)

---

## SECCIÓN 0: EL CONTRATO ARQUITECTÓNICO GLOBAL (EL ANCLA)

Estas reglas de diseño y estructura son inmutables. El subagente de IA debe apegarse rigurosamente a este contrato técnico en cada fase del proceso de migración.

### 1. Estrategia de Enrutamiento
La aplicación móvil utiliza un enrutador basado en `React Navigation` (`createNativeStackNavigator` y `createMaterialTopTabNavigator`). En la versión web, este flujo se centraliza en `React Router v6` mediante un enrutador declarativo moderno en la raíz de `[WEB_ROOT]`.

**Mapeo de Rutas de la Aplicación:**

| Flujo RN Origen | Pantalla RN Origen | Ruta Web Destino (`[WEB_ROOT]`) | Componente Web Renderizado |
| :--- | :--- | :--- | :--- |
| **ListsStack** | `InicioList` | `/` | `src/features/shopping-lists/ShoppingList.tsx` |
| **ListsStack** | `ShoppingListDetail` | `/lists/:shoppingListId` | `src/features/shopping-lists/ShoppingListDetail.tsx` |
| **ListsStack** | `ShoppingListItemForm` (Modal) | `/lists/:shoppingListId/items/form` | `src/features/shopping-lists/ShoppingListItemForm.tsx` |
| **ProductsStack** | `ProductList` | `/products` | `src/features/products/ProductList.tsx` |
| **ProductsStack** | `ProductForm` | `/products/form` | `src/features/products/ProductForm.tsx` |
| **StoresStack** | `StoreList` | `/stores` | `src/features/stores/StoreList.tsx` |
| **StoresStack** | `StoreForm` | `/stores/form` | `src/features/stores/StoreForm.tsx` |

**Comportamiento Visual del Enrutador:**
- En Web se utilizará un Layout de aplicación común (`Layout.tsx`) que envuelve a todas las páginas mediante `<Outlet />`.
- En lugar del deslizamiento de pestañas nativo (`swipeEnabled: true`), la interfaz web proveerá un Navbar de cabecera fijo (responsive sidebar en Desktop y barra de navegación inferior minimalista en Mobile) para cambiar instantáneamente entre `/`, `/products` y `/stores`.

---

### 2. Sistema de Estilos y Diseño (Equivalencias Tailwind)
Se prohíbe el uso de `StyleSheet.create` de React Native o cualquier otro framework CSS-in-JS. La versión web utilizará clases de utilidad de **Tailwind CSS**.

**Equivalencias Exactas de Componentes y Diseño:**

| Elemento React Native | Equivalente HTML Semántico | Clase Base de Tailwind CSS |
| :--- | :--- | :--- |
| `<View>` (Layout) | `<div>` | `flex flex-col` |
| `<View>` (Fila) | `<div>` | `flex flex-row items-center` |
| `<ScrollView>` | `<div>` | `overflow-y-auto max-h-screen` |
| `<Text>` (Párrafo) | `<p>` o `<span>` | `text-sm font-normal text-slate-800 dark:text-slate-200` |
| `<Text style={{fontSize: 18, fontWeight: 'bold'}}>` | `<h2>` | `text-lg font-bold text-slate-900 dark:text-white` |
| `<TouchableOpacity>` / `<Pressable>` | `<button>` | `cursor-pointer transition-all active:scale-[0.98] focus:outline-none` |
| `useSafeAreaInsets()` (Top/Bottom padding) | `div` o Layout wrapper | `pt-4 pb-6 px-4 md:py-8` (manejado por el viewport del navegador) |

**Paleta de Colores de Tiendas (Mapeo de Índice 0-8 en la Base de Datos):**
La base de datos local almacena el color de la tienda como un entero de 0 a 8. En Web, este entero se mapea dinámicamente utilizando el siguiente diccionario CSS o clases Tailwind:

```typescript
export const STORE_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900' },
  1: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900' },
  2: { bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-900' },
  3: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900' },
  4: { bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900' },
  5: { bg: 'bg-violet-100 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-900' },
  6: { bg: 'bg-cyan-100 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-900' },
  7: { bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-900' },
  8: { bg: 'bg-slate-100 dark:bg-slate-800/40', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
};
```

---

### 3. Estructura de Carpetas Destino de la Aplicación Web
El nuevo repositorio web `[WEB_ROOT]` se estructurará rigurosamente bajo el siguiente árbol de directorios estandarizado:

```text
[WEB_ROOT]/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── action-bar.tsx
│   │   └── layout/
│   │       ├── Layout.tsx
│   │       └── Navigation.tsx
│   ├── features/
│   │   ├── stores/
│   │   │   ├── StoreList.tsx
│   │   │   ├── StoreForm.tsx
│   │   │   └── components/
│   │   ├── products/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── components/
│   │   └── shopping-lists/
│   │       ├── ShoppingList.tsx
│   │       ├── ShoppingListDetail.tsx
│   │       ├── ShoppingListItemForm.tsx
│   │       └── components/
│   ├── services/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   └── repositories/
│   │       ├── stores.repository.ts
│   │       ├── products.repository.ts
│   │       ├── shopping-lists.repository.ts
│   │       └── settings.repository.ts
│   ├── context/
│   │   ├── ThemeContext.tsx
│   │   ├── I18nContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useSelectionMode.ts
│   └── models/
│       ├── index.ts
│       ├── store.model.ts
│       ├── product.model.ts
│       ├── price.model.ts
│       ├── shopping-list.model.ts
│       └── shopping-list-item.model.ts
```

---

### 4. Estrategia de Tipado (TypeScript) y Path Aliases
- Se utilizará TypeScript en modo estricto (`"strict": true`).
- Configurar path aliases absolutos en `[WEB_ROOT]/tsconfig.json` y `[WEB_ROOT]/vite.config.ts` para que todas las importaciones utilicen `@/` apuntando a `[WEB_ROOT]/src/`.
- **Regla Estricta:** Quedan absolutamente prohibidos las importaciones de rutas relativas con niveles profundos como `../../../components/...`. Todo debe importarse con alias (ej: `import { Button } from '@/components/ui/button'`).

---

### 5. Abstracción de la Capa de Datos (SQLite -> Supabase)
En la aplicación móvil, los componentes y pantallas consumen SQLite mediante promesas importadas desde `[MOBILE_ROOT]/src/lib/repositories/`. En la versión Web, se aplicará un **Patrón de Repositorio** desacoplado:

1. **PROHIBICIÓN DE LLAMADAS DIRECTAS:** Los componentes de UI de React tienen prohibido interactuar directamente con la instancia `@supabase/supabase-js`. Toda manipulación de base de datos debe ocurrir a través de servicios dedicados en `src/services/repositories/`.
2. **MANEJO DE ESTADOS ASÍNCRONOS:** El fetch de datos en componentes debe realizarse a través de estados unificados y predecibles utilizando el siguiente patrón de interfaz genérico:

```typescript
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
```

3. **EQUIVALENCIA DE TIPOS DE ID:**
   - La base de datos local de SQLite usaba strings autogenerados en el frontend para IDs de `stores`, `products` y `shopping_lists`.
   - La versión de Supabase configurada en `supabase-migration.sql` utiliza **UUID v4** de forma estricta para estas tablas. El cliente web frontend debe utilizar UUIDv4 válidos para inserciones, o dejar que la base de datos de Supabase los autogenere mediante `gen_random_uuid()`.
   - Para `shopping_list_items`, SQLite usa un `INTEGER PRIMARY KEY AUTOINCREMENT` que mapea exactamente a la columna `id BIGINT GENERATED BY DEFAULT AS IDENTITY` de Supabase.

---

### 6. Tabla Estricta de Equivalencias de Ecosistema

El agente ejecutor debe aplicar el siguiente mapa de traducción al migrar dependencias y APIs del dispositivo a la Web:

| Componente/Librería Expo (Mobile) | Reemplazo Tecnológico en Web | Comportamiento o API Web Equivalente |
| :--- | :--- | :--- |
| `expo-sqlite` | `@supabase/supabase-js` | Repositorios asíncronos que consumen la API REST de Supabase. |
| `@expo/vector-icons` (Ionicons) | `lucide-react` | Iconos basados en SVGs ligeros (ej: `<Ionicons name="storefront">` -> `<Storefront />` o `<Store />` de Lucide). |
| `expo-clipboard` | Web Clipboard API | Uso de `navigator.clipboard.writeText(text)` de forma nativa en el navegador. |
| `expo-status-bar` | **Eliminar sin reemplazo** | Los navegadores no gestionan la barra de estado del sistema operativo. |
| `react-native-safe-area-context` | **Eliminar** | Reemplazar con clases normales de espaciado responsive CSS (`p-4`, `m-auto`). |
| `react-native-gesture-handler` | **Eliminar** | Utilizar los eventos de puntero nativos de HTML5 (`onMouseDown`, `onTouchStart`) si son necesarios. |
| `react-native-pager-view` | Componente nativo HTML | Reemplazar con vistas normales controladas por estados o scrollbars CSS (`overflow-x-auto snap-x`). |

---

## FASES DE MIGRACIÓN SECUENCIALES (CON IDS ÚNICOS)

### MIG-01-CORE: Inicialización y Scaffolding del Proyecto Web
- **Pre-requisitos:** Ninguno (Fase de Arranque).
- **Contexto de Entrada Requerido (React Native):**
  - `[MOBILE_ROOT]/package.json`
- **Contrato de Salida Esperado (React Web):**
  - `[WEB_ROOT]/package.json`
  - `[WEB_ROOT]/tsconfig.json`
  - `[WEB_ROOT]/vite.config.ts`
  - `[WEB_ROOT]/tailwind.config.js`
  - `[WEB_ROOT]/postcss.config.js`
  - `[WEB_ROOT]/index.html`
  - `[WEB_ROOT]/src/index.css`
- **Instrucciones Quirúrgicas de Transformación:**
  1. Crear un proyecto web moderno utilizando **Vite** con el template de **React** y **TypeScript**.
  2. Configurar el archivo `package.json` con dependencias modernas para React 19, TypeScript, Tailwind CSS, Lucide Icons, React Router v6 y el SDK de Supabase:
     ```json
     {
       "dependencies": {
         "react": "^19.0.0",
         "react-dom": "^19.0.0",
         "react-router-dom": "^6.28.0",
         "@supabase/supabase-js": "^2.45.0",
         "lucide-react": "^0.400.0"
       },
       "devDependencies": {
         "vite": "^6.0.0",
         "typescript": "^5.0.0",
         "tailwindcss": "^3.4.0",
         "autoprefixer": "^10.4.0",
         "postcss": "^8.4.0",
         "@types/react": "^19.0.0",
         "@types/react-dom": "^19.0.0"
       }
     }
     ```
  3. Configurar `vite.config.ts` y `tsconfig.json` para soportar aliases absolutos `@/*` mapeados a `src/*`.
  4. Configurar Tailwind CSS en `tailwind.config.js` habilitando el modo oscuro mediante la clase `dark` y definiendo una estructura fluida para contenedores móviles.
  5. Configurar `index.html` con un viewport móvil óptimo y configurar `src/index.css` para importar las directivas `@tailwind base; @tailwind components; @tailwind utilities;`.
- **Criterio de Aceptación y Validación:**
  - Ejecutar `npm run build` en `[WEB_ROOT]` de manera exitosa sin errores de compilación ni advertencias de TypeScript.

---

### MIG-02-DATA-SERVICES: Configuración de Cliente y Repositorios Supabase
- **Pre-requisitos:** `MIG-01-CORE`
- **Contexto de Entrada Requerido (React Native):**
  - `[MOBILE_ROOT]/src/lib/database.ts`
  - `[MOBILE_ROOT]/src/lib/repositories/stores.ts`
  - `[MOBILE_ROOT]/src/lib/repositories/products.ts`
  - `[MOBILE_ROOT]/src/lib/repositories/shopping-lists.ts`
  - `[MOBILE_ROOT]/src/lib/repositories/settings.ts`
  - `[MOBILE_ROOT]/supabase-migration.sql`
- **Contrato de Salida Esperado (React Web):**
  - `[WEB_ROOT]/src/services/supabase/client.ts`
  - `[WEB_ROOT]/src/services/supabase/types.ts`
  - `[WEB_ROOT]/src/services/repositories/stores.repository.ts`
  - `[WEB_ROOT]/src/services/repositories/products.repository.ts`
  - `[WEB_ROOT]/src/services/repositories/shopping-lists.repository.ts`
  - `[WEB_ROOT]/src/services/repositories/settings.repository.ts`
- **Instrucciones Quirúrgicas de Transformación:**
  1. **Inicializar Cliente Supabase:** Crear `src/services/supabase/client.ts`. Utilizar variables de entorno de ejemplo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
  2. **Estructurar Tipos de Base de Datos:** Generar los tipos de TypeScript basados fielmente en el archivo `supabase-migration.sql` dentro de `src/services/supabase/types.ts`.
  3. **Reescribir Repositorios SQLite a Supabase:** Traducir las queries relacionales SQL de SQLite a sintaxis del cliente JS de Supabase.
     - *Ejemplo de Conversión (Tiendas):*
       - SQLite: `SELECT id, description, color FROM stores`
       - Supabase: `const { data, error } = await supabase.from('stores').select('id, description, color').order('description')`
     - *Ejemplo de Conversión (Precios de Productos - Pivot):*
       - Al guardar un producto con precios asociados por tienda, utilizar operaciones asíncronas con transacciones implicitas del cliente de Supabase (ej: hacer un insert en `products` y luego un bulk insert en `product_prices` utilizando el nuevo ID del producto creado).
     - *Mapeo de booleanos:* En SQLite `done` y `pinned` se almacenan como enteros (0 o 1). En Supabase son booleanos nativos (`true`/`false`). Asegurar la conversión de datos en los métodos de mapeo del repositorio.
- **Criterio de Aceptación y Validación:**
  - Ejecutar `npx tsc --noEmit` en `[WEB_ROOT]` para validar que todos los métodos de los repositorios tengan retornos tipados correctamente (`Promise<Store[]>`, `Promise<void>`, etc.) y no existan referencias a SQLite.

---

### MIG-03-UI-COMPONENTS: Portado de Componentes de UI Atómicos
- **Pre-requisitos:** `MIG-01-CORE`
- **Contexto de Entrada Requerido (React Native):**
  - `[MOBILE_ROOT]/src/components/ui/button/Button.tsx`
  - `[MOBILE_ROOT]/src/components/ui/input/Input.tsx`
  - `[MOBILE_ROOT]/src/components/ui/toggle/Toggle.tsx`
  - `[MOBILE_ROOT]/src/components/ui/close-button/CloseButton.tsx`
  - `[MOBILE_ROOT]/src/components/ui/card-title/CardTitle.tsx`
  - `[MOBILE_ROOT]/src/components/ui/dialog/` (Dialog, DialogContent, DialogTitle)
  - `[MOBILE_ROOT]/src/components/ui/select/` (Select, SelectTrigger, SelectContent, SelectItem)
- **Contrato de Salida Esperado (React Web):**
  - `[WEB_ROOT]/src/components/ui/button.tsx`
  - `[WEB_ROOT]/src/components/ui/input.tsx`
  - `[WEB_ROOT]/src/components/ui/toggle.tsx`
  - `[WEB_ROOT]/src/components/ui/dialog.tsx`
  - `[WEB_ROOT]/src/components/ui/select.tsx`
  - `[WEB_ROOT]/src/components/ui/action-bar.tsx`
- **Instrucciones Quirúrgicas de Transformación:**
  1. **Purga de Ecosistema Móvil:** Eliminar por completo imports de `react-native`, `react-native-gesture-handler`, `@expo/vector-icons` u otras dependencias propietarias.
  2. **Traducción a Tailwind:** Traducir los estilos CSS definidos en `StyleSheet.create` de cada componente nativo a un conjunto de clases Tailwind integradas directamente en el código de marcado.
  3. **Sustitución de Iconos:** Mapear de manera exacta los iconos de Ionicons a Lucide React.
     - *Ejemplo:* `<Ionicons name="close" />` se reemplaza por `<X className="h-5 w-5" />` de Lucide.
  4. **Componentes Flotantes (Dialogs, Selects, Bottom Sheets):**
     - En la app móvil se usan overlays nativos o BottomSheets. En Web, implementarlos usando modales HTML semánticos (`<dialog>` con React state) o contenedores absolutizados (`fixed inset-0 bg-black/50 flex items-end md:items-center justify-center`) estilizados con transiciones fluidas de Tailwind para simular la animación nativa de deslizamiento desde el fondo.
- **Criterio de Aceptación y Validación:**
  - Los componentes de UI atómicos deben compilar sin advertencias. Asegurar que los componentes interactivos expongan interfaces de props limpias (ej: `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`).

---

### MIG-04-STORES-FEATURE: Migración de la Característica de Tiendas
- **Pre-requisitos:** `MIG-02-DATA-SERVICES`, `MIG-03-UI-COMPONENTS`
- **Contexto de Entrada Requerido (React Native):**
  - `[MOBILE_ROOT]/src/features/stores/StoreList.tsx`
  - `[MOBILE_ROOT]/src/features/stores/StoreFormScreen.tsx`
  - `[MOBILE_ROOT]/src/features/stores/components/StoreListItem.tsx`
  - `[MOBILE_ROOT]/src/lib/store-colors.ts`
- **Contrato de Salida Esperado (React Web):**
  - `[WEB_ROOT]/src/features/stores/StoreList.tsx`
  - `[WEB_ROOT]/src/features/stores/StoreForm.tsx`
  - `[WEB_ROOT]/src/features/stores/components/StoreListItem.tsx`
- **Instrucciones Quirúrgicas de Transformación:**
  1. **Reemplazo de Pantallas Móviles:** Migrar el contenido de `StoreList.tsx` (que renderiza la lista de tiendas) y `StoreFormScreen.tsx` (formulario para agregar/editar tiendas).
  2. **Integración con Repositorio Supabase:** Sustituir los métodos directos de SQLite por llamadas a `storesRepository.getAllStores()`, `createStore()`, `updateStore()`, y `deleteStore()`.
  3. **Visualización de Colores Dinámicos:** Utilizar el mapa `STORE_COLORS` detallado en la Sección 0 para renderizar las insignias e items de tienda de acuerdo a su ID de color numérico guardado en base de datos.
  4. **Modo Edición / Selección Múltiple:** Portar la funcionalidad de borrado múltiple (Selection Mode) adaptando los gestures de pulsación larga a selectores normales basados en checkboxes de HTML o clics sostenidos.
- **Criterio de Aceptación y Validación:**
  - El módulo de tiendas debe ser completamente autónomo. Validar la compilación mediante `tsc --noEmit`.

---

### MIG-05-PRODUCTS-FEATURE: Migración de la Característica de Catálogo de Productos
- **Pre-requisitos:** `MIG-04-STORES-FEATURE`
- **Contexto de Entrada Requerido (React Native):**
  - `[MOBILE_ROOT]/src/features/products/ProductList.tsx`
  - `[MOBILE_ROOT]/src/features/products/ProductFormScreen.tsx`
- **Contrato de Salida Esperado (React Web):**
  - `[WEB_ROOT]/src/features/products/ProductList.tsx`
  - `[WEB_ROOT]/src/features/products/ProductForm.tsx`
- **Instrucciones Quirúrgicas de Transformación:**
  1. **Extractor de Datos Multitienda:** En la app móvil, el formulario de producto (`ProductFormScreen.tsx`) administra una lista de precios dinámicos vinculados a distintas tiendas.
  2. **Estructura Web:** Diseñar una grilla interactiva en el formulario web que permita listar todas las tiendas disponibles y asignar un input numérico para el precio correspondiente en cada una.
  3. **Unidades de Medida:** Mantener el menú de selección con las unidades estrictas definidas en el check constraint de Postgres: `'bag'`, `'bottle'`, `'box'`, `'container'`, `'kg'`, `'lata'`, `'lt'`, `'pack'`, `'unit'`.
  4. **Búsqueda y Filtrado:** Portar la lógica de filtrado de productos usando un buscador reactivo que haga uso del hook `useDebounce` adaptado a la web.
- **Criterio de Aceptación y Validación:**
  - Asegurar la integridad referencial. Al borrar un producto, validar mediante el código de la vista que se eliminen correctamente sus dependencias de precios de la vista local (la base de datos ejecutará el borrado en cascada configurado en Supabase).

---

### MIG-06-LISTS-FEATURE: Migración de la Característica de Listas de Compra
- **Pre-requisitos:** `MIG-05-PRODUCTS-FEATURE`
- **Contexto de Entrada Requerido (React Native):**
  - `[MOBILE_ROOT]/src/features/shopping-lists/ShoppingList.tsx`
  - `[MOBILE_ROOT]/src/features/shopping-lists/ShoppingListDetailScreen.tsx`
  - `[MOBILE_ROOT]/src/features/shopping-lists/components/`
- **Contrato de Salida Esperado (React Web):**
  - `[WEB_ROOT]/src/features/shopping-lists/ShoppingList.tsx`
  - `[WEB_ROOT]/src/features/shopping-lists/ShoppingListDetail.tsx`
  - `[WEB_ROOT]/src/features/shopping-lists/ShoppingListItemForm.tsx`
  - `[WEB_ROOT]/src/features/shopping-lists/components/` (CheckCircle, Totals, SelectionActions, etc.)
- **Instrucciones Quirúrgicas de Transformación:**
  1. **Migración de Dashboard Central (`ShoppingList.tsx`):** Renderizar el listado general de listas de compras activas.
  2. **Pantalla de Detalle de Lista (`ShoppingListDetail.tsx`):**
     - Portar la lógica para tachar ítems (`toggleItemDone`), fijar artículos en la parte superior (`pinItems`), modificar cantidades y reasignar tiendas a cada artículo.
     - Traducir los cálculos matemáticos de totales y sumatorias por tienda utilizando funciones puras optimizadas sin efectos secundarios.
  3. **Integración de Selección Múltiple y Operación de Movimiento:**
     - La app móvil permite seleccionar múltiples ítems para borrarlos, fijarlos o moverlos de lista. Implementar esto en Web mediante una barra de acciones flotante Tailwind (`fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-lg shadow-xl`) gatillada cuando el estado `isSelectionMode` sea verdadero.
- **Criterio de Aceptación y Validación:**
  - Garantizar la persistencia inmediata de los cambios mediante llamadas asíncronas correctas a `shoppingListsRepository.addItemToList()`, `toggleItemDone()`, `pinItems()`, etc.

---

### MIG-07-CONTEXTS-INTEGRATION: Portado de Proveedores de Contexto
- **Pre-requisitos:** `MIG-01-CORE`
- **Contexto de Entrada Requerido (React Native):**
  - `[MOBILE_ROOT]/src/lib/theme/` (theme-context, colors)
  - `[MOBILE_ROOT]/src/lib/i18n/` (i18n-context, translations)
  - `[MOBILE_ROOT]/src/components/ui/toast/` (ToastContext, ToastView)
- **Contrato de Salida Esperado (React Web):**
  - `[WEB_ROOT]/src/context/ThemeContext.tsx`
  - `[WEB_ROOT]/src/context/I18nContext.tsx`
  - `[WEB_ROOT]/src/context/ToastContext.tsx`
- **Instrucciones Quirúrgicas de Transformación:**
  1. **Adaptación de Temas:** Extraer los colores semánticos definidos en `colors.ts` de la app móvil y volcarlos como variables CSS dentro de `@layer base` en `src/index.css` (ej: `--color-background`, `--color-primary`, etc.). El `ThemeContext` web alternará la clase `.dark` en el tag `<html>` de la página de forma nativa.
  2. **Adaptación de Idiomas (i18n):** Copiar los diccionarios de traducción en español e inglés definidos en `translations.ts` y conservar la funcionalidad del hook `useI18n` sin cambios estructurales en su lógica de resolución de claves jerárquicas.
  3. **Toast Context Web:** Rediseñar el componente `ToastView` para renderizar avisos flotantes web utilizando clases de Tailwind animadas en la esquina superior derecha de la pantalla de forma no intrusiva.
- **Criterio de Aceptación y Validación:**
  - Validar que los hooks `useTheme()`, `useI18n()`, y `useToast()` puedan ser importados libremente por componentes web de UI sin provocar errores de renderizado.

---

### MIG-08-ROUTING-LAYOUT: Configuración de Enrutador Web y Layout Global
- **Pre-requisitos:** `MIG-03-UI-COMPONENTS` a `MIG-07-CONTEXTS-INTEGRATION`
- **Contexto de Entrada Requerido (React Native):**
  - `[MOBILE_ROOT]/src/app/index.tsx`
  - `[MOBILE_ROOT]/src/app/navigation.tsx`
- **Contrato de Salida Esperado (React Web):**
  - `[WEB_ROOT]/src/main.tsx`
  - `[WEB_ROOT]/src/App.tsx`
  - `[WEB_ROOT]/src/components/layout/Layout.tsx`
  - `[WEB_ROOT]/src/components/layout/Navigation.tsx`
- **Instrucciones Quirúrgicas de Transformación:**
  1. **Sustitución de App Entry Point:** Reescribir la inicialización de la app móvil en `App.tsx` y `main.tsx` de Vite.
  2. **Estructura Jerárquica del Enrutador (React Router):**
     - Envolver la aplicación completa en los Context Providers requeridos (`I18nProvider`, `ThemeProvider`, `ToastProvider`).
     - Definir un enrutador declarativo moderno mediante `<BrowserRouter>` o `createBrowserRouter`.
  3. **Diseño de Maquetación de Layout Responsivo (`Layout.tsx`):**
     - Diseñar un cascarón de aplicación web pulido y responsivo.
     - En pantallas Desktop: Un sidebar fijo a la izquierda que contiene el menú principal de la aplicación y navegación directa (`/`, `/products`, `/stores`).
     - En pantallas Mobile: Una barra de navegación inferior minimalista y sticky con iconos de fácil acceso con el pulgar.
- **Criterio de Aceptación y Validación:**
  - Realizar una compilación completa del proyecto utilizando `npm run build` en `[WEB_ROOT]`. El servidor de desarrollo de Vite debe levantar localmente y permitir una navegación fluida por todas las rutas declaradas sin recargar el navegador.

---

### MIG-09-E2E-VALIDATION: Verificación Final y Despliegue de Producción
- **Pre-requisitos:** Todas las fases de migración completadas.
- **Contexto de Entrada Requerido (React Native):** N/A
- **Contrato de Salida Esperado (React Web):**
  - `[WEB_ROOT]/dist/` (Archivos estáticos listos para producción)
- **Instrucciones Quirúrgicas de Transformación:**
  1. **Verificación de Tipos Estricta:** Ejecutar la validación completa del compilador de TypeScript en la app web. Corregir cualquier tipo `any` implícito o importaciones fallidas.
  2. **Pruebas de Sincronización con Supabase:** Validar manualmente que las operaciones de CRUD sobre tiendas, productos y listas se reflejen correctamente y de inmediato en la consola de Supabase.
  3. **Compilación de Producción:** Ejecutar el comando de empaquetado para generar los assets web optimizados, minificados y listos para ser servidos en cualquier hosting web estático (Vercel, Netlify, Cloudflare Pages).
- **Criterio de Aceptación y Validación:**
  - La carpeta `[WEB_ROOT]/dist` debe generarse correctamente con un peso óptimo, sin advertencias críticas y permitiendo arrancar el servidor local mediante `npm run preview`.

---

## 3. REGLAS DE CONTROL TÉCNICO (INSTRUCCIONES PARA EL PROMPT CLI)

Cuando delegues la ejecución de estas fases secuenciales al agente de IA secundario (ej. DeepSeek V4 Flash) a través del CLI de automatización, debes inyectar las siguientes reglas de control para asegurar que no ocurran colisiones de directorios:

1. **Definición de Variables de Ruta:**
   - Antes de iniciar la tarea, declara de forma explícita los directorios absolutos del sistema de archivos local para sustituir las etiquetas conceptuales.
   - *Ejemplo de instrucción de prompt:*
     ```text
     Sustituye la etiqueta [MOBILE_ROOT] por el path absoluto: C:\Users\rodne\Documents\Dev\easybuy-mobile
     Sustituye la etiqueta [WEB_ROOT] por el path absoluto del nuevo repositorio independiente: C:\Users\rodne\Documents\Dev\easybuy-web
     ```
2. **Uso Exclusivo de Contexto de Lectura:**
   - Indícale al modelo secundario que **únicamente** tiene permisos de LECTURA sobre los archivos ubicados bajo `[MOBILE_ROOT]/...`.
   - El modelo **bajo ninguna circunstancia** debe modificar, borrar o instalar dependencias dentro del directorio `[MOBILE_ROOT]` de la aplicación móvil.
3. **Focalización del Espacio de Trabajo de Escritura:**
   - Todas las instalaciones de dependencias (`npm install`), configuraciones de entorno y operaciones de escritura (`write`, `edit`) deben ejecutarse teniendo como base estricta el directorio de trabajo (`workdir`) apuntando a `[WEB_ROOT]`.
4. **Instrucciones de Verificación de Salud del Código:**
   - En cada fase, pídele al agente secundario que valide su propio trabajo ejecutando comandos de análisis estático en el directorio destino (`[WEB_ROOT]`), tales como:
     - `npx tsc --noEmit` para verificar la consistencia de tipos.
     - `npm run build` para certificar la compilación sin errores antes de reportar la finalización de la fase correspondiente.
