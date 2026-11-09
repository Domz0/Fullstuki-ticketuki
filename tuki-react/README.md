# Ticketuki (tuki-react)

Frontend en React de Ticketuki, una tienda web de entradas para eventos. Es la entrega de la Evaluación Parcial 2 de Desarrollo Fullstack II (DSY1104) y migra a React la versión HTML de la carpeta `FRONTEND`.

Los datos son simulados y se guardan en el navegador. El pago no procesa tarjetas reales y el proyecto no se conecta con el backend.

## Requisitos

Node.js 22 o superior.

## Instalación y ejecución

```bash
npm install
npm run dev
```

La aplicación queda disponible en la dirección que muestra Vite, por defecto `http://localhost:5173`.

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

El panel se abre en `#/admin/dashboard` iniciando sesión con la cuenta de demostración definida en `src/utils/sesion.js`.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `src/pages` | Vistas que conectan datos y navegación con los componentes |
| `src/components` | Componentes reutilizables con su CSS |
| `src/utils` | Validaciones, sesión, compra, CRUD de eventos y navegación |
| `src/data` | Datos simulados del catálogo y los recintos |
| `tests` | Pruebas unitarias con Vitest y React Testing Library |

## Equipo

José Santander, Marcelo Martabit y Paulina González.
