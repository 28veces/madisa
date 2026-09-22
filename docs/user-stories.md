# Historias de usuario — Arte Madisa

Backlog vivo del proyecto. Cada historia tiene un ID estable (no lo reutilices ni lo renumeres al agregar nuevas — agrega al final del épico correspondiente). Usa el ID para pedir cambios puntuales, ej: "en US-14 agrega validación de teléfono".

Estado: `✅ Implementada` · `🟡 Parcial` · `⬜ Pendiente`

Roles: `SUPER_ADMIN` (gestiona negocios/admins), `ADMIN` (dueño del negocio), `SECRETARY` (operación diaria), `ACCOUNTANT` (solo lectura financiera), `PUBLIC` (visitante sin cuenta).

---

## Épico A — Autenticación y control de acceso

- **US-01** ✅ Como usuario con cuenta, quiero iniciar sesión con email/contraseña para acceder al panel según mi rol.
  `src/lib/auth.ts`, `src/app/login/page.tsx`
- **US-02** ✅ Como sistema, el middleware debe redirigir a `/login` si no hay sesión y a `/admin/super` si soy `SUPER_ADMIN`, evitando que entre al panel normal.
  `src/proxy.ts`
- **US-03** ✅ Como `ADMIN`, quiero que cada acción del servidor valide mi rol y que los datos que veo pertenezcan solo a mi negocio (`businessId`), para que no haya fuga de información entre negocios.
  `src/lib/require-auth.ts` — patrón aplicado en todas las `src/actions/*`
- **US-04** ✅ Como usuario autenticado, quiero cambiar mi nombre y foto de perfil.
  `src/actions/profile.ts`, `src/app/(admin)/admin/perfil/page.tsx`
- **US-05** ⬜ Como `ADMIN`, quiero recuperar mi contraseña si la olvido (hoy solo el `ADMIN` puede resetear la de otros usuarios de su negocio, pero no existe "olvidé mi contraseña" para sí mismo).

## Épico B — Catálogo público (sitio de cara al cliente)

- **US-06** ✅ Como visitante, quiero ver el catálogo de productos activos con stock disponible, filtrado por categoría (platos, vasos, tazas, sweaters, gorras, placas, lápidas, otros).
  `src/actions/products.ts:getPublicProducts`, `src/app/(public)/catalogo`
- **US-07** ✅ Como visitante, quiero ver el detalle de un producto específico.
  `src/actions/products.ts:getPublicProduct`, `src/app/(public)/catalogo/[id]`
- **US-08** ✅ Como visitante, quiero páginas informativas por línea de servicio: sublimación, DTF, vDTF, pintura a mano, arreglos.
  `src/app/(public)/{sublimacion,dtf,vdtf,pintura,arreglos}`
- **US-09** ✅ Como visitante, quiero agregar productos a un carrito (persistente en el navegador) y ajustar cantidades.
  `src/stores/cartStore.ts`, `src/components/public/AddToCartButton.tsx`
- **US-10** ✅ Como visitante, quiero enviar mi pedido desde el carrito indicando nombre y teléfono, y que se valide el stock disponible antes de crearlo.
  `src/actions/public-orders.ts`, `src/app/(public)/carrito`
- **US-11** ✅ Como visitante, quiero un botón de WhatsApp para contactar directamente al negocio.
  `src/components/public/WhatsAppButton.tsx`, `src/lib/whatsapp.ts`
- **US-12** ⬜ Como visitante, quiero recibir confirmación de mi pedido (hoy el pedido se crea en estado `PENDING` pero no hay notificación automática por email/WhatsApp al cliente).

## Épico C — Catálogo (panel admin)

- **US-13** ✅ Como `ADMIN`/`SECRETARY`, quiero crear un producto con nombre, categoría, material, técnica, precio base, foto e inventario vinculado (opcional).
  `src/actions/products.ts:createProduct`, `src/app/(admin)/admin/catalogo/nuevo`
- **US-14** ✅ Como `ADMIN`/`SECRETARY`, quiero editar y desactivar productos existentes.
  `src/actions/products.ts:updateProduct`
