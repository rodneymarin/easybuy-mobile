-- =============================================================================
-- ARQUITECTURA DE MIGRACIÓN DE DATOS: LOCAL (SQLITE) A CLOUD (SUPABASE/POSTGRES)
-- Proyecto: EasyBuy Mobile
-- Autor: Frontend Principal Architect & Migration Expert
-- Fecha: Julio 2026
-- =============================================================================
-- Este script SQL configura una estructura de base de datos relacional y robusta
-- en Supabase (PostgreSQL), preservando fielmente los modelos locales (SQLite)
-- pero aplicando las mejores prácticas y características nativas de la nube.
--
-- MEJORAS DE ARQUITECTURA INTRODUCIDAS:
-- 1. UUIDs Nativos: Migración de identificadores de texto plano a tipos UUIDv4
--    optimizados para índices y generación automática con gen_random_uuid().
-- 2. Integración con Supabase Auth (Multi-Tenancy): Adición de la columna 'user_id'
--    con referencia externa a 'auth.users' en todas las tablas clave.
-- 3. Tipos de Datos PostgreSQL Optimizados:
--    - BOOLEAN en lugar de enteros (0/1) para los estados 'done' y 'pinned'.
--    - NUMERIC(10, 2) para precios y NUMERIC(10, 3) para cantidades (soporta decimales
--      con exactitud matemática sin errores de redondeo IEEE-754).
--    - SMALLINT para colores (0 a 8) con restricción CHECK de dominio en base de datos.
-- 4. Integridad Referencial Estricta: Borrado en cascada (ON DELETE CASCADE) y
--    puesta a nulo (ON DELETE SET NULL) donde corresponda para evitar orfandad de registros.
-- 5. Row Level Security (RLS) Avanzado: Aislamiento por inquilino mediante políticas
--    Postgres basadas en auth.uid(). Permite datos globales compartidos (user_id IS NULL)
--    como lectura pública, y restringe la escritura únicamente al propietario legítimo.
-- 6. Supabase Realtime: Replicación habilitada de forma nativa para que múltiples
--    dispositivos compartan actualizaciones de listas en tiempo real de forma inmediata.
-- 7. Índices de Rendimiento: Índices B-Tree optimizados en columnas de búsqueda frecuentes.
-- 8. Mapeo de Semillas (Seeds): Datos mockup estables, portados de strings locales
--    arbitrarios hacia UUIDv4 fijos consistentes para facilitar pruebas manuales inmediatas.
-- =============================================================================

-- Habilitar la extensión requerida para UUIDs (normalmente activa por defecto en Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Limpieza limpia para garantizar la ejecución idempotente de la migración
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.shopping_list_items CASCADE;
DROP TABLE IF EXISTS public.shopping_lists CASCADE;
DROP TABLE IF EXISTS public.product_prices CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.stores CASCADE;

-- =============================================================================
-- DDL - CREACIÓN DE TABLAS NATIVAS EN EL ESQUEMA PÚBLICO
-- =============================================================================

-- 1. TABLA: stores (Tiendas)
CREATE TABLE public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    color SMALLINT NOT NULL DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Restricción: El rango de color debe estar comprendido entre 0 y 8 según el modelo de la app
    CONSTRAINT check_valid_color CHECK (color >= 0 AND color <= 8)
);

COMMENT ON TABLE public.stores IS 'Almacena las tiendas físicas asociadas a las listas de compras del usuario.';
COMMENT ON COLUMN public.stores.color IS 'Índice de color dentro de la paleta definida en el frontend (0-8).';


-- 2. TABLA: products (Catálogo de Productos)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    unit_of_measurement TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Restricción: Valida contra los identificadores permitidos en la interfaz móvil
    CONSTRAINT check_unit_of_measurement CHECK (unit_of_measurement IN ('bag', 'bottle', 'box', 'container', 'kg', 'lata', 'lt', 'pack', 'unit'))
);

COMMENT ON TABLE public.products IS 'Catálogo principal de productos disponibles para agregar a listas de compras.';


-- 3. TABLA: product_prices (Precios de Productos por Tienda)
CREATE TABLE public.product_prices (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    PRIMARY KEY (product_id, store_id),
    -- Restricción: Evita la inserción de precios negativos por consistencia contable
    CONSTRAINT check_positive_price CHECK (value >= 0.00)
);

COMMENT ON TABLE public.product_prices IS 'Tabla pivote que vincula productos con tiendas definiendo precios específicos.';


-- 4. TABLA: shopping_lists (Cabeceras de Listas de Compra)
CREATE TABLE public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.shopping_lists IS 'Cabecera que agrupa artículos bajo un título descriptivo definido por el usuario.';


