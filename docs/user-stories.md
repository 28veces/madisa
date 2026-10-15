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
  - Criterio (2026-09-22): el artículo de inventario se elige con un buscador por código o descripción (como en ventas); el campo muestra el artículo elegido, su stock y su costo promedio, y se puede quitar el vínculo.
  - Bug corregido: los productos del seed usan su nombre como id y la página de edición daba 404 porque el id llegaba codificado en la URL.
- **US-15** ✅ Como `ADMIN`, quiero eliminar productos.
  `src/actions/products.ts:deleteProduct`
- **US-16** ✅ Como `ADMIN`/`SECRETARY`/`ACCOUNTANT`, quiero listar todos los productos de mi negocio con su disponibilidad calculada (comprado − vendido).
  `src/actions/products.ts:getProducts`

## Épico D — Inventario (artículos base)

- **US-17** ✅ Como `ADMIN`/`SECRETARY`, quiero registrar artículos de inventario (código único, descripción, categoría de compra, foto, proveedores asociados).
  `src/actions/inventory-items.ts`
- **US-18** ✅ Como `ADMIN`/`SECRETARY`/`ACCOUNTANT`, quiero ver la disponibilidad de cada artículo (suma de compras − suma de ventas), sin campo de stock manual que se pueda desincronizar.
  `src/actions/inventory-items.ts:getInventoryItemsWithPurchaseQty`
  - Criterio (2026-09-22): Inventario muestra también el costo promedio ponderado por unidad (Σ cantidad × costo unitario / Σ cantidad de sus compras), el mismo que se usa como costo sugerido en las ventas.
- **US-19** ✅ Como `ADMIN`, quiero eliminar artículos de inventario que ya no se usan.
- **US-49** 🟡 Como `ADMIN`/`SECRETARY`, quiero registrar salidas de inventario que no son ventas (consumo de insumos en producción, mermas/daños, ajustes por conteo físico) para que el stock refleje lo que realmente queda.
  `src/actions/inventory-adjustments.ts`, `src/lib/stock.ts`, `src/app/(admin)/admin/salidas/`
  - Criterio: aplica a cualquier artículo, no solo insumos. Se registra artículo, cantidad (entera, en la unidad de compra: paquete, botella…), fecha, motivo y nota opcional.
  - Criterio: la disponibilidad pasa a ser compras − ventas − salidas en todo el sistema (Inventario, catálogo admin y público, ventas, pedidos públicos). No se puede sacar más de lo disponible.
  - Criterio: la salida no cuenta como egreso (el costo ya se registró en la compra). En Ganancias solo restan las mermas y ajustes de conteo; el consumo de insumos va estimado en el costo de producción de cada venta (US-34).
  - Criterio: `ADMIN` puede eliminar una salida (el stock se repone); `ACCOUNTANT` solo la ve.
  - Criterio (2026-10-14): `ADMIN`/`SECRETARY` pueden editar una salida (artículo, cantidad, fecha, motivo, nota) sin borrarla y volver a crearla.
  - Criterio (2026-10-14): al editar, la validación de stock considera la cantidad original de la salida (dentro de una transacción); si la nueva cantidad supera lo disponible, no se guarda y se muestra el disponible.
  - Futuro: descuento automático de insumos por receta de producto al vender (requiere recetas y cantidades fraccionarias).

## Épico E — Ventas

- **US-20** ✅ Como `ADMIN`/`SECRETARY`, quiero registrar una venta manual con uno o más artículos, validando que haya stock suficiente en una transacción atómica (evita sobreventa).
  `src/actions/sales.ts:createSale`
- **US-21** ✅ Como `ADMIN`/`SECRETARY`, quiero actualizar el estado de una venta (pendiente → en proceso → completado/cancelado), marcando fecha de entrega al completarse.
  `src/actions/sales.ts:updateSaleStatus`
- **US-22** ✅ Como `ADMIN`, quiero eliminar una venta.
- **US-23** ✅ Como `ADMIN`/`SECRETARY`/`ACCOUNTANT`, quiero ver el detalle de una venta con ganancia por artículo (precio − costo de producción).
  `src/app/(admin)/admin/ventas/[id]/page.tsx` (usa `getSale`, valida `businessId`)
  - Criterio (2026-09-22): `ADMIN`/`SECRETARY` pueden ajustar el costo de producción de cada línea desde el detalle, con la ganancia recalculada al momento (`updateSaleItemCosts`). Necesario para pedidos del catálogo público, que llegan con el costo promedio sugerido, y para personalizaciones con costo extra. `ACCOUNTANT` solo lo ve.
