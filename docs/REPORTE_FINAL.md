# Reporte Final de Proyecto — SportX

**Producto:** SportX — Plataforma integral para tienda de deportes (E-commerce, POS, Inventario y Gestión de Proyectos internos)
**Versión entregada:** MVP 1.0
**Fecha de cierre:** Octubre 2026
**Roles del sistema:** Administrador, Empleado/Vendedor y Cliente

---

# 1. Stack Tecnológico (Resumen Ejecutivo)

## Frontend

- **React 18 + TypeScript:** Construye toda la interfaz como componentes reutilizables. El tipado estricto detecta errores antes de llegar a producción.
- **Vite 5:** Servidor de desarrollo y empaquetador. Arranque instantáneo y builds de producción en segundos.
- **React Router 6:** Navegación SPA (catálogo, detalle, checkout, paneles, POS y páginas institucionales) sin recargar la página.
- **Tailwind CSS 3 + variables CSS:** Sistema de diseño con tokens de color para modo claro/oscuro. Permite iterar rápido manteniendo consistencia visual.
- **Framer Motion:** Transiciones suaves entre páginas que dan sensación de app nativa.
- **GSAP + ScrollTrigger:** Animaciones de la Hero Section (revelado tipográfico, botón magnético, parallax al hacer scroll).
- **Radix UI (Alert Dialog):** Modales de confirmación accesibles (foco atrapado, tecla Escape, roles ARIA) para acciones críticas.
- **Sonner:** Notificaciones toast no intrusivas para feedback inmediato (agregar al carrito, ventas, errores).
- **Lucide React:** Iconografía vectorial liviana y coherente en toda la plataforma.
- **Animate.css / Hover.css:** Micro-interacciones de bajo costo (rebotes, fades, elevación de tarjetas).

## Backend

- **Node.js + Express 4:** API REST que centraliza autenticación, productos, pedidos, POS, proyectos y auditoría. Ligero y ampliamente soportado.
- **JSON Web Tokens (JWT):** Sesiones sin estado y control de acceso por rol (admin, seller, consumer) en cada endpoint.
- **bcryptjs:** Hash seguro de contraseñas; nunca se almacenan en texto plano.
- **Zod:** Esquemas de validación compartidos entre frontend y backend (carpeta `shared/`). Una sola fuente de verdad para las reglas de negocio.

## Base de Datos

- **PostgreSQL (PGlite embebido):** Motor relacional real que corre sin instalación externa. Ideal para demo y desarrollo, migrable a PostgreSQL en la nube sin cambios de código.
- **Drizzle ORM:** Consultas tipadas y transacciones atómicas. Evita inyecciones SQL al usar consultas parametrizadas.
- **Drizzle Kit:** Generación y aplicación de migraciones del esquema.

## Calidad, DevOps y Herramientas

- **GitHub Actions (CI):** En cada push valida tipos (`tsc --noEmit`), audita imágenes/SKU y compila el build de producción. Ningún cambio roto llega a la rama principal.
- **Scripts de auditoría (`scripts/`):** Verifican la integridad entre productos, SKU e imágenes del catálogo.
- **Git con ramas atómicas (`feat/*`, `fix/*`, `refactor/*`):** Historial ordenado y trazable por funcionalidad.
- **Figma:** Prototipado de pantallas y flujos UI/UX antes de la implementación.

---

# 2. Desafíos Técnicos y Resoluciones (Post-Mortem)

## Desafío 1: Scroll horizontal fantasma en mobile y desktop

