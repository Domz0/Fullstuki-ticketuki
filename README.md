# Ticketuki

Proyecto de venta y transferencia de entradas para eventos, con un frontend en React y un backend de microservicios en Spring Boot con MySQL. Permite comprar cupos por sector, consultar entradas y transferirlas entre usuarios. todo "pago" es simulado.

## Integrantes

- Paulina Gonzalez
- Marcelo Martabit
- Jose Santander

## Estructura del repositorio

| Carpeta | Contenido |
| --- | --- |
| `FRONTEND` | Aplicación en React con Vite. |
| `BACKEND` | Proyecto Maven multimódulo con los microservicios en Spring Boot (Java 21) y el módulo compartido. |

## Backend

Salvo `ms-gateway`, que solo tiene configuración de rutas y seguridad, cada microservicio de `BACKEND` sigue la misma organización por capas dentro de `src/main/java/com/ticketuki/...`: `controller` (endpoints REST), `service` (reglas de negocio), `repository` (acceso a datos con Spring Data JPA), `model` (entidades), `dto` (datos que entran y salen de la API), `client` (llamadas a otros microservicios) y `security`. Cada servicio tiene su propia base de datos MySQL, creada y versionada con Flyway desde `src/main/resources/db/migration`.


| Microservicio | Función principal |
| --- | --- |
| `ms-gateway` | Recibe las solicitudes del frontend, comprueba el acceso y las dirige al servicio correspondiente. |
| `ms-auth` | Gestiona el registro de cuentas, inicio de sesión, tokens JWT, contraseñas y roles. |
| `ms-usuario` | Administra los datos personales de los usuarios y la búsqueda de destinatarios para transferencias. |
| `ms-evento` | Gestiona el catálogo, las fechas, los estados, el evento destacado y la configuración de sectores por evento. |
| `ms-recinto` | Administra los recintos y sus sectores, con sus capacidades y datos generales. |
| `ms-ticket` | Gestiona los cupos, la emisión de entradas, las transferencias y las devoluciones. |
| `ms-venta` | Registra compras y pagos simulados, aplica códigos de descuento y gestiona los importes de ventas y reembolsos. |
| `ms-historial` | Guarda los movimientos de auditoría realizados en los servicios. |

`ms-tuki-compartido` es un módulo de código compartido para validaciones, seguridad, comunicación y auditoría; no se ejecuta como un microservicio independiente.

## Frontend

La carpeta `FRONTEND` es una aplicación de una sola página hecha con React y Vite. Su código está en `src`:

| Carpeta | Contenido |
| --- | --- |
| `src/App.jsx` | Componente raíz: lee la ruta del hash, elige la página que se muestra y renueva la sesión. |
| `src/pages` | Una página por pantalla; `App.jsx` elige cuál mostrar según la ruta del hash (`#/catalogo`, `#/evento/5`, `#/admin/dashboard`…). |
| `src/components` | Componentes de React con su CSS, agrupados en `acceso`, `admin`, `compras`, `comunes`, `cuenta` y `eventos`. |
| `src/services` | Llamadas al backend a través del gateway. `api.js` define `peticionApi`, que agrega el prefijo `/api/v1`, el token y el manejo de errores; el resto agrupa las solicitudes por tema (eventos, entradas, compras, transferencias, historial, admin). |
| `src/hooks` | Hooks propios: `useEventoDisponible` (evento y cupos disponibles) y `useAdminDatos` (carga de datos del panel de administración). |
| `src/utils` | Sesión y token JWT, validaciones de formularios, compra en curso, filtros del catálogo y navegación. |
| `src/data` | `planosRecintos.js`, con los planos de los recintos que se muestran en el detalle del evento y en la selección de entradas. |
| `src/assets` | Imágenes de la aplicación. |
| `tests` | Pruebas con Vitest y React Testing Library. |

### Funcionamiento en React

