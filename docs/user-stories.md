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
- **US-64** ✅ Como `ADMIN`, quiero marcar un producto como "disponible bajo pedido" para que los clientes del sitio público puedan pedir más unidades de las que hay en inventario, ya que puedo conseguir las extras con mis proveedores (pedido del cliente, 2026-10-16).
  - Criterio: el formulario de producto tiene la casilla "Se puede pedir bajo pedido", apagada por defecto; los productos que no la tienen siguen limitados al stock, como hoy.
  - Criterio: en un producto bajo pedido, el carrito y `createPublicOrder` aceptan cantidades mayores al stock (con el tope de 100 por artículo de US-53), y el producto aparece en el catálogo público aunque su stock sea 0.
  - Criterio: cuando la cantidad supera lo disponible, el carrito muestra un aviso como "Hay 3 disponibles; las otras 7 se consiguen bajo pedido y pueden tardar más", y el pedido se crea igual.
  - Criterio: en el panel, la venta indica qué líneas quedaron bajo pedido y cuántas unidades faltan, y en Inventario el artículo se ve con stock negativo marcado como "faltan N" hasta que se registre la compra.
  - Criterio: un producto sin la casilla sigue rechazando un pedido que supera el stock con "Stock insuficiente", y las ventas manuales del panel (US-20) siguen exigiendo stock.
  - Criterio (2026-10-16): solo el `ADMIN` ve y cambia la casilla; si el campo no llega o lo envía otro rol, el servidor conserva el valor actual. Si dos productos comparten artículo, lo disponible se asigna primero a los que no son bajo pedido.
  - Criterio (2026-10-16): la venta guarda en `SaleItem.backorderQuantity` cuántas unidades se pidieron sin stock; es un dato histórico, por eso el panel dice "Pedido sin stock: 7 de 10 unidades bajo pedido" (no "faltan"). Inventario sí refleja lo que falta hoy ("faltan N").
  - Criterio (2026-10-16): con el artículo en negativo no se puede eliminar una compra de ese artículo (regla de US-27, aceptado) ni registrar salidas nuevas; una salida existente sí se puede editar mientras no saque más unidades que antes.
  - Verificado con Playwright contra una base temporal: casilla del ADMIN; la SECRETARY no la ve y una inyección del campo no la cambia (control: como ADMIN sí); catálogo con producto bajo pedido de stock 0; carrito con 10 de stock 3 muestra el aviso; pedido creado con 7 bajo pedido; producto sin casilla rechaza 5 con stock 2; venta, listado e inventario marcados; edición de salida con el artículo en −7.
  - Migración `20261016000000_product_backorder`: solo agrega dos columnas con valor por defecto.
  `src/actions/public-orders.ts:createPublicOrder`, `src/actions/products.ts:backorderValue`, `src/components/admin/ProductForm.tsx`, `src/components/public/ProductCard.tsx`, `src/app/(public)/carrito/page.tsx`, `src/actions/inventory-adjustments.ts:updateAdjustment`