- **Síntoma:** En celulares y en algunas resoluciones de escritorio la página "bailaba" hacia los costados y aparecía una barra de desplazamiento horizontal, dando una sensación de sitio roto.
- **Detección:** Inspeccionando el ancho del documento con las DevTools en modo responsive, se comprobó que el `scrollWidth` superaba el ancho de la pantalla incluso sin contenido visible fuera de ella.
- **Causa raíz:** El carrito lateral y el menú móvil, al estar cerrados, se ocultaban desplazándolos fuera de pantalla (`translate-x-full`). El navegador seguía contabilizando ese espacio como parte del documento. Se sumaban las animaciones 3D del Hero.
- **Resolución:** Se aplicó contención en cascada: `overflow-x: hidden` y `max-width: 100vw` en `html`, `body` y `#root`; `overflow-hidden` en los contenedores fijos de los drawers; y `box-sizing: border-box` global. Las listas que sí deben deslizar (carruseles, filtros) usan scroll interno con la barra oculta.

## Desafío 2: Sobreventa por concurrencia en el stock (E-commerce + POS)

- **Síntoma:** Al incorporar el Punto de Venta físico, existía el riesgo de que un cliente online y un vendedor en mostrador compraran la última unidad al mismo tiempo, dejando el stock en negativo.
- **Detección:** Durante la validación del flujo de inventario se simularon ventas simultáneas sobre un producto con stock 1.
- **Resolución:** Cada venta se ejecuta dentro de una **transacción atómica** y el descuento se hace con una actualización condicional (`UPDATE ... SET stock = stock - n WHERE stock >= n`). Si la condición no se cumple, la transacción completa se revierte y el usuario recibe un mensaje claro de "stock insuficiente". Además, cada movimiento queda registrado en la tabla inmutable `inventory_logs` con el responsable y el motivo, lo que permite auditar cualquier diferencia.

## Desafío 3: Contraste ilegible en modo claro e imágenes rotas en el catálogo