- **Componentes y hooks:** las pantallas son componentes de función. El estado se maneja con `useState` y las cargas de datos con `useEffect`, cancelando las solicitudes con `AbortController` cuando el componente se desmonta.
- **Navegación:** no se usa una librería de rutas. `App.jsx` escucha el evento `hashchange` y muestra la página correspondiente. `utils/navegacion.js` tiene `navegar`, que cambia el hash, y `leerRuta`, que separa la pantalla, el id y los parámetros (por ejemplo `#/evento/5?fecha=principal`).
- **Sesión:** al iniciar sesión, el token y los datos de la cuenta se guardan en `localStorage` (`sesionBackend`). La compra en curso se guarda en `sessionStorage` (`compraActual`) para poder recuperarla si se recarga la página.

### Pantallas


- **Inicio y catálogo:** muestran el evento destacado y los eventos disponibles, con búsqueda y filtros por categoría.
- **Detalle del evento y selección de entradas:** presentan la información del evento, sus sectores, precios y cupos disponibles para elegir la cantidad de entradas.
- **Registro e inicio de sesión:** permiten crear una cuenta e ingresar con nombre de usuario o correo.
- **Pago y resultado de compra:** solicitan los datos del comprador, muestran el resumen y permiten realizar un pago simulado. Incluyen confirmación y pantalla de pago fallido. Tambien permite comprar como invitado.
- **Mi cuenta:** muestra los datos del perfil, permite cambiar la contraseña y consultar las entradas y el historial de compras. Desde las entradas se puede solicitar una devolución cuando corresponda.
- **Transferir entradas:** permite a un usuario con cuenta elegir una entrada, buscar al destinatario por correo y confirmar la transferencia.
- **Administración:** incluye el dashboard de ventas y reembolsos, creación y gestión de eventos, selección del destacado, códigos de descuento, gestión de roles de usuarios, historial de movimientos y consulta de entradas de invitados para depuración.

## Comunicación entre frontend y backend

Todas las solicitudes del frontend pasan por `ms-gateway`. La tabla indica qué servicio atiende cada pantalla detrás del gateway.

| Pantalla | Microservicios que utiliza |
| --- | --- |
| Inicio, catálogo y buscador | `ms-evento` para consultar los eventos y el destacado. |
| Detalle del evento y selección de entradas | `ms-evento` para los datos del evento y `ms-ticket` para la disponibilidad de cupos. |
| Registro e inicio de sesión | `ms-auth` para crear la cuenta, iniciar sesión y renovar el token. Durante el registro, el backend se comunica con `ms-usuario` para guardar el perfil. |
| Mi cuenta: datos personales | `ms-usuario` para consultar el perfil y `ms-auth` para cambiar la contraseña. |
| Mis entradas y devoluciones | `ms-ticket` para listar y devolver entradas; `ms-evento` para completar los datos del evento y sector. El backend comunica el reembolso a `ms-venta`. |
| Historial de compras del usuario | `ms-venta` para las compras y `ms-evento` para sus datos descriptivos. |
| Pago, confirmación y pago fallido | `ms-venta` para crear la compra, aplicar descuentos, procesar el pago simulado y consultar su resultado. Internamente coordina los cupos y la emisión con `ms-ticket`. |
| Transferir entradas | `ms-ticket` para consultar y transferir entradas, `ms-usuario` para buscar al destinatario y `ms-evento` para mostrar los eventos asociados. |
| Admin: crear, editar y gestionar eventos | `ms-evento` para guardar eventos y elegir el destacado; `ms-recinto` para consultar recintos y sus sectores al crear un evento. |
| Admin: códigos de descuento | `ms-evento` para seleccionar el evento y `ms-venta` para consultar y crear códigos. |
| Admin: usuarios | `ms-auth` para listar cuentas y cambiar roles; `ms-usuario` para mostrar los datos personales. |
| Admin: dashboard e historial de movimientos | `ms-venta` para consultar ventas y reembolsos. |
| Admin: entradas invitado (debug) | `ms-venta` para consultar las compras y entradas de invitados, y `ms-evento` para mostrar sus nombres. |