-- 5. TABLA: shopping_list_items (Ítems Individuales de Listas de Compra)
CREATE TABLE public.shopping_list_items (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    shopping_list_id UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    quantity NUMERIC(10, 3) NOT NULL,
    done BOOLEAN NOT NULL DEFAULT false,
    pinned BOOLEAN NOT NULL DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Restricción: No se pueden agregar productos con cantidades nulas o negativas
    CONSTRAINT check_positive_quantity CHECK (quantity > 0.000)
);

COMMENT ON TABLE public.shopping_list_items IS 'Artículos asignados a listas de compras junto a sus metas de adquisición.';


-- 6. TABLA: settings (Configuraciones Personalizadas)
CREATE TABLE public.settings (
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Clave primaria compuesta para asegurar que la llave sea única por cada usuario
    PRIMARY KEY (user_id, key)
);

COMMENT ON TABLE public.settings IS 'Tabla tipo diccionario clave-valor para almacenar preferencias locales aisladas por usuario.';


-- =============================================================================
-- CREACIÓN DE ÍNDICES OPTIMIZADOS PARA CONSULTAS FRECUENTES
-- =============================================================================
CREATE INDEX idx_products_search_name ON public.products (LOWER(product_name));
CREATE INDEX idx_product_prices_by_store ON public.product_prices (store_id);
CREATE INDEX idx_shopping_items_by_list ON public.shopping_list_items (shopping_list_id);
CREATE INDEX idx_shopping_items_by_product ON public.shopping_list_items (product_id);


-- =============================================================================
-- CONFIGURACIÓN DE POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- RLS garantiza que ningún usuario pueda leer ni alterar información de otros
-- inquilinos dentro de la misma base de datos.
--
-- Diseño de Políticas:
-- - SELECT: Acceso permitido si el registro pertenece al usuario activo (auth.uid())
--           O si el registro es una plantilla global compartida (user_id IS NULL).
-- - INSERT/UPDATE/DELETE: Permitido únicamente si pertenece al propietario (user_id = auth.uid()).

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas para: stores
CREATE POLICY "Select Stores" ON public.stores
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Insert Stores" ON public.stores
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update Stores" ON public.stores
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Delete Stores" ON public.stores
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para: products
CREATE POLICY "Select Products" ON public.products
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Insert Products" ON public.products
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update Products" ON public.products
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Delete Products" ON public.products
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para: product_prices
CREATE POLICY "Select Product Prices" ON public.product_prices
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Insert Product Prices" ON public.product_prices
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update Product Prices" ON public.product_prices
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Delete Product Prices" ON public.product_prices
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para: shopping_lists
CREATE POLICY "Select Shopping Lists" ON public.shopping_lists
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Insert Shopping Lists" ON public.shopping_lists
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update Shopping Lists" ON public.shopping_lists
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Delete Shopping Lists" ON public.shopping_lists
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para: shopping_list_items
CREATE POLICY "Select Shopping List Items" ON public.shopping_list_items
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Insert Shopping List Items" ON public.shopping_list_items
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update Shopping List Items" ON public.shopping_list_items
    FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Delete Shopping List Items" ON public.shopping_list_items
    FOR DELETE USING (user_id = auth.uid());

-- Políticas para: settings (Las configuraciones de la app son privadas, no globales)
CREATE POLICY "Manage User Settings" ON public.settings
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- HABILITACIÓN DE SUPABASE REALTIME (SINCRONIZACIÓN AUTOMÁTICA)
-- =============================================================================
-- Activa la replicación a través de WebSockets de Supabase para reflejar cambios
-- en tiempo real instantáneamente entre dispositivos.
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_list_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_prices;


-- =============================================================================
-- INSERCIÓN DE DATOS DE PRUEBA (MOCKUPS / SEED SINCRO)
-- =============================================================================
-- Los identificadores locales han sido reemplazados por UUIDs de formato válido.
-- Se asigna 'user_id = NULL' para cargarlos como datos globales y legibles para
-- cualquier usuario de forma inicial (ideal para entornos de prueba demo).

-- 1. POBLAR TIENDAS
INSERT INTO public.stores (id, description, color, user_id) VALUES
('d0c7da28-89c5-41ee-9669-7988365dc67e', 'Demo Store', 0, NULL),
('e1b7da28-89c5-41ee-9669-7988365dc67e', 'Test Store', 1, NULL);

-- 2. POBLAR PRODUCTOS
INSERT INTO public.products (id, product_name, unit_of_measurement, user_id) VALUES
('f0000000-0000-0000-0000-000000000001', 'Papa', 'kg', NULL),
('f0000000-0000-0000-0000-000000000002', 'Cebolla', 'kg', NULL),
('f0000000-0000-0000-0000-000000000003', 'Tomate', 'kg', NULL),
('f0000000-0000-0000-0000-000000000004', 'Leche líquida', 'lt', NULL),
('f0000000-0000-0000-0000-000000000005', 'Yogurt Firme', 'unit', NULL),
('f0000000-0000-0000-0000-000000000006', 'Queso Blanco', 'kg', NULL),
('f0000000-0000-0000-0000-000000000007', 'Mantequilla', 'unit', NULL),
('f0000000-0000-0000-0000-000000000008', 'Pechuga de Pollo', 'kg', NULL),
('f0000000-0000-0000-0000-000000000009', 'Carne Molida', 'kg', NULL),
('f0000000-0000-0000-0000-000000000010', 'Filet de Merluza', 'kg', NULL);