- **US-24** ⬜ Como `ADMIN`, quiero filtrar/buscar ventas por cliente, rango de fechas o estado en el listado (hoy `getSales` no acepta filtros).

## Épico F — Compras y proveedores

- **US-25** ✅ Como `ADMIN`/`SECRETARY`, quiero registrar compras con proveedor, categoría (sublimable/no sublimable/insumo/otros) y comprobante.
  `src/actions/purchases.ts:createPurchase`, `src/actions/purchases.ts:isValidSupplier`, `src/components/admin/PurchaseForm.tsx`, `src/app/(admin)/admin/compras/ComprasContent.tsx`
  - Criterio: al registrar o editar una compra, el stock del artículo (US-18) aumenta de inmediato en Inventario, catálogo admin y catálogo público.
  - Criterio: cada línea debe quedar vinculada al artículo que se ve en pantalla; si el usuario edita el texto después de elegir un artículo, el vínculo se pierde y debe volver a elegirlo de la lista. El servidor valida que el artículo pertenezca al negocio y guarda la descripción real del artículo.
  - Bug corregido (2026-09-22): el formulario conservaba el artículo elegido al reescribir el texto, así que la compra sumaba stock a otro artículo y en Inventario "no cambiaba el stock".
  - Criterio (2026-10-14): el listado de Compras muestra qué se compró (artículos con cantidad, o el primero y "+N más"), no el texto fijo "Compra de materiales". Aplica también a las compras ya registradas, que tienen ese texto guardado.
  - Criterio (2026-10-14): el formulario tiene un campo para elegir el proveedor de la lista de proveedores activos del negocio; es opcional y se guarda en la compra (hoy se envía siempre vacío).
  - Criterio (2026-10-14): al elegir el primer artículo, si tiene proveedores asociados y aún no se eligió proveedor, se sugiere el primero; el usuario puede cambiarlo o quitarlo. Al editar una compra se muestra el proveedor guardado.
  - Criterio (2026-10-14): el servidor rechaza un proveedor que no pertenezca al negocio de la sesión.
  - Criterio (2026-10-14): la descripción de la compra la arma el servidor con los artículos (ej. "Plato ×4, Taza ×2"); la lista muestra hasta 3 artículos con su cantidad y "+N más". La sugerencia de proveedor se hace una sola vez: si el usuario lo cambia o lo quita, no se vuelve a llenar.
  - Bug corregido (2026-10-14): toda compra se guardaba como "Compra de materiales" y sin proveedor, porque el formulario mandaba ese texto fijo y el proveedor siempre vacío.
- **US-26** ✅ Como `ADMIN`/`SECRETARY`, quiero editar una compra existente.
- **US-27** ✅ Como `ADMIN`, quiero eliminar una compra.
  `src/actions/purchases.ts:deletePurchase`, `src/app/(admin)/admin/compras/DeletePurchaseButton.tsx`
  - Criterio (2026-10-14): el listado o la pantalla de edición tiene un botón "Eliminar" visible solo para `ADMIN` (la action `deletePurchase` existe pero no hay botón en la interfaz).
  - Criterio (2026-10-14): pide confirmación antes de borrar y, al eliminar, el stock de los artículos baja en Inventario y catálogo.
  - Criterio (2026-10-14): si eliminarla deja stock negativo (lo comprado ya se vendió o se sacó), no se elimina y se muestra un mensaje claro.
  - Bug corregido (2026-10-14): la action `deletePurchase` existía pero no había botón; además borraba sin revisar el stock. Ahora borra y revisa dentro de una transacción, que se revierte si algún artículo quedaría en negativo.
- **US-28** ✅ Como `ADMIN`/`SECRETARY`, quiero gestionar proveedores (crear, editar, listar, activar/desactivar).
  `src/actions/suppliers.ts`

## Épico G — Egresos e inversiones