- **US-15** ✅ Como `ADMIN`, quiero eliminar productos.
  `src/actions/products.ts:deleteProduct`
- **US-16** ✅ Como `ADMIN`/`SECRETARY`/`ACCOUNTANT`, quiero listar todos los productos de mi negocio con su disponibilidad calculada (comprado − vendido).
  `src/actions/products.ts:getProducts`

## Épico D — Inventario (artículos base)

- **US-17** ✅ Como `ADMIN`/`SECRETARY`, quiero registrar artículos de inventario (código único, descripción, categoría de compra, foto, proveedores asociados).
  `src/actions/inventory-items.ts`
- **US-18** ✅ Como `ADMIN`/`SECRETARY`/`ACCOUNTANT`, quiero ver la disponibilidad de cada artículo (suma de compras − suma de ventas), sin campo de stock manual que se pueda desincronizar.
  `src/actions/inventory-items.ts:getInventoryItemsWithPurchaseQty`
- **US-19** ✅ Como `ADMIN`, quiero eliminar artículos de inventario que ya no se usan.

## Épico E — Ventas

- **US-20** ✅ Como `ADMIN`/`SECRETARY`, quiero registrar una venta manual con uno o más artículos, validando que haya stock suficiente en una transacción atómica (evita sobreventa).
  `src/actions/sales.ts:createSale`
- **US-21** ✅ Como `ADMIN`/`SECRETARY`, quiero actualizar el estado de una venta (pendiente → en proceso → completado/cancelado), marcando fecha de entrega al completarse.
  `src/actions/sales.ts:updateSaleStatus`
- **US-22** ✅ Como `ADMIN`, quiero eliminar una venta.
- **US-23** ✅ Como `ADMIN`/`SECRETARY`/`ACCOUNTANT`, quiero ver el detalle de una venta con ganancia por artículo (precio − costo de producción).
  `src/app/(admin)/admin/ventas/[id]/page.tsx` (usa `getSale`, valida `businessId`)
- **US-24** ⬜ Como `ADMIN`, quiero filtrar/buscar ventas por cliente, rango de fechas o estado en el listado (hoy `getSales` no acepta filtros).

## Épico F — Compras y proveedores

- **US-25** ✅ Como `ADMIN`/`SECRETARY`, quiero registrar compras con proveedor, categoría (sublimable/no sublimable/insumo/otros) y comprobante.
  `src/actions/purchases.ts`
- **US-26** ✅ Como `ADMIN`/`SECRETARY`, quiero editar una compra existente.
- **US-27** ✅ Como `ADMIN`, quiero eliminar una compra.
- **US-28** ✅ Como `ADMIN`/`SECRETARY`, quiero gestionar proveedores (crear, editar, listar, activar/desactivar).
  `src/actions/suppliers.ts`

## Épico G — Egresos e inversiones

- **US-29** ✅ Como `ADMIN`, quiero registrar egresos operativos (con opción de marcarlos recurrentes) fuera del flujo de compras/inventario.
  `src/actions/expenses.ts`
- **US-30** ✅ Como `ADMIN`, quiero registrar inversiones de capital (maquinaria, mejoras de local, equipo) categorizadas.
  `src/actions/investments.ts`
- **US-31** ✅ Como `ADMIN`, quiero repartir el monto de una inversión entre socios según su aporte real (contribuciones individuales).
  `src/actions/investments.ts` (modelo `InvestmentContribution`)
- **US-32** ✅ Como `ADMIN`/`ACCOUNTANT`, quiero ver el resumen de aportes por socio.
  `src/actions/investments.ts:getPartnerInvestmentSummary`

## Épico H — Socios y reparto de ganancias

- **US-33** ✅ Como `ADMIN`, quiero definir socios con un porcentaje de participación y orden de despliegue.
  `src/actions/partners.ts`
- **US-34** ✅ Como `ADMIN`, quiero ver la ganancia neta mensual (ventas brutas − costo de producción) distribuida automáticamente según el porcentaje de cada socio, con lo no asignado calculado aparte.
  `src/actions/ganancias.ts:getGananciasByYear`