- **Síntoma:** El color de acento neón (#CCFF00), excelente en modo oscuro, resultaba casi invisible sobre fondo blanco (contraste 1.16:1 en precios y 1.71:1 en estrellas de calificación). En paralelo, algunos productos mostraban imágenes rotas.
- **Detección:** Auditoría de accesibilidad con medición de contraste WCAG y un script automatizado que cruzó cada producto con su imagen y su SKU.
- **Resolución:** Se crearon **tokens semánticos de color** por tema (precio, rating, éxito) que superan el estándar **WCAG AA (≥ 4.5:1)**. Se agregó la columna `sku` a la base de datos, un componente de imagen con **fallback por categoría** y la auditoría de imágenes se integró al pipeline de CI para que el problema no vuelva a aparecer.

---

# 3. Análisis de Captación de Clientes: El "Gancho" Visual

## La regla de los 3 segundos

Un usuario decide en los **primeros 3 a 5 segundos** si un sitio merece su atención. SportX está diseñado para ganar esa batalla antes de que el usuario piense en irse.

## La "intro fachera": anatomía de la Hero Section

- **Tipografía masiva y en movimiento:** El mensaje "RUN BEYOND LIMITS." aparece con un revelado palabra por palabra (GSAP). Comunica la propuesta de la marca —rendimiento, energía, ambición— sin necesidad de leer párrafos.
- **Showcase 3D interactivo:** El producto destacado reacciona al movimiento del mouse con un efecto de inclinación (tilt) en profundidad. El usuario **juega con la interfaz** desde el primer segundo, y la interacción genera compromiso inmediato.
- **Rotación automática de productos estrella:** Cada 5 segundos cambia el producto destacado, mostrando variedad del catálogo sin que el usuario tenga que hacer nada. Se pausa al pasar el mouse y respeta la preferencia de "movimiento reducido" del sistema.
- **Botón magnético:** El botón "Explorar Catálogo" se desplaza levemente hacia el cursor cuando se acerca. Es un detalle sutil que transmite calidad premium e invita al clic.
- **Fondo vivo:** Un foco de luz sigue al cursor sobre una grilla tipo cancha deportiva con textura de grano cinematográfico. El sitio se siente "encendido", no estático.

## Identidad visual coherente

- **Paleta de alto impacto:** Negro profundo con acento verde volt (#CCFF00), el lenguaje visual de las grandes marcas deportivas de rendimiento.
- **Modo claro y oscuro:** Ambos con contraste verificado, para que la experiencia sea igual de sólida en cualquier preferencia o condición de luz.
- **Consistencia total:** El mismo sistema de diseño se aplica al catálogo, al checkout, al POS y a los paneles internos. El cliente percibe una marca seria y confiable.

## Fluidez que retiene

- **Transiciones entre páginas** sin pantallas en blanco: la navegación se siente como una app nativa.
- **Feedback inmediato:** Al agregar un producto aparece una notificación con acceso directo a la bolsa; el ícono del carrito rebota. El usuario siempre sabe que su acción funcionó.
- **Búsqueda en vivo** con resultados resaltados mientras se escribe.
- **Cero fricción visual:** sin scroll horizontal, sin saltos de diseño y con imágenes de respaldo cuando una foto falla.

## Impacto en la tasa de rebote y la conversión

- **Reducción del bounce rate:** La interacción en el primer segundo (tilt 3D, botón magnético, rotación de productos) convierte una visita pasiva en una visita activa. Un usuario que ya interactuó tiene muchas más probabilidades de seguir navegando.
- **Efecto halo:** Una primera impresión premium hace que el cliente asuma que los productos, el servicio y la seguridad del pago están al mismo nivel. Esa confianza es la base de la decisión de compra.
- **Camino corto a la compra:** Desde la Hero hay dos llamadas a la acción claras (Explorar Catálogo / Ver Colecciones), carruseles temáticos inmediatamente debajo y botón "Comprar ahora" directo al checkout.
- **Señales de confianza en el recorrido:** envío gratis desde cierto monto, garantía de 30 días, páginas reales de ayuda, envíos, devoluciones y legales. El cliente no encuentra "callejones sin salida" que lo hagan dudar.

---

# Anexo A — Documento de Requerimientos

## Alcance

Plataforma web que optimiza los procesos de una tienda de deportes: venta online, venta física en mostrador, control de inventario, gestión de clientes/empleados y seguimiento de proyectos internos.

## Roles

- **Administrador:** acceso total, métricas, usuarios, roles, auditoría, POS y proyectos.
- **Empleado / Vendedor:** POS, productos propios, inventario, pedidos y proyectos internos.
- **Cliente:** catálogo, carrito, checkout, historial de pedidos y reseñas.

## Requerimientos Funcionales

- **RF-01** Registro e inicio de sesión de clientes (rol cliente asignado automáticamente).
- **RF-02** Catálogo con búsqueda, filtros (categoría, marca, talle, color, precio) y ordenamiento.
- **RF-03** Carrito persistente con selección de talle y cálculo de envío.
- **RF-04** Checkout con selector de provincia y autocompletado de código postal.
- **RF-05** Registro de pedidos con descuento automático de stock.
- **RF-06** Punto de Venta (POS) para ventas presenciales: efectivo (con cálculo de vuelto), tarjeta y QR; emisión e impresión de ticket.
- **RF-07** Gestión de productos (alta, edición, baja) con SKU e imágenes.
- **RF-08** Ajustes de stock con motivo y alertas de stock bajo.
- **RF-09** Registro de auditoría inmutable de movimientos de inventario.
- **RF-10** Gestión de usuarios: cambio de rol y suspensión de cuentas.
- **RF-11** Gestión de proyectos internos: proyectos, fases del ciclo de vida, tareas en tablero Kanban, responsables, prioridades y progreso.
- **RF-12** Panel de métricas (ingresos, pedidos, usuarios, stock bajo, ventas de los últimos 7 días).
- **RF-13** Reseñas y calificaciones de productos.
- **RF-14** Páginas institucionales: ayuda/contacto, envíos, devoluciones, guía de talles, nosotros y legales.

## Requerimientos No Funcionales

- **RNF-01 Seguridad:** contraseñas con hash bcrypt, JWT, control de acceso por rol en cada endpoint, consultas parametrizadas.
- **RNF-02 Integridad:** transacciones atómicas en ventas; el stock nunca puede quedar negativo.
- **RNF-03 Accesibilidad:** contraste WCAG AA, modales accesibles y navegación por teclado.
- **RNF-04 Responsive:** uso correcto en celular, tablet y escritorio, sin scroll horizontal.
- **RNF-05 Rendimiento:** build optimizado, carga diferida de imágenes y animaciones que respetan "movimiento reducido".
- **RNF-06 Mantenibilidad:** TypeScript estricto y validaciones compartidas front/back.
- **RNF-07 Calidad continua:** pipeline de CI que bloquea cambios con errores de tipos o de build.

---

# Anexo B — Arquitectura

- **Cliente (SPA React):** páginas públicas, checkout, paneles por rol y terminal POS.
- **API REST (Express):** módulos `auth`, `products`, `orders` (incluye `/orders/pos`), `admin`, `reviews`, `projects` e `inventory-logs`.
- **Base de datos (PostgreSQL/PGlite):** tablas `users`, `products`, `orders`, `order_items`, `inventory_logs`, `reviews`, `projects` y `project_tasks`.
- **Capa compartida (`shared/validators.ts`):** esquemas Zod usados por ambos lados.

Flujo típico de venta: el cliente o el vendedor envía la venta → la API valida rol y datos → abre una transacción → descuenta stock de forma condicional → registra el pedido, sus ítems y el log de inventario → confirma o revierte todo.

---

# Anexo C — Documentación Técnica

## Instalación y ejecución

1. Instalar dependencias: `npm install`
2. Modo desarrollo (API + web): `npm run dev`
3. Build de producción: `npm run build`
4. Servidor de producción: `npm start`

La base de datos se crea y se carga automáticamente con datos de ejemplo al iniciar el servidor (carpeta `data/`).

## Usuarios de prueba

- **Administrador:** admin@sportx.com
- **Empleado/Vendedor:** seller@sportx.com
- **Cliente:** buyer@sportx.com
- Contraseña de los tres: `password123`

## Estructura del repositorio

- `src/` — frontend (páginas, componentes, contextos, paneles).
- `server/` — API, rutas, middleware y base de datos.
- `shared/` — validaciones compartidas.
- `scripts/` — auditorías de catálogo.
- `.github/workflows/` — integración continua.
- `docs/` — documentación del proyecto.

---

# Anexo D — Manual de Usuario

## Cliente

1. **Registrarse:** botón "Únete", completar nombre, email y contraseña.
2. **Buscar productos:** usar el buscador superior o el menú de categorías; aplicar filtros en el catálogo.
3. **Agregar al carrito:** elegir talle y presionar "Agregar a la bolsa" (o "Comprar ahora").
4. **Finalizar compra:** completar dirección, elegir provincia (el código postal se sugiere solo), seleccionar medio de pago y confirmar.
5. **Ver pedidos:** menú de usuario → "Panel de control".

## Empleado / Vendedor

1. **Abrir el POS:** menú de usuario → "Punto de Venta (POS)".
2. **Armar el ticket:** buscar por nombre, marca o SKU y tocar el producto; ajustar talle y cantidad.
3. **Cobrar:** elegir efectivo, tarjeta o QR. En efectivo, ingresar el monto recibido y el sistema calcula el vuelto.
4. **Confirmar:** presionar "Cobrar"; se genera el ticket, que puede imprimirse.
5. **Proyectos internos:** pestaña "Proyectos internos" → elegir proyecto → mover tareas entre "Por hacer", "En progreso" y "Completadas".
6. **Inventario:** pestaña "Inventario" para ajustar stock indicando el motivo.

## Administrador

1. **Resumen:** métricas generales y gráfico de ventas de los últimos 7 días.
2. **Usuarios:** cambiar roles o suspender cuentas (con confirmación).
3. **Proyectos:** crear proyectos con presupuesto y fecha límite, y asignar tareas por fase.
4. **Auditoría:** consultar el historial completo de movimientos de stock.

---

# Anexo E — Plan e Informe de Pruebas

## Estrategia

- **Verificación estática automatizada:** TypeScript estricto en todo el código; se ejecuta en cada push mediante CI.
- **Build de producción automatizado:** cualquier error de compilación bloquea la integración.
- **Auditoría automatizada del catálogo:** valida SKU e imágenes de todos los productos.
- **Pruebas funcionales manuales:** recorrido completo de los flujos críticos por cada rol.
- **Auditoría de formularios:** validación, seguridad, UX y accesibilidad de registro, checkout y contacto.

## Casos de prueba ejecutados

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| CP-01 | Registro de nuevo cliente | Cuenta creada con rol cliente | Aprobado |
| CP-02 | Login con contraseña incorrecta | Mensaje "Credenciales incorrectas" | Aprobado |
| CP-03 | Compra online con stock disponible | Pedido creado y stock descontado | Aprobado |
| CP-04 | Compra con cantidad mayor al stock | Venta rechazada, stock intacto | Aprobado |
| CP-05 | Selección de provincia en checkout | Código postal autocompletado y editable | Aprobado |
| CP-06 | Venta POS en efectivo con vuelto | Vuelto correcto, ticket emitido, stock descontado | Aprobado |
| CP-07 | Venta POS con producto sin stock | Producto bloqueado en la grilla | Aprobado |
| CP-08 | Registro en auditoría tras una venta | Log con responsable y motivo | Aprobado |
| CP-09 | Cliente intenta acceder al POS | Acceso restringido | Aprobado |
| CP-10 | Crear proyecto y mover tarea a "Completada" | Progreso del proyecto actualizado | Aprobado |
| CP-11 | Cambio de rol de usuario | Confirmación previa y permisos actualizados | Aprobado |
| CP-12 | Navegación en celular | Sin scroll horizontal ni elementos cortados | Aprobado |
| CP-13 | Enlaces del footer | Cada enlace abre su página correspondiente | Aprobado |
| CP-14 | Contraste en modo claro | Todos los textos críticos ≥ 4.5:1 | Aprobado |

## Retroalimentación de usuarios

- Se pidió **simplificar el registro** → se eliminó la elección comprador/vendedor; los empleados los da de alta el administrador.
- Se pidió **facilitar la carga de dirección** → selector de provincias con código postal automático.
- Se detectaron **enlaces del footer que llevaban al catálogo** → se crearon páginas propias para cada sección.
- Se reportó **desplazamiento lateral en celulares** → eliminado por completo.

## Próximos pasos de calidad

- Incorporar pruebas unitarias automatizadas (Vitest) sobre validaciones y lógica de stock.
- Incorporar pruebas end-to-end (Playwright) para los flujos de compra y POS.
- Agregar limitación de intentos (rate limiting) en login y registro.

---

# Anexo F — Cierre y Evaluación Final

## Entregables

- **Documento de requerimientos:** Anexo A.
- **Prototipos UI/UX:** Figma.
- **Código fuente:** repositorio Git con CI configurado.
- **Base de datos configurada:** esquema relacional con datos de ejemplo autoinicializados.
- **Informe de pruebas y retroalimentación:** Anexo E.
- **Documentación técnica y manual de usuario:** Anexos C y D.

## Cumplimiento por etapa del ciclo de vida

| Etapa | Resultado |
|---|---|
| Inicio | Alcance y roles definidos (admin, empleado, cliente) |
| Planificación | Requerimientos, arquitectura y stack React + Node.js |
| Ejecución | E-commerce, POS, inventario con alertas, clientes/empleados y proyectos internos |
| Monitoreo y control | CI, auditorías, pruebas funcionales y feedback incorporado |
| Cierre | Documentación, manual de usuario y MVP entregado |

## Conclusión

SportX se entrega como un MVP funcional que unifica en una sola plataforma la venta online, la venta en local, el control de stock y la organización interna del equipo. La combinación de una experiencia visual de nivel premium con una base técnica sólida —transacciones seguras, auditoría completa y control de calidad continuo— lo posiciona como un producto listo para operar y escalar.