`ms-historial` recibe la auditoría desde el backend, pero actualmente no tiene una pantalla conectada directamente. La sección del admin llamada «Historial de movimientos» consulta las ventas, no la auditoría de este servicio.

### Herramientas utilizadas

- **React:** construye las pantallas con componentes de función y mantiene sus datos mediante `useState`, `useEffect` y los hooks propios de `src/hooks`.
- **Fetch API:** es la función nativa del navegador usada en `src/services/api.js` para enviar solicitudes HTTP y recibir JSON. Los servicios del frontend reutilizan la función `peticionApi`.
- **Vite:** durante el desarrollo, su proxy envía las solicitudes `/api/v1/...` al gateway en el puerto `8009`, quitando `/api`.
- **Spring Cloud Gateway y WebFlux:** reciben las solicitudes; el filtro de versión quita `/v1` y el gateway las dirige al microservicio correspondiente.
- **Spring Web / Spring MVC y Jackson:** los controladores REST de los microservicios reciben las solicitudes y convierten los datos entre objetos Java y JSON.
- **JJWT:** genera y valida los tokens JWT. El frontend envía el token en `Authorization: Bearer ...` para las operaciones autenticadas; las consultas protegidas de compras de invitados utilizan `X-Compra-Token`.
- **WebClient y RestClient de Spring:** permiten la comunicación interna entre microservicios, por ejemplo para emitir entradas, validar usuarios y enviar auditoría.

## Ejecución local

### Backend

Requisitos: Java 21 y un servidor MySQL en `127.0.0.1:3306`. Por defecto los servicios se conectan con el usuario `root` sin contraseña y cada uno crea su base de datos al iniciar.

Desde la carpeta `BACKEND`, compilar todos los módulos:

```bash
./mvnw clean install
```

Luego iniciar cada microservicio en su propia terminal, por ejemplo `./mvnw -pl ms-auth spring-boot:run`. Todos deben compartir el mismo valor en la variable de entorno `INTERNAL_SERVICE_KEY`, que protege la comunicación interna entre servicios.

| Microservicio | Puerto |
| --- | --- |
| `ms-usuario` | 8001 |
| `ms-auth` | 8002 |
| `ms-evento` | 8003 |
| `ms-ticket` | 8005 |
| `ms-venta` | 8006 |
| `ms-historial` | 8007 |
| `ms-recinto` | 8008 |
| `ms-gateway` | 8009 |

Otras variables opcionales: `JWT_SECRET`, `JWT_EXPIRATION_MS`, `PAGOS_SIMULADOS` y las direcciones de cada servicio (`MS_AUTH_URL`, `MS_EVENTO_URL`, etc.) que usa el gateway.

### Frontend

Requisito: Node.js 22 o superior. Con el backend en ejecución, desde la carpeta `FRONTEND`:

```bash
npm install
npm run dev
```

La aplicación queda disponible en la dirección que muestra Vite, por defecto `http://localhost:5173`. El proxy de Vite (`vite.config.js`) envía las solicitudes `/api/...` al gateway en `http://localhost:8009`, quitando el prefijo `/api`.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la versión de producción en `dist` |
| `npm run preview` | Sirve localmente la versión de producción |
| `npm run lint` | Revisa el código con Oxlint |
| `npm test` | Ejecuta las pruebas en modo observación |
| `npm run test:run` | Ejecuta las pruebas una vez |
| `npm run test:coverage` | Ejecuta las pruebas y genera el informe en `coverage/index.html` |

## Cuenta de administrador

El panel de administración se abre en `#/admin/dashboard` con una cuenta de rol `ADMIN`. La migración `V1__create_auth_service.sql` de `ms-auth` crea una cuenta de administrador de prueba al iniciar el servicio por primera vez.

## Pago simulado

En el pago con crédito se acepta cualquier número de 16 dígitos y un CVV de 3 o 4 números, por ejemplo `4000 0000 0000 0000`.

- Con una fecha de vencimiento futura, como `12/30`, el pago se aprueba.
- Con una fecha pasada, como `12/25`, el pago se rechaza y se abre la pantalla de pago fallido.