- **US-35** ✅ Como `ADMIN`/`SECRETARY`/`ACCOUNTANT`, quiero seleccionar el año a consultar, limitado a años con ventas reales registradas.
  `src/actions/ganancias.ts:getAvailableYears`

## Épico I — Dashboard

- **US-36** ✅ Como `ADMIN`/`SECRETARY`/`ACCOUNTANT`, quiero ver un resumen del mes (ventas, gastos, margen), ventas recientes, productos con poco stock y gráficas de tendencia anual, todo aislado a mi negocio.
  `src/app/(admin)/admin/page.tsx`
- **US-37** ⬜ Como `ADMIN`, quiero que "productos con stock bajo" use un umbral real (hoy solo lista 5 productos activos, no calcula si el stock está realmente bajo).

## Épico J — Usuarios del negocio

- **US-38** ✅ Como `ADMIN`, quiero crear usuarios (secretaria/contador) para mi negocio con rol asignado.
  `src/actions/users.ts:createBusinessUser`
- **US-39** ✅ Como `ADMIN`, quiero resetear la contraseña de un usuario de mi negocio.
  `src/actions/users.ts:resetUserPassword`
- **US-40** ✅ Como `ADMIN`, quiero desactivar usuarios sin eliminarlos.
  `src/actions/users.ts:deactivateUser`

## Épico K — Super administración (multi-negocio)

- **US-41** ✅ Como `SUPER_ADMIN`, quiero crear negocios (con slug único generado del nombre).
  `src/actions/super-admin.ts:createBusiness`
- **US-42** ✅ Como `SUPER_ADMIN`, quiero activar/desactivar un negocio.
  `src/actions/super-admin.ts:toggleBusinessActive`
- **US-43** ✅ Como `SUPER_ADMIN`, quiero crear el usuario `ADMIN` inicial de un negocio nuevo.
  `src/actions/super-admin.ts:createAdminUser`
- **US-44** ✅ Como `SUPER_ADMIN`, quiero ver la lista de negocios y administradores del sistema.
- **US-45** 🟡 El sitio público y los pedidos públicos asumen un único "negocio activo" (el más antiguo activo). Si hay más de un negocio activo simultáneamente, el catálogo público solo muestra el primero — pendiente decidir si el público debe elegir negocio o si el modelo debe ser "un solo negocio público a la vez" por diseño.
  `src/lib/require-auth.ts:getActiveBusinessId`

## Épico L — Infraestructura / técnico (no funcional, pero visible para el negocio)

- **US-46** ✅ Migrar de SQLite (dev) a PostgreSQL en producción (Neon) — el schema tiene el provider de SQLite hardcodeado. _(Hecho 2026-09-21: schema en PostgreSQL con migración `init_postgres`; `saveUploadedImage` usa Vercel Blob si existe `BLOB_READ_WRITE_TOKEN`, disco local si no.)_
  `prisma/schema.prisma`
- **US-47** ✅ Limpiar archivos de desarrollo sueltos en la raíz del repo (`dev.log`, `test_login_*.sh`, `2024 madisa.xlsx`, `query-users.ts`, `verify-login.ts`) antes de un despliegue serio. _(Hecho 2026-09-21: eliminados del repo con git rm.)_
- **US-48** ✅ Reemplazar `saveUploadedImage` (escribe a `public/uploads/` en disco local) por almacenamiento externo (S3/Cloudinary/Vercel Blob) antes de desplegar en un entorno serverless con filesystem efímero. _(Hecho 2026-09-21: schema en PostgreSQL con migración `init_postgres`; `saveUploadedImage` usa Vercel Blob si existe `BLOB_READ_WRITE_TOKEN`, disco local si no.)_
  `src/lib/upload.ts`

---

### Cómo agregar historias nuevas
Dime la idea en lenguaje natural ("quiero que al completar una venta se descuente X") y yo la convierto en una historia con ID correlativo dentro del épico correspondiente, o la agrego a un épico nuevo si no encaja. Si me das un ID existente, interpreto que es una modificación/extensión de esa historia, no una nueva.