- **US-29** 🟡 Como `ADMIN`, quiero registrar egresos operativos (con opción de marcarlos recurrentes) fuera del flujo de compras/inventario.
  `src/actions/expenses.ts`
  - Criterio (2026-10-14): un egreso fijo se define con descripción, categoría, monto estimado, frecuencia (mensual, cada 3 meses, cada 6 meses, anual) y fecha del próximo pago. Ej.: fumigación cada 3 meses, permiso anual de propaganda.
  - Criterio (2026-10-14): cuando llega la fecha, la app avisa en Egresos (y en el dashboard) que el egreso está pendiente; no lo registra sola.
  - Criterio (2026-10-14): al confirmar el pago se crea el egreso con el monto (editable) y la fecha reales, y la fecha del próximo pago avanza según la frecuencia. También se puede omitir esa vez, sin crear egreso.
  - Criterio (2026-10-14): un egreso fijo se puede editar y desactivar. Los egresos ya marcados como "Recurrente" siguen viéndose igual (la migración no borra datos).
- **US-30** ✅ Como `ADMIN`, quiero registrar inversiones de capital (maquinaria, mejoras de local, equipo) categorizadas.
  `src/actions/investments.ts`
- **US-31** ✅ Como `ADMIN`, quiero repartir el monto de una inversión entre socios según su aporte real (contribuciones individuales).
  `src/actions/investments.ts` (modelo `InvestmentContribution`)
- **US-32** ✅ Como `ADMIN`/`ACCOUNTANT`, quiero ver el resumen de aportes por socio.
  `src/actions/investments.ts:getPartnerInvestmentSummary`

## Épico H — Socios y reparto de ganancias

- **US-33** ✅ Como `ADMIN`, quiero definir socios con un porcentaje de participación y orden de despliegue.
  `src/actions/partners.ts`
- **US-34** ✅ Como `ADMIN`, quiero ver la utilidad neta mensual distribuida automáticamente según el porcentaje de cada socio, con lo no asignado calculado aparte.
  `src/actions/ganancias.ts:getGananciasByYear`
  - Criterio (2026-09-22): utilidad neta = ventas brutas − valor de compra − costo de producción − mermas (salidas de US-49 por merma o ajuste de conteo × costo promedio) − egresos operativos del mes. Las inversiones de capital no se restan (son aportes por socio, US-31).
  - Criterio: cada línea de venta tiene dos costos: **valor de compra** (cantidad × costo promedio del artículo, sugerido y editable; columna `productionCost`) y **costo de producción** (estimado manual de tinta, luz, papel, tape…; columna `extraCost`). Como el consumo de insumos ya va en ese estimado, las salidas por consumo bajan stock pero no se restan otra vez en Ganancias.
  - Criterio: el costo de producción de cada línea de venta se llena solo con cantidad × costo promedio ponderado de compra del artículo; es editable y queda fijo en la venta. En pedidos públicos se calcula en el servidor.
  - Bug corregido: el costo se escribía a mano y por defecto era 0, así que se repartía la venta completa entre los socios. Las ventas viejas con costo 0 se recalculan con `npm run db:recalc-costs` (prueba) y `-- --apply` (guardar).
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
- **US-50** ⬜ Como equipo, queremos que `npm run lint` termine sin errores para poder exigirlo en la definición de terminado.
  - Criterio: `npm run lint` termina sin errores (hoy hay 9, casi todos `no-explicit-any` en `src/lib/auth.ts`, `src/components/admin/UserManagementForm.tsx` y otros).
  - Criterio: los `any` se reemplazan por tipos reales; no se desactiva la regla ni se agregan `eslint-disable`.
  - Criterio: al cerrarla, se quita de `AGENTS.md` la excepción "no agregar errores nuevos" y el lint pasa a ser obligatorio.
- **US-51** ⬜ Como integrante nuevo del equipo, quiero que `README.md`, `SETUP.md` y `.env.example` describan el arranque real (PostgreSQL con Docker y migraciones) para levantar el proyecto sin ayuda.
  - Criterio: `README.md` y `SETUP.md` dejan de mencionar SQLite, `dev.db` y `db:push` como flujo principal, y explican `docker compose up -d` + `npm run db:migrate` + `npm run db:seed`.
  - Criterio: `.env.example` queda versionado (hoy lo excluye el patrón `.env*` de `.gitignore`), con valores de ejemplo falsos.
  - Criterio: las credenciales de los usuarios del seed figuran como "solo para desarrollo".

## Épico M — Seguridad

