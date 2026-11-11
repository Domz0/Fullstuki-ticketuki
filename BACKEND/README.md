# Ticketuki — Plataforma de Venta de Tickets por Microservicios

Ticketuki es una plataforma de venta y gestión de tickets para eventos, construida sobre una arquitectura de microservicios con Spring Boot y MariaDB. Cada dominio de negocio se encuentra aislado en su propio servicio independiente, con comunicación sincrónica vía HTTP (WebClient).

---

## Integrantes

| Nombre | GitHub |
|---|---|
| Paulina Gonzalez C. | [@Lillium1](https://github.com/Lillium1), [@pauligonzalezc](https://github.com/pauligonzalezc) |
| Marcelo Martabit D. | [@xelomartabit](https://github.com/xelomartabit) |

---

## Arquitectura

```
Cliente -> ms-gateway :8080
           |- ms-auth :8011
           |- ms-usuario :8001
           |- ms-evento :8003 (estados de evento)
           |- ms-ticket :8005 (estados de ticket)
           |- ms-venta :8006 (ventas, pagos, promociones y estados de venta)
           |- ms-recinto :8008
           |- ms-historial :8010
```

- **ms-gateway (:8080)** es el *API Gateway*: única puerta de entrada que enruta cada
  petición al microservicio correcto y valida el token JWT (ver sección *API Gateway y
  Autenticación*).
- **ms-auth (:8011)** emite los tokens JWT tras validar las credenciales.
- Cada microservicio de negocio posee su propia base de datos MariaDB aislada,
  siguiendo el patrón *Database per Service*.

---

## Microservicios y Funcionalidades

### ms-usuario — Puerto 8001 · BD: `usuario_service`
Gestión del ciclo de vida de los usuarios de la plataforma.
- Listar todos los usuarios
- Crear, consultar, actualizar y eliminar usuarios

### ms-evento — Puerto 8003 · BD: `evento_service`
Gestión de eventos culturales y su ciclo de vida.
- CRUD completo de eventos
- Filtro de eventos por fecha y por recinto
- Cambio de estado de un evento (activo, cancelado, finalizado, etc.)

### Estados locales

Evento, ticket y venta guardan su estado como enum de texto en su propia base.
Los catálogos de consulta `/estadosEvento`, `/estadosTicket` y `/estadosVenta`
son de solo lectura y se atienden en sus respectivos servicios.
Se conservan los IDs numéricos del catálogo estándar en la API.

### ms-ticket — Puerto 8005 · BD: `ticket_service`
Gestión del ciclo de vida de los tickets.
- CRUD completo de tickets
- Consulta de tickets por evento, venta, sector, titular (RUN) y código QR
- Cambio de estado de un ticket
- Validación de ticket por código QR (control de acceso)
- Transferencia de ticket entre usuarios

### ms-venta — Puerto 8006 · BD: `venta_service`
Orquestación del proceso de compra (integra tickets y usuarios).
- Crear y consultar ventas
- Cambio de estado de una venta
- Filtro de ventas por rango de fechas
- Consulta de detalle de venta y de detalles por venta

### Promociones dentro de ms-venta — Puerto 8006 · BD: `venta_service`
Gestión de promociones y descuentos aplicables a las ventas.
- CRUD completo de promociones
- Consulta de promociones activas
- Filtro de promociones por empresa

### ms-recinto — Puerto 8008 · BD: `recinto_service`
Gestión de recintos y sus sectores (datos de referencia del sistema).
- Crear, consultar y actualizar recintos
- Crear, consultar y actualizar sectores dentro de cada recinto
- Consulta de sectores por recinto

### Pagos dentro de ms-venta — Puerto 8006 · BD: `venta_service`
Procesamiento y seguimiento del estado de pagos (integra ventas y usuarios).
- Iniciar un pago para una venta
- Consultar pagos por ID, venta, usuario, estado o rango de fechas
- Completar, reembolsar o cancelar un pago

### ms-historial — Puerto 8010 · BD: `historial_service`
API de auditoría para alimentar la actividad del dashboard de administración.
La emisión automática de registros desde los otros servicios y su consumo en React siguen pendientes.
Los indicadores de ventas e ingresos se consultan en ms-venta.
- Registrar entradas de historial
- Consultar historial por ID, entidad, usuario y rango de fechas

### ms-auth — Puerto 8011 · BD: `auth_service`
Servicio de autenticación. Valida credenciales y emite tokens JWT.
- `POST /auth/login` — recibe `{username, password}` y devuelve un JWT firmado

### ms-gateway — Puerto 8080 · (sin BD)
API Gateway: única puerta de entrada al sistema. Enruta cada petición al
microservicio correspondiente y valida el JWT en cada llamada.

---

## Tecnologías Utilizadas

| Capa | Tecnología |
|---|---|
| Lenguaje | Java 21 |
| Framework | Spring Boot 3.3 |
| Persistencia | Spring Data JPA / Hibernate |
| Base de datos | MariaDB |
| Migraciones | Flyway |
| Comunicación inter-servicios | Spring WebFlux (WebClient) |
| API Gateway | Spring Cloud Gateway |
| Autenticación | JWT (jjwt) |
| Monitoreo | Spring Boot Actuator |
| Validaciones | Jakarta Bean Validation |
| Build | Maven (Wrapper incluido) |

---

## Requisitos Previos

- Java 21 o superior
- Maven 3.9+ (o usar el wrapper `./mvnw` incluido en cada módulo)
- MariaDB 10.6+ corriendo localmente en el puerto **3306**
- Usuario de base de datos: `root` sin contraseña (configurable en `application.properties`)

---

## Pasos para Ejecutar

### 1. Clonar el repositorio

```bash
git clone https://github.com/Lillium1/ticketuki.git
cd ticketuki
```

### 2. Configurar credenciales (si es necesario)

Cada servicio tiene su archivo de configuración en:

```
ms-<nombre>/src/main/resources/application.properties
```

Ajustar los campos de conexión si el usuario o la contraseña de MariaDB difieren:

```properties
spring.datasource.username=root
spring.datasource.password=
```

> Las bases de datos se crean automáticamente al levantar cada servicio gracias a `createDatabaseIfNotExist=true`.
> Los esquemas de tablas y datos iniciales son gestionados automáticamente por **Flyway** al iniciar cada servicio.

### 3. Levantar los microservicios

#### Opción A — Scripts automáticos (macOS)

Desde la raíz del proyecto, levanta los 8 módulos en el orden correcto con un solo comando:

```bash
./start.sh    # levanta los 8 módulos activos
./stop.sh     # detiene los 8 módulos activos
```

Para **reiniciar** todo (útil si ves el error `Port 8001 was already in use`):

```bash
./stop.sh && ./start.sh
```

Características de `start.sh`:

- **Fuerza Java 21** automáticamente (vía `/usr/libexec/java_home -v 21`). Esto evita el error de compilación de Lombok (`TypeTag :: UNKNOWN`) que ocurre si tu `JAVA_HOME` apunta a un JDK más nuevo (24+).
- **Libera los puertos de los módulos activos** si quedaron instancias previas corriendo.
- **Respeta el orden de dependencias** y espera a que cada servicio quede activo antes de continuar.
- Guarda la salida de cada servicio en `logs/ms-<nombre>.log`. Para seguir un log en vivo: `tail -f logs/ms-venta.log`.

> Requiere tener un **JDK 21** instalado. Si no se encuentra, el script avisa y se detiene.

#### Opción B — Manual (una terminal por servicio)

Abrir una terminal por servicio y ejecutar desde el directorio raíz del proyecto.
Se recomienda respetar el orden de inicio para evitar errores de conexión entre servicios:

```bash
mvn -f ms-auth/pom.xml spring-boot:run
mvn -f ms-recinto/pom.xml spring-boot:run
mvn -f ms-usuario/pom.xml spring-boot:run
mvn -f ms-evento/pom.xml spring-boot:run
mvn -f ms-historial/pom.xml spring-boot:run
mvn -f ms-venta/pom.xml spring-boot:run
mvn -f ms-ticket/pom.xml spring-boot:run
mvn -f ms-gateway/pom.xml spring-boot:run
```


### 4. Verificar que los servicios están activos

| Servicio | URL base |
|---|---|
| ms-usuario | http://localhost:8001/usuarios |
| ms-evento | http://localhost:8003/eventos |
| ms-ticket | http://localhost:8005/tickets |
| ms-venta | http://localhost:8006/ventas |
| Promociones (ms-venta) | http://localhost:8006/promociones |
| ms-recinto | http://localhost:8008/recintos |
| Pagos (ms-venta) | http://localhost:8006/pagos |
| ms-historial | http://localhost:8010/historial |
| ms-auth | http://localhost:8011/auth/login |
| ms-gateway | http://localhost:8080 |

> A través del gateway, todas las rutas se consumen desde `http://localhost:8080`
> (ej. `http://localhost:8080/usuarios`). Requieren token JWT salvo `/auth/login`.

---

## API Gateway y Autenticación (JWT)

El sistema expone una **única puerta de entrada** a través del **ms-gateway (:8080)**,
construido con **Spring Cloud Gateway**. El cliente solo conoce el gateway; éste:

1. **Enruta** cada petición al microservicio correcto según el path (configurado en
   `ms-gateway/src/main/resources/application.yml`).
2. **Valida el JWT** en cada petición mediante un filtro global (`JwtAuthFilter`),
   antes de reenviarla. Todas las rutas requieren un token válido **excepto**
   `/auth/login`.

### Flujo de uso

```bash
# 1. Obtener un token (ruta pública). Usuario semilla: hodor / holdthedoor1234
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"hodor","password":"holdthedoor1234"}'
# → { "token": "eyJhbGciOiJI...", "tipo": "Bearer", "username": "hodor", "expiraEnMs": 3600000 }

# 2. Usar el token en cualquier ruta protegida
curl http://localhost:8080/ventas \
  -H "Authorization: Bearer <TOKEN>"
```

| Situación | Respuesta del gateway |
|---|---|
| Ruta protegida sin token | `401 Unauthorized` |
| Ruta protegida con token inválido/expirado | `401 Unauthorized` |
| Ruta protegida con token válido | Reenvía al microservicio (`200`, etc.) |
| `POST /auth/login` (pública) | `200` + token JWT |

### Detalles de implementación

- **ms-auth (:8011)** firma los tokens (`JwtUtil` + `signWith(secret)`); el **gateway**
  los valida con el **mismo `secret`** (variable de entorno `JWT_SECRET`, compartida).
- El gateway no expone lógica de negocio (no tiene controllers): solo **rutas** (YAML)
  y **filtros** (`JwtAuthFilter`).
- Al validar, el gateway propaga el usuario autenticado a los microservicios en la
  cabecera `X-Usuario`.

---

## Monitoreo (Actuator)

Todos los servicios incluyen **Spring Boot Actuator** para verificar su estado.

| Endpoint | Dónde | Para qué |
|---|---|---|
| `/actuator/health` | gateway y los 7 microservicios | Comprobar que el servicio está vivo (`{"status":"UP"}`) |
| `/actuator/gateway/routes` | solo el gateway | Listar en runtime las 7 rutas de enrutamiento |

```bash
curl http://localhost:8080/actuator/health          # gateway
curl http://localhost:8001/actuator/health          # cualquier microservicio
curl http://localhost:8080/actuator/gateway/routes  # rutas activas del gateway
```

> El endpoint `gateway` se habilita con `management.endpoint.gateway.enabled: true`
> además de exponerlo en `management.endpoints.web.exposure.include`.

---

## Pruebas Unitarias

Cada microservicio de negocio incluye pruebas unitarias (JUnit 5 + Mockito + AssertJ),
sin dependencia de base de datos: todo se *mockea*.

### Cómo ejecutarlas

```bash
# Todas las pruebas de un microservicio
cd ms-usuario && mvn test

# Todas las pruebas del proyecto (desde la raíz)
mvn test
```

> Requiere **Java 21** (`export JAVA_HOME=$(/usr/libexec/java_home -v 21)`).

### Tipos de prueba

- **Tests de Service** (`*ServiceTest`): prueban la lógica de negocio aislada con
  `@Mock` (repositorios y clientes HTTP) e `@InjectMocks`. Cubren casos de éxito,
  errores con validación del mensaje de la excepción (`assertThatThrownBy(...).hasMessage(...)`),
  filtrados, cálculos y verificación de interacciones (`verify(...)`).
- **Tests de Controller** (`*ControllerTest`): usan `@WebMvcTest` + `MockMvc` con el
  service *mockeado* (`@MockBean`). Validan el código HTTP y el cuerpo JSON, tanto en
  respuestas exitosas (200) como en errores de validación `@Valid` (400, mensaje
  `"Validación fallida"` del `GlobalExceptionHandler`).
- **ArgumentCaptor**: en `ms-usuario` y `ms-venta` se captura la entidad enviada a
  `save(...)` para verificar que el service la **construye correctamente** (p. ej. que
  el `monto_total` calculado quedó persistido en la entidad `Venta`).

### Validación de la reorganización

Las pruebas de evento, ticket y venta incluyen catálogos locales, transiciones,
descuentos, pagos y migraciones con JDBC simulado. La ejecución real sobre Laragon
debe verificarse por separado. Los resultados se encuentran en `target/surefire-reports`.

---

## Solución de Problemas

### Migración de estados y promociones

Antes de iniciar la versión nueva, detener los servicios antiguos y respaldar las bases.
Conservar `estado_service` y `promocion_service` durante la migración en el mismo servidor.

- Evento V5, ticket V7 y venta V11 agregan la columna `estado` y convierten los IDs
  por nombre del catálogo anterior. Sin catálogo se utiliza la numeración estándar
  de las semillas; si se personalizaron IDs, restaurar el catálogo antes de migrar.
- Los estados desconocidos detienen la migración. Los valores nulos siguen nulos
  y deben revisarse antes de operar esos registros.
- Las columnas antiguas de IDs se conservan como respaldo; la aplicación usa
  la columna de texto y no vuelve a sincronizar las columnas antiguas.
- Venta V10 crea la tabla de promociones e importa las existentes, conservando sus IDs,
  desde `promocion_service.promocion`. Sin esa base crea un catálogo vacío.
  Si existen detalles con promociones sin respaldo, detiene la migración.
- El usuario de BD necesita permiso de lectura sobre las bases antiguas.
  Ninguna de ellas se borra automáticamente.
- Las migraciones usan DDL de MariaDB; si una ejecución falla después de crear una
  tabla, revisar el estado parcial antes de reparar Flyway y reintentar.

Los catálogos ya no dependen de un servicio HTTP de estados.
El campo `restriccion` de promociones sigue siendo descriptivo: validar condiciones
como banco o empresa requiere reglas estructuradas y datos adicionales del comprador.

### Error de compilación de Lombok (`TypeTag :: UNKNOWN`)

Ocurre si Maven usa un JDK más nuevo que el soportado por Lombok (p. ej. JDK 24).
El proyecto requiere **Java 21**. Usa el script `./start.sh` (que fuerza Java 21
automáticamente) o exporta el JDK correcto antes de compilar:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

### `Port 80xx was already in use`

Ya hay una instancia previa corriendo en ese puerto. Reinicia todo con:

```bash
./stop.sh && ./start.sh
```

---

## Estructura del Repositorio

```
ticketuki/
├── ms-gateway/     # API Gateway (:8080) — enrutamiento + validación JWT
├── ms-auth/        # Autenticación (:8011) — emite tokens JWT
├── ms-evento/
├── ms-historial/
├── ms-recinto/
├── ms-ticket/
├── ms-usuario/
└── ms-venta/
```

Cada módulo sigue la estructura estándar de Spring Boot:

```
ms-<nombre>/
└── src/main/java/com/ticketuki/<nombre>service/
    ├── controller/   # Endpoints REST
    ├── service/      # Lógica de negocio
    ├── repository/   # Acceso a datos (JPA)
    ├── model/        # Entidades JPA
    ├── dto/          # Objetos de transferencia de datos
    ├── exception/    # Manejo global de errores
    └── config/       # Configuraciones (WebClient, etc.)
```

---