- **US-65** ✅ Como visitante, quiero un sitio público con apariencia moderna de tienda en línea (inspirada en el diseño "Shopcart" de Dribbble: https://dribbble.com/shots/19614098-Shopcart-Ecommerce-Web-Design-for-Electronics-Stores), con buscador, banner principal y categorías visuales, para encontrar y elegir productos más fácil y que la marca se vea juvenil y expresiva.
  - Criterio: todo el sitio público (navbar, footer, inicio, catálogo, detalle, carrito y páginas de servicio) usa la paleta lavanda `#F7F4FF` (fondo), violeta `#805AD5` (principal), coral `#FF8066` (acciones/ofertas), amarillo `#FFD166` (destacados) e índigo `#28243D` (texto y fondos oscuros), con tarjetas de producto redondeadas al estilo Shopcart (imagen sobre fondo claro, nombre, precio y botón "Agregar al carrito"). El panel admin no cambia.
  - Criterio: la cabecera tiene un buscador que filtra el catálogo por nombre de producto (parcial, sin distinguir mayúsculas ni tildes), combinable con el filtro de categoría; si no hay coincidencias se muestra "No encontramos productos para «<texto>»" con un enlace para ver todo el catálogo, no una grilla vacía.
  - Criterio: el inicio muestra un banner principal con texto promocional y un botón "Ver catálogo", y una sección "Compra por categoría" con una tarjeta con imagen por cada categoría; la imagen sale de un producto activo de esa categoría y, si no tiene ninguno con foto, se muestra un ícono por defecto (sin imagen rota).
  - Criterio: el sitio se ve bien en celular (360 px) sin scroll horizontal; en celular el buscador y el menú siguen accesibles, y los textos sobre violeta, coral e índigo cumplen contraste legible (AA).
  - Criterio: no cambia el comportamiento existente: filtros por categoría, carrito, avisos de bajo pedido (US-64), envío de pedido y botón de WhatsApp siguen funcionando igual.
  - Criterio (2026-10-15): la imagen de cada categoría sale de los productos que el catálogo público muestra (activos y con stock o bajo pedido), para no anunciar una categoría con un producto que no se puede pedir. Si la foto no carga (archivo borrado), se muestra el ícono de la categoría en vez de una imagen rota; lo mismo en tarjetas de producto y detalle.
  - Criterio (2026-10-15): si la categoría de la URL no es válida o la búsqueda pasa de 100 caracteres, el catálogo no falla: muestra el mensaje de sin resultados.
  - Bug corregido: el contador del carrito en la cabecera provocaba un error de hidratación de React cuando había artículos guardados (el servidor no conoce el localStorage); ahora se muestra solo en el navegador.
  - Bug corregido: la fuente del tema (`--font-sans: var(--font-sans)`) se refería a sí misma y el sitio caía en la letra serif del navegador; el sitio público usa Geist explícitamente (el panel admin sigue con la serif; queda como candidata a historia nueva).
  - Bug corregido: el filtro de categorías del catálogo no tenía "Gorras" y las etiquetas no tenían Gorras, DTF ni VDTF.
  - Verificado con Playwright contra una base temporal (22 comprobaciones): banner y 8 tarjetas de categoría (con foto, sin foto y con foto rota); "TAZA MAGICA" encuentra "Taza mágica…"; búsqueda conserva la categoría; chip Platos + "sweater" muestra "No encontramos productos para «sweater»" y "Ver todo el catálogo" vuelve al listado completo; categoría inválida y texto de 300 caracteres no fallan; carrito con aviso de bajo pedido, error "sin nombre" y pedido creado; detalle; 360 px sin scroll horizontal en inicio, catálogo, sin resultados, carrito, detalle y sublimación; buscador y menú en celular; sin errores de JS ni de hidratación. Contrastes calculados: blanco sobre violeta 4.84, índigo sobre coral 6.05, textos secundarios ≥ 4.6.
  `src/actions/products.ts:getPublicProducts`, `src/components/public/SearchBar.tsx`, `src/components/public/Navbar.tsx`, `src/components/public/ProductCard.tsx`, `src/components/public/CoverImage.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/catalogo/page.tsx`, `src/app/globals.css`
- **US-68** 🟡 Como dueña del negocio, quiero que el sitio público use la paleta de la marca Arte Madisa (fucsia, rosa pastel, dorado, turquesa y negro ciruela) y se parezca al diseño de referencia aprobado, para que la tienda combine con el logo y el resto de la marca.
  - Criterio: todo el sitio público usa fucsia `#F20B83`, rosa pastel `#FFF0F7` (fondo), dorado `#E9A51A` (destacados y anillos), fucsia profundo `#C90062` (botones y textos de acción), turquesa `#00C6D7` (acentos), negro ciruela `#21121B` (texto y pie) y blanco. Reemplaza la paleta de US-65. El panel admin no cambia, salvo que `ink` pasa a negro ciruela.
  - Criterio: como en el diseño de referencia: barra superior fucsia, logo de la mariposa con "Arte Madisa" en letra manuscrita, enlace activo en pastilla fucsia, banner claro rosado con "Arte Madisa — Transformando tus ideas en arte" y botón "Ver productos", categorías en círculos con anillo dorado, títulos de sección en cinta fucsia ("Compra por categoría", "Productos destacados") y franja fucsia de beneficios sobre el pie.
  - Criterio: el texto blanco pequeño va sobre fucsia profundo (5.7:1); el fucsia puro (4.1:1) solo en títulos grandes y decoración, para mantener el contraste AA de US-65. A 360 px no hay scroll horizontal.
  - Criterio: no cambia el comportamiento: buscador, filtros, carrito, bajo pedido y WhatsApp siguen igual.
  `src/app/globals.css`, `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/catalogo/page.tsx`, `src/components/public/Navbar.tsx`, `src/components/public/Footer.tsx`, `src/components/public/ProductCard.tsx`, `public/images/logo.png`
- **US-72** ⬜ Como visitante, quiero ver los productos de cada técnica en `/sublimacion`, `/dtf`, `/vdtf`, `/pintura` y `/arreglos`, para elegir según cómo quiero personalizar. Hoy esas páginas usan `getProducts`, que exige sesión, y un visitante siempre las ve vacías.
  - Criterio: las cinco páginas obtienen los productos con la lectura pública (`getPublicProducts` con un filtro de técnica validado con Zod). Muestran solo productos activos del negocio del sitio, con stock o bajo pedido, igual que el catálogo.
  - Criterio: cada página filtra por su técnica: Sublimación → `SUBLIMACION`, DTF → `DTF`, VDTF → `VDTF`, Pintura → `PINTADO_A_MANO`, Arreglos → `GRABADO` y `BORDADO`.
  - Criterio: las tarjetas reciben stock, bajo pedido y tope igual que en el catálogo, así que limitan la cantidad y avisan igual (US-64, US-67).
  - Criterio: si una técnica no tiene productos se muestra el mensaje actual ("No hay artículos … disponibles"), y si falla la consulta la página no se rompe.

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
- **US-49** ✅ Como `ADMIN`/`SECRETARY`, quiero registrar salidas de inventario que no son ventas (consumo de insumos en producción, mermas/daños, ajustes por conteo físico) para que el stock refleje lo que realmente queda.
  `src/actions/inventory-adjustments.ts`, `src/actions/inventory-adjustments.ts:updateAdjustment`, `src/lib/stock.ts`, `src/app/(admin)/admin/salidas/`, `src/app/(admin)/admin/salidas/[id]/page.tsx`, `src/components/admin/AdjustmentForm.tsx`
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
- **US-69** ✅ Como `ADMIN`/`SECRETARY`, quiero que al cancelar una venta sus unidades vuelvan al inventario, para que un pedido cancelado (incluido uno falso del sitio público) no deje el stock bajo o en negativo. Hoy `src/lib/stock.ts` resta todas las ventas sin mirar su estado, y solo borrarlas devuelve el stock.
  - Criterio: el stock disponible (`availableStock`, `getAvailableStock`) no cuenta los artículos de ventas `CANCELLED`, en el panel, en el catálogo público ni en las validaciones de venta y pedido.
  - Criterio: al pasar una venta a `CANCELLED`, Inventario muestra las unidades de nuevo disponibles. Un producto bajo pedido cuyo faltante venía de esa venta deja de figurar con "faltan N".
  - Criterio: reabrir una venta cancelada (pasarla a otro estado) vuelve a exigir stock dentro de una `$transaction`. Si ya no alcanza, se rechaza con "Stock insuficiente" (los productos bajo pedido siguen las reglas de US-64 y US-67).
  - Criterio: se revisa si el dashboard, el reparto de ganancias y el costo promedio cuentan ventas canceladas, y el resultado queda anotado. Si las cuentan y no deben, se corrige aquí o se abre otra historia.
  - Criterio (2026-10-15): al reabrir una venta cancelada se exige stock solo para las unidades que salieron del inventario (`quantity − backorderQuantity`). Las que se registraron bajo pedido siguen bajo pedido. Si el stock bajó desde el pedido original, la reapertura se rechaza, no se convierte la diferencia en bajo pedido.
  - Criterio (2026-10-15): revisión hecha. El dashboard (`src/app/(admin)/admin/page.tsx`) y el reparto de ganancias (`src/actions/ganancias.ts`) ya excluían las ventas `CANCELLED`, y el costo promedio solo usa compras, así que no cambian. Todos los cálculos de stock pasan por `src/lib/stock.ts`: inventario, catálogo, venta manual, pedido público, salidas y borrado de compras.
  - Bug corregido: `updateSaleStatus` no validaba el estado con Zod y el selector mostraba "Estado actualizado" aunque la acción fallara.
  - Verificado con Playwright contra una base temporal (14 comprobaciones): un pedido de todo el stock lo deja en 0; al cancelarlo, el stock vuelve en la base, en Inventario y en el catálogo público; reabrir sin stock se rechaza con "Stock insuficiente para reabrir la venta…" y la venta sigue cancelada; con stock, reabrir funciona; en un pedido bajo pedido de 4, cancelar devuelve el faltante (−81 → −77) y reabrirlo no exige stock; un estado inventado enviado a mano devuelve "Estado inválido"; la SECRETARY también puede cancelar. Regresión: US-67 18/18 y US-65 22/22.
  `src/lib/stock.ts:activeSaleItems`, `src/actions/sales.ts:updateSaleStatus`, `src/app/(admin)/admin/ventas/UpdateSaleStatusButton.tsx`

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

- **US-29** ✅ Como `ADMIN`, quiero registrar egresos operativos (con opción de marcarlos recurrentes) fuera del flujo de compras/inventario.
  `src/actions/expenses.ts`, `src/actions/recurring-expenses.ts:confirmRecurringPayment`, `src/lib/recurrence.ts:advanceDueDate`, `src/app/(admin)/admin/egresos/RecurringExpensesSection.tsx`, `src/components/admin/RecurringExpenseForm.tsx`
  - Criterio (2026-10-14): un egreso fijo se define con descripción, categoría, monto estimado, frecuencia (mensual, cada 3 meses, cada 6 meses, anual) y fecha del próximo pago. Ej.: fumigación cada 3 meses, permiso anual de propaganda.
  - Criterio (2026-10-14): cuando llega la fecha, la app avisa en Egresos (y en el dashboard) que el egreso está pendiente; no lo registra sola.
  - Criterio (2026-10-14): al confirmar el pago se crea el egreso con el monto (editable) y la fecha reales, y la fecha del próximo pago avanza según la frecuencia. También se puede omitir esa vez, sin crear egreso.
  - Criterio (2026-10-14): un egreso fijo se puede editar y desactivar. Los egresos ya marcados como "Recurrente" siguen viéndose igual (la migración no borra datos).
  - Criterio (2026-10-14): solo `ADMIN` crea, edita, confirma y omite; `ACCOUNTANT` los ve. "Hoy" se calcula en hora de Panamá. Si el día no existe en el mes siguiente (31 → febrero), se usa el último día del mes, y desde ahí sigue ese día (31 ene → 28 feb → 28 mar). Confirmar u omitir solo vale para el periodo que se ve en pantalla: un segundo envío (otra pestaña) se rechaza en vez de duplicar el pago o adelantar un periodo. El pago confirmado es un egreso normal, así que cuenta en Ganancias y el Dashboard.
  - Migración `recurring_expenses`: solo agrega (enum, tabla `RecurringExpense` y columna opcional `Expense.recurringExpenseId`); no modifica datos existentes.
- **US-30** ✅ Como `ADMIN`, quiero registrar inversiones de capital (maquinaria, mejoras de local, equipo) categorizadas.
  `src/actions/investments.ts`
- **US-31** ✅ Como `ADMIN`, quiero repartir el monto de una inversión entre socios según su aporte real (contribuciones individuales).
  `src/actions/investments.ts` (modelo `InvestmentContribution`)
- **US-32** ✅ Como `ADMIN`/`ACCOUNTANT`, quiero ver el resumen de aportes por socio.
  `src/actions/investments.ts:getPartnerInvestmentSummary`
- **US-63** 🟡 Como `ADMIN`/`SECRETARY`, quiero abrir el detalle de un egreso desde el listado para ver y editar sus datos (la page `/admin/egresos/[id]` usa `params` sin `await`, y en Next 16 `params` es una Promise).
  - Criterio: al abrir un egreso existente se muestran sus datos.
  - Criterio: un id inexistente o de otro negocio muestra "no encontrado", no un error.
  - Criterio: la page espera `params` igual que las demás pages `[id]`.
  - Bug (2026-10-27): con `params.id` vacío, `getExpense` buscaba `{ id: undefined, businessId }` y Prisma devolvía el primer egreso del negocio, así que "Editar" abría y guardaba otro egreso.
  `src/app/(admin)/admin/egresos/[id]/page.tsx`
- **US-71** 🟡 Como `ADMIN`, quiero eliminar un egreso desde el listado de Egresos, además de editarlo, para corregir registros duplicados o cargados por error.
  - Criterio: cada fila del listado tiene un botón de eliminar junto al de editar; al pulsarlo pide confirmación con la descripción del egreso y avisa que deja de contar en Ganancias y el Dashboard.
  - Criterio: al confirmar, el egreso desaparece del listado y de los totales, con el aviso "Egreso eliminado"; al cancelar no cambia nada.
  - Criterio: solo el `ADMIN` ve el botón; el `ACCOUNTANT` no. `deleteExpense` vuelve a exigir `ADMIN` y que el egreso sea del negocio de la sesión (si no, "Egreso no encontrado").
  - Criterio: eliminar un egreso creado al confirmar un egreso fijo no cambia la fecha del próximo pago del egreso fijo.
  `src/actions/expenses.ts:deleteExpense`, `src/app/(admin)/admin/egresos/DeleteExpenseButton.tsx`, `src/app/(admin)/admin/egresos/EgresosContent.tsx`, `src/app/(admin)/admin/egresos/page.tsx`
- **US-70** ✅ Como `ADMIN`, quiero indicar al registrar un egreso si se repite (mensual, cada 3 meses, cada 6 meses o anual) para que la app me avise del próximo pago sin tener que crear aparte el egreso fijo.
  `src/actions/expenses.ts:createExpense`, `src/components/admin/ExpenseForm.tsx`
  - Criterio: en Nuevo egreso, la casilla "¿Es un egreso recurrente? (mensual)" se reemplaza por un selector "¿Se repite?" con No, Mensual, Cada 3 meses, Cada 6 meses y Anual; por defecto, No.
  - Criterio: con una frecuencia elegida, al guardar se crea el egreso (marcado "Recurrente" y enlazado) y un egreso fijo con la misma descripción, categoría, monto y notas, cuya próxima fecha es la del egreso avanzada según la frecuencia (21-oct trimestral → 21-ene; 31-ene mensual → 28-feb). Ambos se crean en una sola transacción: si uno falla, no queda ninguno.
  - Criterio: con "No" se crea solo el egreso, como hoy. Al editar un egreso existente no se ofrece el selector (la repetición se gestiona en Egresos fijos) y se conserva su marca "Recurrente".
  - Criterio: una frecuencia que no sea una de las cuatro se rechaza con un mensaje y no se guarda nada. Los egresos antiguos marcados "Recurrente" se siguen viendo igual; no hay migración.
  - Criterio (2026-10-21): al crear, la descripción y la categoría se recortan y tienen los mismos máximos que un egreso fijo (200, 100 y notas 1000), y la fecha debe ser un día AAAA-MM-DD válido. La fecha por defecto es "hoy" en hora de Panamá (`todayISO()`), no el día UTC.
  - Verificado (2026-10-21) con Playwright en local: trimestral 21-oct → 21-ene; mensual 31-ene → 28-feb; "No" crea solo el egreso; una frecuencia inyectada que no existe muestra "Frecuencia inválida" y no guarda nada. El criterio de edición se verificó solo en código, porque `/admin/egresos/[id]` está rota (US-63).

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
- **US-62** ⬜ Como `ADMIN`, quiero decidir qué cifras del dashboard ve cada rol y que se obtengan con una Server Action, para que la secretaria no vea ventas, gastos y margen si no corresponde (hallazgo M2 de `docs/seguridad/2026-10-15-revision-2.md`).
  - Criterio: las consultas del dashboard salen de `src/app/(admin)/admin/page.tsx` y pasan a una Server Action con `requireBusiness` y roles explícitos.
  - Criterio: una `SECRETARY` no ve los totales de ventas, gastos ni margen del mes (o los ve, si el negocio lo decide así; la decisión queda escrita en la historia).
  - Criterio: `ADMIN` y `ACCOUNTANT` ven el mismo dashboard que hoy.
  - Criterio: un rol sin permiso que invoca la action directamente recibe "Sin permiso".

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
- **US-66** ✅ Como dueño del negocio, quiero que cada despliegue publique los estilos del código que se acaba de unir, para que el sitio no salga con colores viejos o texto invisible (pasó en US-65: Vercel reutilizó el caché de compilación de Turbopack y sirvió la hoja de estilos anterior, con texto blanco sobre blanco en el banner y el pie, hasta un redeploy sin caché).
  - Criterio: `next.config.ts` desactiva el caché de Turbopack en disco para los builds (`experimental.turbopackFileSystemCacheForBuild: false`), con un comentario que explique por qué; el caché de `next dev` no cambia.
  - Criterio: `npm run build` pasa y, tras cambiar un color en `globals.css` y volver a compilar sin borrar `.next`, la hoja de estilos generada trae el color nuevo y no el anterior.
  - Criterio: después de desplegar, la hoja de estilos de producción contiene las clases de la paleta (`bg-ink`, `bg-lavender`, `text-sun`); si falta alguna, el despliegue se considera fallido y se rehace sin caché.
  - Criterio: la lección queda en `AGENTS.md` (si producción se ve sin estilos o con los anteriores, redeploy sin "Use existing Build Cache").
  - Verificado (2026-10-15): `npm run build` pasa (compilación de ~1 s a ~11 s sin caché); se cambió `--color-ink` a `#123456`, se recompiló sin borrar `.next` y el CSS trajo `.bg-ink{background-color:#123456}`, y al revertir volvió a `#28243d`. La hoja de producción tras el redeploy manual sin caché trae `bg-ink`, `bg-lavender` y `text-sun`; hay que repetir esa comprobación al desplegar esta historia.
  - Verificado en producción (2026-10-15, despliegue de `2bf564b`): la hoja de estilos trae `bg-ink`, `bg-lavender`, `bg-violet`, `bg-coral` y `text-sun`; el pie se ve índigo (`rgb(40, 36, 61)`) y el inicio a 360 px no tiene scroll horizontal. En local el caché no reprodujo el CSS viejo, así que la causa en Vercel es la más probable pero no quedó confirmada con sus logs.
  `next.config.ts`, `AGENTS.md`

## Épico M — Seguridad

- **US-52** ✅ Como dueño del negocio, quiero que los pedidos del sitio público usen los precios del catálogo y no los que envía el navegador, para que nadie pueda crear un pedido con precios alterados.
  - Criterio: `createPublicOrder` ignora `unitPrice` y `totalAmount` del cliente: toma el precio de cada producto de la base y calcula el total en el servidor.
  - Criterio: un pedido enviado con precios modificados queda guardado con los precios reales del catálogo.
  - Criterio: el carrito sigue mostrando el mismo total que se guarda.
  - Criterio (2026-10-15): si el carrito guardado en el navegador tiene precios viejos, al enviar el pedido se avisa el total real con que quedó registrado (verificado con Playwright: precio alterado a 0.01 → se guardó 2 × 12 = 24).
  `src/actions/public-orders.ts:createPublicOrder`, `src/app/(public)/carrito/page.tsx:CarritoPage`
- **US-53** ✅ Como sistema, `createPublicOrder` debe validar su entrada con Zod y resolver el negocio con `getActiveBusinessId()`, como exigen las reglas duras.
  - Criterio: se rechazan cantidades menores o iguales a cero, no enteras o excesivas, listas de ítems vacías, `businessLine` fuera del enum, y nombre o teléfono vacíos o demasiado largos, con un mensaje claro.
  - Criterio: el negocio activo se obtiene con `getActiveBusinessId()`; se elimina la query propia.
  - Criterio: el mensaje de error que ve el visitante no expone detalles internos (ids, errores de Prisma).
  - Criterio (2026-10-15): un mismo teléfono o IP no puede crear más de 5 pedidos en 10 minutos; el siguiente se rechaza con un mensaje que pide esperar (hallazgo C1 de `docs/seguridad/2026-10-15-revision.md`).
  - Criterio (2026-10-15): el stock se verifica sumando todas las líneas del pedido que usan el mismo artículo, para que repetir un producto no permita superar lo disponible.
  - Criterio (2026-10-15): el límite se guarda en la tabla `RateLimitHit` (migración aditiva) porque en Vercel cada request puede caer en otra instancia; con peticiones simultáneas nunca pasan más de 5 (probado con una ráfaga de 8: pasaron 4).
  `src/actions/public-orders.ts:createPublicOrder`, `src/lib/rate-limit.ts:consumeRateLimit`, `prisma/migrations/20261015200000_rate_limit_hits`
- **US-56** ✅ Como dueño de la plataforma, quiero que el seed no tenga contraseñas escritas en el código, para que leer el repositorio no dé acceso a ninguna cuenta (hallazgo C2 de `docs/seguridad/2026-10-15-revision.md`).
  - Criterio: `prisma/seed.ts` toma las contraseñas iniciales de `SEED_SUPER_PASSWORD` y `SEED_ADMIN_PASSWORD`; si faltan, genera una al azar y la imprime una sola vez en consola.
  - Criterio: `git grep -nE "super123|admin123"` no encuentra nada en el repo fuera de `docs/` (donde solo aparecen en esta historia y en el reporte de seguridad).
  - Criterio: en producción ya no se puede entrar con `super@sistema.com` ni `admin@artemadisa.com` usando las contraseñas antiguas del seed (lo confirma una persona).
  - Verificado: seed con variables, sin variables y segunda corrida que no pisa usuarios existentes. El responsable confirmó el 2026-10-15 que cambió las dos contraseñas en producción.
  `prisma/seed.ts:initialPassword`, `README.md`, `SETUP.md`
- **US-57** ✅ Como dueño del negocio, quiero que la app use versiones de Next.js y Auth.js sin vulnerabilidades críticas conocidas, para no quedar expuesto a ataques ya publicados (hallazgos A1, M2 y B3).
  - Criterio: `next` queda en 16.4.2 o superior y `next-auth` en la última beta de v5.
  - Criterio: `npm audit --omit=dev` no reporta vulnerabilidades críticas ni altas en `next`, `next-auth`, `@auth/core` ni `sharp`.
  - Criterio: `shadcn` pasa a `devDependencies`.
  - Criterio: `npm run build` pasa y el login, el catálogo público y una venta funcionan igual que antes.
  - Criterio (2026-10-15): se usa `next@16.3.8` y no 16.4.2: según `npm audit`, la 16.3.8 ya corrige todos los avisos, y la 16.4.2 salió el mismo día de la historia. Con ella `sharp` resuelve a 0.35.5 (corregida). `npm audit --omit=dev` pasó de 30 vulnerabilidades (4 críticas) a 3 altas, todas de la CLI de Prisma (`@prisma/config`/`deepmerge-ts`), que solo corre en el build y se corrige con Prisma 7.
  - Bug corregido: la regla nueva `no-location-assign-relative-destination` de `eslint-config-next` 16.3.8 marcaba la redirección del carrito; ahora usa `router.push`.
  `package.json`, `package-lock.json`
- **US-58** ✅ Como `ADMIN`, quiero que al desactivar a un usuario o cambiar su rol pierda el acceso de inmediato, para que un empleado que se va no pueda seguir entrando con su sesión abierta (hallazgo A2).
  - Criterio: un usuario desactivado con la sesión abierta recibe "No autenticado" en su siguiente acción y vuelve al login.
  - Criterio: si el super administrador desactiva un negocio, sus usuarios pierden el acceso en la siguiente acción.
  - Criterio: un cambio de rol se aplica en la siguiente acción sin volver a iniciar sesión.
  - Criterio: la sesión dura como máximo 7 días.
  - Criterio (2026-10-15): la revalidación se hace en el callback `jwt` de Auth.js, que corre en cada lectura de la sesión (proxy, layouts y Server Actions): si devuelve `null` la sesión se invalida y el proxy manda al login. Cuesta una query por lectura de sesión.
  - Criterio (2026-10-15): un usuario de un negocio inactivo no puede iniciar sesión (ve el mensaje genérico de credenciales incorrectas).
  - Verificado con Playwright y cambios directos en la base: rol cambiado → la sesión toma el rol nuevo; usuario desactivado y negocio desactivado → `/admin/ventas` redirige a `/login`; cookie de 7 días.
  `src/lib/auth.ts:jwt`, `src/lib/auth.ts:authorize`
- **US-59** ✅ Como dueño del negocio, quiero que el login bloquee los intentos repetidos, para que nadie pueda adivinar una contraseña probando muchas (hallazgos A3 y B5).
  - Criterio: tras 5 intentos fallidos para un mismo email en 15 minutos, ese email queda bloqueado 15 minutos, aunque luego se use la contraseña correcta.
  - Criterio: el mensaje es el mismo exista o no el email, para no revelar qué cuentas existen.
  - Criterio: un login correcto reinicia el contador.
  - Criterio: cada intento fallido y cada bloqueo quedan registrados con email, fecha e IP, nunca con la contraseña.
  - Criterio (2026-10-15): el bloqueo dura hasta que los fallos salen de la ventana de 15 minutos (los intentos durante el bloqueo no lo alargan); el email se compara sin distinguir mayúsculas. El registro es una línea JSON por `console.warn` (`login_fallido`, `login_bloqueado`), visible en los logs de Vercel.
  - Verificado con Playwright: 3 fallos y luego correcta entra y reinicia el contador; 5 fallos bloquean incluso con la contraseña correcta y con el email en mayúsculas; email inexistente da el mismo mensaje; otro usuario no se afecta; al vencer la ventana vuelve a entrar.
  `src/lib/auth.ts:authorize`, `src/lib/rate-limit.ts:isRateLimited`
- **US-60** ✅ Como dueño del negocio, quiero que ningún usuario de otro negocio pueda vincular mis socios, artículos, proveedores o productos a sus registros, para que mis datos no se vean ni se alteren desde otro negocio (hallazgos A4, A5, A6 y M1).
  - Criterio: crear o editar una inversión con un aporte de un socio de otro negocio se rechaza con "Socio no encontrado".
  - Criterio: crear o editar un producto vinculado a un artículo de inventario de otro negocio se rechaza.
  - Criterio: crear o editar un artículo con un proveedor de otro negocio se rechaza.
  - Criterio: crear o editar una compra con un ítem que apunta a un producto de otro negocio se rechaza.
  - Verificado invocando las Server Actions como atacante (sesión del ADMIN de A con IDs de un negocio B): inversión con socio de B → "Socio no encontrado"; compra con producto de B → rechazada; edición de producto y de artículo interceptando la petición del formulario real para meter el artículo y el proveedor de B → rechazadas y sin cambios en la base. Control: el mismo ataque contra el código anterior sí guardaba los vínculos.
  - Bug corregido: los aportes de una inversión no se validaban con Zod (`contributionSchema` estaba definido pero no se usaba).
  `src/actions/investments.ts:parseContributions`, `src/actions/products.ts:isValidInventoryItem`, `src/actions/inventory-items.ts:areValidSuppliers`, `src/actions/purchases.ts:resolveItems`
- **US-61** ✅ Como dueño del negocio, quiero que la app envíe cabeceras de seguridad y que el optimizador de imágenes solo acepte orígenes conocidos, para evitar clickjacking y que usen el sitio como proxy de imágenes (hallazgos M3 y M4).
  - Criterio: las respuestas incluyen `X-Frame-Options: DENY` (o `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff` y `Referrer-Policy: strict-origin-when-cross-origin`.
  - Criterio: `/_next/image` rechaza una URL de un host que no sea Vercel Blob ni uno de los usados por el catálogo actual.
  - Criterio: las imágenes del catálogo, de inventario y de perfil se siguen viendo en producción.
  - Criterio (2026-10-15): el optimizador solo acepta `*.public.blob.vercel-storage.com` y rutas locales; como el formulario de producto permite escribir cualquier URL de imagen, las de otros hosts se muestran sin optimizar (`unoptimized`) en vez de romper la página.
  - Verificado en local: las cuatro cabeceras están en las respuestas; `/_next/image` con `example.com` → 400 y con un host de Blob se acepta; el catálogo muestra una imagen externa directa y una local optimizada, sin errores; panel sin errores. Falta mirar las imágenes en producción después del despliegue.
  `next.config.ts`, `src/lib/utils.ts:isOptimizableImage`

- **US-67** ✅ Como `ADMIN`, quiero definir en cada producto bajo pedido cuántas unidades sin stock se aceptan por pedido del sitio público, para que un visitante no pueda dejar el inventario de ese artículo en miles de unidades negativas y trabar la operación del panel (hallazgo M3 de las revisiones de seguridad 2026-10-15 (3) y (4)).
  - Criterio: el formulario de producto, cuando la casilla "Se puede pedir bajo pedido" está marcada, pide "Máximo bajo pedido por pedido" (entero de 1 a 100). Solo el `ADMIN` lo ve y lo cambia, con la misma regla de US-64. Los productos que ya son bajo pedido quedan con 10, y la migración no toca ningún otro dato.
  - Criterio: `createPublicOrder` suma todas las líneas del mismo producto en el pedido y rechaza el pedido si la parte que excede lo disponible supera el tope, con "Solo se pueden pedir N unidades bajo pedido de <producto>". El cálculo va dentro de la `$transaction` y la entrada se valida con Zod.
  - Criterio: el carrito y la tarjeta de producto no dejan subir la cantidad por encima de lo disponible más el tope, y muestran el aviso de bajo pedido con el límite ("Hay 3 disponibles; puedes pedir hasta 10 más bajo pedido").
  - Criterio: un pedido dentro del tope se crea igual que hoy (US-64). Un producto sin bajo pedido sigue rechazando lo que supere el stock con "Stock insuficiente", y las ventas manuales del panel no cambian.
  - Criterio (2026-10-15): el tope es por producto y por pedido. Si dos productos bajo pedido comparten artículo de inventario, cada uno aporta su propio tope. Repitiendo pedidos (5 cada 10 minutos por IP y por teléfono) todavía se pueden acumular faltantes, pero de a N unidades y no de a 100: M3 queda mitigado, no eliminado.
  - Criterio (2026-10-15): los carritos guardados antes del cambio conservan el límite viejo hasta que se vuelve a agregar el producto; el servidor rechaza el exceso con el mensaje del tope.
  - Verificado con Playwright contra una base temporal (18 comprobaciones): el ADMIN ve y guarda el tope (5); el formulario no envía 0 y el servidor rechaza 0 enviado a mano; la SECRETARY no ve el campo y si inyecta `backorderLimit`/`allowBackorder` no cambia nada (control: la misma inyección como ADMIN sí aplica); la tarjeta muestra "hasta 5 bajo pedido" y no deja pasar de 5; el carrito avisa el tope y deshabilita el +; 6 unidades y 3 + 3 en dos líneas se rechazan con "Solo se pueden pedir 5 unidades bajo pedido…" sin crear ventas; 5 unidades se crean con `backorderQuantity` 5; un producto sin bajo pedido sigue con "Stock insuficiente". Regresión de US-65: 22/22.
  - Migración `20261017000000_product_backorder_limit`: solo agrega `backorderLimit INTEGER NOT NULL DEFAULT 10`; `prisma migrate diff` contra la base migrada queda vacío.
  `src/actions/public-orders.ts:createPublicOrder`, `src/actions/products.ts:backorderValue`, `src/lib/utils.ts:orderLimit`, `src/components/admin/ProductForm.tsx`, `src/components/public/ProductCard.tsx`, `src/app/(public)/carrito/page.tsx`

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