-- 3. POBLAR PRECIOS DE PRODUCTOS POR TIENDA
INSERT INTO public.product_prices (product_id, store_id, value, user_id) VALUES
('f0000000-0000-0000-0000-000000000001', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 2.20, NULL),
('f0000000-0000-0000-0000-000000000001', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 3.10, NULL),

('f0000000-0000-0000-0000-000000000002', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 1.80, NULL),
('f0000000-0000-0000-0000-000000000002', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 1.95, NULL),

('f0000000-0000-0000-0000-000000000003', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 2.50, NULL),

('f0000000-0000-0000-0000-000000000004', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 1.50, NULL),
('f0000000-0000-0000-0000-000000000004', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 1.60, NULL),

('f0000000-0000-0000-0000-000000000005', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 0.90, NULL),

('f0000000-0000-0000-0000-000000000006', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 5.80, NULL),
('f0000000-0000-0000-0000-000000000006', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 6.20, NULL),

('f0000000-0000-0000-0000-000000000007', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 2.10, NULL),

('f0000000-0000-0000-0000-000000000008', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 4.50, NULL),
('f0000000-0000-0000-0000-000000000008', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 4.20, NULL),

('f0000000-0000-0000-0000-000000000009', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 6.90, NULL),
('f0000000-0000-0000-0000-000000000009', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 7.10, NULL);

-- 4. POBLAR CABECERAS DE LISTAS DE COMPRAS
INSERT INTO public.shopping_lists (id, title, user_id) VALUES
('a0000000-0000-0000-0000-000000000001', 'Lista Semanal - Verduras', NULL),
('a0000000-0000-0000-0000-000000000002', 'Lácteos y Desayuno', NULL),
('a0000000-0000-0000-0000-000000000003', 'Carnicería', NULL);

-- 5. POBLAR ELEMENTOS DE LISTAS DE COMPRAS
INSERT INTO public.shopping_list_items (shopping_list_id, product_id, store_id, quantity, done, pinned, user_id) VALUES
-- Lista 1 (Lista Semanal - Verduras)
('a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 2.500, false, false, NULL),
('a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 1.500, false, false, NULL),
('a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000003', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 2.000, false, false, NULL),

-- Lista 2 (Lácteos y Desayuno)
('a0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000004', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 4.000, false, false, NULL),
('a0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000005', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 6.000, false, false, NULL),
('a0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000006', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 0.800, false, false, NULL),
('a0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000007', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 2.000, false, false, NULL),

-- Lista 3 (Carnicería)
('a0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000008', 'e1b7da28-89c5-41ee-9669-7988365dc67e', 1.500, false, false, NULL),
('a0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000009', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 1.200, false, false, NULL),
('a0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000010', 'd0c7da28-89c5-41ee-9669-7988365dc67e', 1.000, false, false, NULL);


-- =============================================================================
-- UTILIDAD / NOTA PARA EL DESARROLLADOR: PROPIEDAD TOTAL DE LOS DATOS DEMO
-- =============================================================================
-- Al insertarse con 'user_id = NULL', estos registros actúan como plantillas globales.
-- Esto significa que cualquier usuario autenticado en la app móvil podrá LEER las tiendas,
-- productos y listas provistas, pero de acuerdo a las políticas de RLS anteriores, NO
-- podrá editarlas, marcarlas como listas hechas, borrarlas ni agregarles productos a nivel global.
--
-- Si deseas hacer que todos estos registros sean de tu propiedad exclusiva (para modificarlos,
-- borrarlos, o interactuar completamente con ellos en el simulador o dispositivo móvil):
-- 1. Inicia sesión en tu aplicación con tu usuario final.
-- 2. Obtén el UUID de tu usuario (desde la consola de Supabase Auth o el token JWT).
-- 3. Reemplaza 'TU-UUID-AQUÍ' por dicho identificador y ejecuta el siguiente bloque SQL:
--
-- UPDATE public.stores SET user_id = 'TU-UUID-AQUÍ'::uuid WHERE user_id IS NULL;
-- UPDATE public.products SET user_id = 'TU-UUID-AQUÍ'::uuid WHERE user_id IS NULL;
-- UPDATE public.product_prices SET user_id = 'TU-UUID-AQUÍ'::uuid WHERE user_id IS NULL;
-- UPDATE public.shopping_lists SET user_id = 'TU-UUID-AQUÍ'::uuid WHERE user_id IS NULL;
-- UPDATE public.shopping_list_items SET user_id = 'TU-UUID-AQUÍ'::uuid WHERE user_id IS NULL;
-- =============================================================================
