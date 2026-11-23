# Ticketuki

Proyecto de venta y transferencia de entradas para eventos, con un frontend en React y un backend de microservicios en Spring Boot con MySQL. Permite comprar cupos por sector, consultar entradas y transferirlas entre usuarios. todo "pago" es simulado.

## Integrantes

- Paulina Gonzalez
- Marcelo Martabit
- Jose Santander

## Backend


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

## Frontend (tuki-react-backend)

Nombre contraintuitivo pero aqui esta el frontend

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

- **React:** construye las pantallas y mantiene sus datos mediante hooks como `useState` y `useEffect`.
- **Fetch API:** es la función nativa del navegador usada en `src/services/api.js` para enviar solicitudes HTTP y recibir JSON. Los servicios del frontend reutilizan la función `peticionApi`.
- **Vite:** durante el desarrollo, su proxy envía las solicitudes `/api/v1/...` al gateway en el puerto `8009`, quitando `/api`.
- **Spring Cloud Gateway y WebFlux:** reciben las solicitudes; el filtro de versión quita `/v1` y el gateway las dirige al microservicio correspondiente.
- **Spring Web / Spring MVC y Jackson:** los controladores REST de los microservicios reciben las solicitudes y convierten los datos entre objetos Java y JSON.
- **JJWT:** genera y valida los tokens JWT. El frontend envía el token en `Authorization: Bearer ...` para las operaciones autenticadas; las consultas protegidas de compras de invitados utilizan `X-Compra-Token`.
- **WebClient y RestClient de Spring:** permiten la comunicación interna entre microservicios, por ejemplo para emitir entradas, validar usuarios y enviar auditoría.