- **US-52** ⬜ Como dueño del negocio, quiero que los pedidos del sitio público usen los precios del catálogo y no los que envía el navegador, para que nadie pueda crear un pedido con precios alterados.
  - Criterio: `createPublicOrder` ignora `unitPrice` y `totalAmount` del cliente: toma el precio de cada producto de la base y calcula el total en el servidor.
  - Criterio: un pedido enviado con precios modificados queda guardado con los precios reales del catálogo.
  - Criterio: el carrito sigue mostrando el mismo total que se guarda.
  `src/actions/public-orders.ts:createPublicOrder`
- **US-53** ⬜ Como sistema, `createPublicOrder` debe validar su entrada con Zod y resolver el negocio con `getActiveBusinessId()`, como exigen las reglas duras.
  - Criterio: se rechazan cantidades menores o iguales a cero, no enteras o excesivas, listas de ítems vacías, `businessLine` fuera del enum, y nombre o teléfono vacíos o demasiado largos, con un mensaje claro.
  - Criterio: el negocio activo se obtiene con `getActiveBusinessId()`; se elimina la query propia.
  - Criterio: el mensaje de error que ve el visitante no expone detalles internos (ids, errores de Prisma).
  `src/actions/public-orders.ts:createPublicOrder`

## Épico N — Usabilidad del panel

- **US-54** ✅ Como `ADMIN`/`SECRETARY`/`ACCOUNTANT`, quiero que el menú lateral tenga scroll para llegar a todas las opciones aunque no quepan en la pantalla.
  `src/components/admin/Sidebar.tsx`
  - Criterio: con una ventana baja (ej. 600 px de alto) se puede bajar hasta "Catálogo público", "Ver sitio" y "Cerrar sesión".
  - Criterio: solo se desplaza el menú; el contenido de la página no se mueve con él.
  - Criterio: funciona en computadora y en celular.
  - Criterio (2026-10-14): verificado en 1280×600 y en emulación de celular 390×600; "Ver sitio" y "Cerrar sesión" quedan fijos abajo y siempre visibles. Falta confirmarlo en un celular real.
- **US-55** ✅ Como `ADMIN`/`SECRETARY`, quiero poder borrar el valor de un campo numérico (el 0 o el 1 que trae por defecto) y escribir otro, para cargar costos, precios y cantidades sin pelear con el campo.
  `src/lib/utils.ts:parseNumberField`, `src/components/admin/PurchaseForm.tsx`, `src/components/admin/SaleForm.tsx`, `src/app/(admin)/admin/ventas/[id]/SaleItemsEditor.tsx`, `src/components/admin/InvestmentForm.tsx`, `src/components/admin/AdjustmentForm.tsx`, `src/components/admin/ExpenseForm.tsx`, `src/components/public/ProductCard.tsx`
  - Criterio: en todos los campos numéricos del panel y del carrito se puede dejar el campo vacío mientras se escribe (Compras, Ventas, detalle de venta, Inversiones, Salidas, Productos, Egresos, Socios, Configuración y carrito público). Hoy el código vuelve a poner 0 o 1 al borrar.
  - Criterio: al guardar, un campo obligatorio vacío o inválido muestra un mensaje en vez de guardarse como 0; las cantidades siguen exigiendo mínimo 1.
  - Criterio: los totales en pantalla tratan el campo vacío como 0 mientras se escribe, sin mostrar `NaN`.
  - Criterio (2026-10-14): el costo unitario de una línea de compra y los montos de Egresos e Inversiones empiezan vacíos en vez de 0. El valor de compra y el costo de producción de una venta son opcionales: vacíos se guardan como 0. En el carrito público, la cantidad vacía vuelve a 1 al salir del campo. Socios y Configuración ya permitían vaciar el campo.
  - Bug corregido: en Productos los mensajes de validación por campo ("Nombre requerido", "Escribe un precio válido"…) nunca se mostraban, solo el aviso genérico.

---

### Cómo agregar historias nuevas

Con Claude Code: `/metodo28veces:nueva-historia <idea en lenguaje natural>` (ej. "quiero que al completar una venta se descuente X"). La historia se agrega al final de su épico con el siguiente ID libre de todo el backlog; si no encaja en ningún épico, se crea uno nuevo. Si das un ID existente, se interpreta como ampliación de esa historia y se agrega un criterio con fecha. Para implementarla: `/metodo28veces:implementar-historia US-NN`.
