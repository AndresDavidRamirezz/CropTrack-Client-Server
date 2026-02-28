# CropTrack — Backend API

API RESTful construida con Express.js para el sistema de gestión agrícola CropTrack. Usa el patrón MVC con ES Modules, conexión a MySQL, autenticación JWT, upload de imágenes a Cloudinary y generación de reportes PDF.

---

## Índice

- [Scripts disponibles](#scripts-disponibles)
- [Variables de entorno](#variables-de-entorno)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Punto de entrada (index.js)](#punto-de-entrada-indexjs)
- [Dependencias](#dependencias)
- [Config](#config)
- [Rutas y endpoints completos](#rutas-y-endpoints-completos)
- [Middleware](#middleware)
- [Controllers](#controllers)
- [Models](#models)
- [Services](#services)
- [Esquema de base de datos](#esquema-de-base-de-datos)
- [Respuestas de la API](#respuestas-de-la-api)
- [Testing](#testing)

---

## Scripts disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Producción | `npm start` | `node index.js` |
| Desarrollo | `npm run dev` | `nodemon index.js` (hot reload) |
| Tests todos | `npm test` | Jest con `--detectOpenHandles` |
| Tests watch | `npm run test:watch` | Jest en modo observación |
| Tests unitarios | `npm run test:unit` | Solo `tests/unit/` |
| Tests unitarios + cobertura | `npm run test:unit:coverage` | Con reporte de cobertura |
| Tests integración | `npm run test:integration` | Solo `tests/integration/` (runInBand) |
| Tests integración + cobertura | `npm run test:integration:coverage` | Con reporte de cobertura |
| Tests todos + cobertura | `npm run test:all` | Todos con cobertura |
| Crear BD test | `npm run db:create-test` | Crea `croptrack_test` en MySQL local |
| Setup BD test | `npm run db:setup-test` | Ejecuta `database/schema.sql` en `croptrack_test` |

---

## Variables de entorno

Crear `server/.env` para desarrollo local (nunca se sube al repositorio):

```env
# Base de datos (Railway en producción, MySQL local en desarrollo)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=croptrack

# Servidor
PORT=4000

# JWT
JWT_SECRET=tu_secreto_seguro_aqui

# Cloudinary — obtener desde el dashboard de Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# CORS — URL del cliente (React) permitido
CLIENT_URL=http://localhost:3000
```

En Render (producción), estas variables se configuran en **Settings → Environment Variables**. El archivo `.env` no se deployea.

---

## Estructura de carpetas

```
server/
├── index.js                      # Entry point: app, middlewares globales, rutas
├── package.json
├── jest.config.js                # Configuración Jest con Babel para ES Modules
│
├── config/
│   ├── dbConfig.js               # Configura express-myconnection con MySQL2
│   └── cloudinaryConfig.js       # Inicializa el SDK de Cloudinary v2
│
├── controllers/
│   ├── registerController.js     # POST /api/register/register-admin
│   ├── loginController.js        # POST /api/auth/login
│   ├── cropController.js         # CRUD cosechas + upload/delete imagen
│   ├── cropWorkerController.js   # GET/PUT workers asignados a una cosecha
│   ├── measurementController.js  # CRUD mediciones
│   ├── taskController.js         # CRUD tareas + upload/delete imagen
│   ├── userController.js         # CRUD trabajadores/supervisores + upload/delete imagen
│   └── reportController.js       # GET reporte JSON / GET reporte PDF
│
├── middleware/
│   ├── authMiddleware.js         # Verifica JWT (Bearer token)
│   ├── generateId.js             # Inyecta UUID v4 en req.body.id
│   ├── validate.js               # Validación registro de admin
│   ├── validateLogin.js          # Validación login
│   ├── validateCrop.js           # Validación creación/edición de cosecha
│   ├── validateMeasurement.js    # Validación creación/edición de medición
│   ├── validateTask.js           # Validación creación/edición de tarea
│   ├── validateUser.js           # Validación creación de trabajador/supervisor
│   └── validateUserUpdate.js     # Validación actualización de usuario/perfil
│
├── models/
│   ├── userModel.js              # Queries de users (admin + worker)
│   ├── cropModel.js              # Queries de crops
│   ├── cropWorkerModel.js        # Queries de crop_workers (tabla pivote)
│   ├── measurementModel.js       # Queries de measurements
│   ├── taskModel.js              # Queries de tasks
│   └── reportModel.js            # Queries agregadas para reportes (JOINs)
│
├── routes/
│   ├── registerRoutes.js
│   ├── loginRoutes.js
│   ├── cropRoutes.js
│   ├── cropWorkerRoutes.js
│   ├── measurementRoutes.js
│   ├── taskRoutes.js
│   ├── userRoutes.js
│   └── reportRoutes.js
│
├── services/
│   ├── multerService.js          # Multer + CloudinaryStorage para uploads
│   └── reportServices.js         # PDFKit + chartjs-node-canvas → buffer PDF
│
├── database/
│   └── schema.sql                # DDL completo de la base de datos
│
└── tests/
    ├── unit/
    │   ├── controllers/
    │   │   ├── loginController.test.js
    │   │   └── registerController.test.js
    │   ├── models/
    │   │   └── userModel.test.js
    │   └── middleware/
    │       ├── validate.test.js
    │       ├── validateLogin.test.js
    │       └── generateId.test.js
    ├── integration/
    │   ├── loginFlow.integration.test.js
    │   └── registerFlow.integration.test.js
    └── setup/
        └── testDbConfig.js
```

---

## Punto de entrada (index.js)

`index.js` es el arranque de la aplicación. Hace en orden:

1. **`import 'dotenv/config'`** — debe ser el primer import para que las variables de entorno estén disponibles antes de que cualquier otro módulo las lea
2. Configura CORS con `process.env.CLIENT_URL` como origen permitido
3. Registra `express.json()` para parsear bodies JSON
4. Llama `dbConnection(app)` que inyecta el middleware `express-myconnection`
5. Registra todas las rutas bajo `/api`
6. Define el handler 404 y el error handler global

### Orden de registro de rutas

`cropWorkerRoutes` se registra **antes** que `cropRoutes` en el mismo path `/api/crops` para evitar que el parámetro `/:id` de cropRoutes capture el segmento `/:cropId/workers`:

```javascript
app.use('/api/crops', cropWorkerRoutes);  // GET/PUT /:cropId/workers
app.use('/api/crops', cropRoutes);        // CRUD /:id
```

### Error handler global

```javascript
app.use((err, req, res, next) => {
  const errorDetail = err?.stack || err?.message || JSON.stringify(err);
  console.error('❌ Error global:', errorDetail);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

---

## Dependencias

### Producción

| Dependencia | Versión | Descripción |
|-------------|---------|-------------|
| `express` | ^4.18.2 | Framework web HTTP |
| `express-myconnection` | ^1.0.4 | Inyecta conexión MySQL en `req` por cada request |
| `express-validator` | ^7.3.1 | Validación y sanitización declarativa de inputs |
| `express-rate-limit` | ^7.1.5 | Limitación de peticiones por IP (protección brute force) |
| `cors` | ^2.8.5 | Configuración CORS con origin dinámico |
| `dotenv` | ^16.3.1 | Carga variables desde `.env` en desarrollo |
| `helmet` | ^7.1.0 | Headers de seguridad HTTP (CSP, HSTS, etc.) |
| `bcryptjs` | ^3.0.3 | Hash de contraseñas — implementación JS puro |
| `jsonwebtoken` | ^9.0.2 | Generación y verificación de JWT |
| `multer` | ^1.4.5-lts.1 | Middleware para uploads `multipart/form-data` |
| `multer-storage-cloudinary` | ^4.0.0 | Storage engine que sube directamente a Cloudinary |
| `cloudinary` | ^1.41.3 | SDK de Cloudinary v2 (gestión de imágenes) |
| `mysql2` | ^3.16.1 | Driver MySQL rápido (usado por express-myconnection) |
| `pdfkit` | ^0.17.2 | Generación de documentos PDF en Node.js |
| `chartjs-node-canvas` | ^5.0.0 | Renderiza gráficos Chart.js en Node (canvas virtual) |
| `chart.js` | ^4.5.1 | Librería de gráficos (requerida por chartjs-node-canvas) |
| `uuid` | ^13.0.0 | Generación de IDs únicos (UUIDv4) |
| `winston` | ^3.11.0 | Logger con niveles y transportes configurables |

### Desarrollo

| Dependencia | Versión | Descripción |
|-------------|---------|-------------|
| `nodemon` | ^3.0.2 | Reinicio automático en desarrollo al detectar cambios |
| `jest` | ^29.7.0 | Framework de testing |
| `@types/jest` | ^30.0.0 | Tipos TypeScript para autocompletado Jest |
| `babel-jest` | ^30.2.0 | Transformador Babel para que Jest procese ES Modules |
| `@babel/core` | ^7.29.0 | Compilador Babel |
| `@babel/preset-env` | ^7.29.0 | Preset para transformar ES Modules a CommonJS en tests |
| `@babel/plugin-transform-runtime` | ^7.29.0 | Soporte async/await en tests |
| `supertest` | ^6.3.4 | Realiza requests HTTP a la app Express en tests |
| `cross-env` | ^10.1.0 | Define `NODE_ENV` de forma cross-platform |
| `nyc` | ^17.1.0 | Reporte de cobertura de código |

---

## Config

### `config/dbConfig.js`

Configura `express-myconnection` para inyectar la conexión MySQL en cada request. Usa el modo `'single'` (una conexión compartida por request).

```javascript
import myConnection from 'express-myconnection';
import mysql from 'mysql2';

const dbOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

app.use(myConnection(mysql, dbOptions, 'single'));
```

**Uso en controllers:**
```javascript
req.getConnection((err, conn) => {
  conn.query('SELECT * FROM crops WHERE id = ?', [id], callback);
});
```

### `config/cloudinaryConfig.js`

Inicializa el SDK de Cloudinary v2 con las credenciales del entorno:

```javascript
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
export default cloudinary;
```

---

## Rutas y endpoints completos

### Autenticación

| Método | Endpoint | Middleware | Descripción |
|--------|----------|------------|-------------|
| `POST` | `/api/register/register-admin` | `validate`, `generateId` | Registra un nuevo administrador |
| `POST` | `/api/auth/login` | `validateLogin` | Login; devuelve JWT + datos del usuario |

### Cosechas — `/api/crops`

| Método | Endpoint | Middleware | Descripción |
|--------|----------|------------|-------------|
| `POST` | `/api/crops` | `generateId`, `validateCrop` | Crea una nueva cosecha |
| `GET` | `/api/crops/user/:userId` | — | Lista cosechas del usuario creador |
| `GET` | `/api/crops/:id` | — | Obtiene una cosecha por ID |
| `PUT` | `/api/crops/:id` | — | Actualiza datos de una cosecha |
| `DELETE` | `/api/crops/:id` | — | Elimina una cosecha |
| `PUT` | `/api/crops/:id/image` | `multer (crops)` | Sube o actualiza la imagen de la cosecha |
| `DELETE` | `/api/crops/:id/image` | — | Elimina la imagen de la cosecha |

### Asignación de personal — `/api/crops/:cropId/workers`

| Método | Endpoint | Middleware | Descripción |
|--------|----------|------------|-------------|
| `GET` | `/api/crops/:cropId/workers` | — | Lista el personal asignado a la cosecha. Acepta `?rol=supervisor` o `?rol=trabajador` para filtrar por rol |
| `PUT` | `/api/crops/:cropId/workers` | — | Reemplaza toda la asignación de personal. Body: `{ workerIds: [uuid, ...] }` |

### Mediciones — `/api/measurements`

| Método | Endpoint | Middleware | Descripción |
|--------|----------|------------|-------------|
| `POST` | `/api/measurements` | `generateId`, `validateMeasurement` | Crea una nueva medición |
| `GET` | `/api/measurements/user/:userId` | — | Mediciones del usuario (con nombre de cosecha) |
| `GET` | `/api/measurements/crop/:cropId` | — | Mediciones de una cosecha específica |
| `GET` | `/api/measurements/:id` | — | Obtiene una medición por ID |
| `PUT` | `/api/measurements/:id` | — | Actualiza una medición |
| `DELETE` | `/api/measurements/:id` | — | Elimina una medición |

### Tareas — `/api/tasks`

| Método | Endpoint | Middleware | Descripción |
|--------|----------|------------|-------------|
| `POST` | `/api/tasks` | `generateId`, `validateTask` | Crea una nueva tarea |
| `GET` | `/api/tasks/user/:userId` | — | Tareas creadas por el usuario |
| `GET` | `/api/tasks/assigned/:userId` | — | Tareas asignadas al usuario |
| `GET` | `/api/tasks/crop/:cropId` | — | Tareas de una cosecha |
| `GET` | `/api/tasks/:id` | — | Obtiene una tarea por ID |
| `PUT` | `/api/tasks/:id` | — | Actualiza una tarea |
| `DELETE` | `/api/tasks/:id` | — | Elimina una tarea |
| `PUT` | `/api/tasks/:id/image` | `multer (tasks)` | Sube o actualiza la imagen de la tarea |
| `DELETE` | `/api/tasks/:id/image` | — | Elimina la imagen de la tarea |

### Usuarios/Trabajadores — `/api/users`

| Método | Endpoint | Middleware | Descripción |
|--------|----------|------------|-------------|
| `POST` | `/api/users` | `generateId`, `validateUser` | Crea un trabajador o supervisor (no admin) |
| `GET` | `/api/users/empresa/:empresa` | — | Lista trabajadores/supervisores de una empresa |
| `GET` | `/api/users/:id` | — | Obtiene un usuario por ID (sin `password_hash`) |
| `PUT` | `/api/users/:id` | `validateUserUpdate` | Actualiza datos del usuario |
| `DELETE` | `/api/users/:id` | — | Elimina un usuario |
| `PUT` | `/api/users/:id/image` | `multer (users)` | Sube o actualiza la foto de perfil |
| `DELETE` | `/api/users/:id/image` | — | Elimina la foto de perfil |

### Reportes — `/api/reports`

| Método | Endpoint | Middleware | Descripción |
|--------|----------|------------|-------------|
| `GET` | `/api/reports/:cropId/data` | — | Devuelve los datos del reporte como JSON (útil para debug) |
| `GET` | `/api/reports/:cropId` | — | Genera y devuelve el PDF como buffer (`application/pdf`) |

El PDF tiene `Content-Disposition: attachment; filename="reporte-{nombre}-{cropId}.pdf"` y el campo `info.Title` del PDF coincide con ese nombre para que el navegador muestre el nombre correcto al imprimir.

---

## Middleware

### `authMiddleware.js` — Verificación JWT

Extrae el token del header `Authorization: Bearer <token>`, lo verifica con `JWT_SECRET` y coloca el payload en `req.user`. Devuelve:
- `401` si no hay token o expiró
- `403` si el token es inválido

### `generateId.js` — Generación de ID

Se ejecuta antes del controller en todos los endpoints de creación. Genera un UUID v4 y lo inyecta en `req.body.id` para que el controller lo use como clave primaria.

```javascript
export const generateId = (req, res, next) => {
  req.body.id = uuidv4();
  next();
};
```

### `validate.js` — Validación de registro de admin

| Campo | Reglas |
|-------|--------|
| `usuario` | Obligatorio, 3-50 chars, alfanumérico + guion bajo |
| `contrasena` | Obligatorio, 6-100 chars |
| `nombre` | Obligatorio, 2-100 chars, solo letras, tildes y espacios |
| `apellido` | Obligatorio, 2-100 chars, solo letras, tildes y espacios |
| `email` | Obligatorio, formato email válido, normalizado a minúsculas |
| `nombre_empresa` | Obligatorio, 2-100 chars |
| `telefono` | Opcional, max 20 chars, solo dígitos y caracteres telefónicos |

### `validateLogin.js` — Validación de login

| Campo | Reglas |
|-------|--------|
| `usuario` | Obligatorio, 3-50 chars |
| `contrasena` | Obligatorio, min 6 chars |
| `rol` | Opcional. Si se envía: `administrador`, `supervisor` o `trabajador` |

### `validateCrop.js` — Validación de cosechas

| Campo | Reglas |
|-------|--------|
| `nombre` | Obligatorio, 2-100 chars |
| `empresa` | Obligatorio, 2-100 chars |
| `tipo` | Obligatorio, 2-50 chars |
| `variedad` | Opcional, max 100 chars |
| `area_hectareas` | Opcional, decimal ≥ 0 |
| `ubicacion` | Opcional, max 200 chars |
| `fecha_siembra` | Opcional, ISO 8601 |
| `fecha_cosecha_estimada` | Opcional, ISO 8601, debe ser ≥ `fecha_siembra` |
| `fecha_cosecha_real` | Opcional, ISO 8601 |
| `estado` | Opcional: `planificado`, `sembrado`, `en_crecimiento`, `maduro`, `cosechado`, `cancelado` |
| `notas` | Opcional, max 5000 chars |

### `validateMeasurement.js` — Validación de mediciones

| Campo | Reglas |
|-------|--------|
| `cultivo_id` | Obligatorio, UUID 36 chars |
| `usuario_id` | Opcional, UUID 36 chars |
| `tipo_medicion` | Obligatorio, 2-50 chars |
| `valor` | Obligatorio, número decimal |
| `unidad` | Obligatorio, 1-20 chars |
| `fecha_medicion` | Opcional, ISO 8601 |
| `observaciones` | Opcional, max 5000 chars |

### `validateTask.js` — Validación de tareas

| Campo | Reglas |
|-------|--------|
| `empresa` | Obligatorio, 2-100 chars |
| `creado_por` | Obligatorio, UUID 36 chars |
| `titulo` | Obligatorio, 3-150 chars |
| `cultivo_id` | Opcional, UUID 36 chars |
| `asignado_a` | Opcional, UUID 36 chars |
| `descripcion` | Opcional, max 5000 chars |
| `prioridad` | Opcional: `baja`, `media`, `alta`, `urgente` |
| `estado` | Opcional: `pendiente`, `en_proceso`, `completada`, `cancelada` |
| `fecha_inicio` | Opcional, ISO 8601 |
| `fecha_limite` | Opcional, ISO 8601, debe ser ≥ `fecha_inicio` |
| `observaciones` | Opcional, max 5000 chars |

### `validateUser.js` — Validación de creación de trabajador

Igual que `validate.js` pero el campo `rol` es obligatorio y solo acepta `trabajador` o `supervisor` (no `administrador`).

### `validateUserUpdate.js` — Validación de actualización de perfil

Todos los campos son opcionales. No se permite modificar: `id`, `nombre_usuario`, `usuario`, `empresa`, `rol`, `imagen_url`. Si se envía `contrasena`, mínimo 6 chars.

---

## Controllers

### `registerController.js` — `createAdmin`

**Flujo:**
1. Lee datos del body (usuario, contraseña, nombre, apellido, email, nombre_empresa, telefono)
2. Verifica que `nombre_usuario` no exista en BD → 400 si existe
3. Verifica que `email` no exista en BD → 400 si existe
4. Hashea la contraseña con bcryptjs (10 salt rounds)
5. Inserta en tabla `users` con `rol = 'administrador'`
6. Responde 201 con `{ userId, usuario }`

### `loginController.js` — `login`

**Flujo:**
1. Busca el usuario en BD por `nombre_usuario`
2. Si se envió `rol`, valida que coincida con el rol en BD → 403 si no coincide
3. Compara contraseña con `bcrypt.compare` → 401 si no coincide
4. Actualiza `ultimo_acceso` en BD
5. Genera JWT con payload `{ id, usuario, rol, email }` y expira en 7 días
6. Responde 200 con `{ token, user: { ...datos completos } }`

### `cropController.js`

| Función | Descripción |
|---------|-------------|
| `createCrop` | Inserta cosecha con ID generado por `generateId` |
| `getCropsByUser` | Devuelve todas las cosechas del usuario, ORDER BY `created_at DESC` |
| `getCropById` | Devuelve una cosecha por ID, 404 si no existe |
| `updateCrop` | Actualiza campos enviados en el body |
| `deleteCrop` | Elimina la cosecha, 404 si no existe |
| `uploadImage` | Recibe el archivo procesado por multer (`req.file.path` = URL de Cloudinary), actualiza `imagen_url` en BD |
| `deleteImage` | Obtiene la URL actual, la borra de Cloudinary con `multerService.deleteFile`, pone `null` en BD |

### `cropWorkerController.js`

| Función | Descripción |
|---------|-------------|
| `getCropWorkers` | Lee `?rol` de query params, llama `CropWorkerModel.findByCrop` con filtro de rol opcional |
| `setCropWorkers` | Recibe `{ workerIds: [uuid, ...] }`, elimina asignaciones anteriores e inserta las nuevas en `crop_workers` |

### `measurementController.js`

| Función | Descripción |
|---------|-------------|
| `createMeasurement` | Inserta medición con ID generado |
| `getMeasurementsByUser` | Mediciones del usuario con JOIN a `crops` para incluir nombre del cultivo |
| `getMeasurementsByCrop` | Mediciones de una cosecha específica |
| `getMeasurementById` | Una medición con JOIN a `crops` |
| `updateMeasurement` | Actualiza campos (protege `id`, `usuario_id`, `created_at`) |
| `deleteMeasurement` | Elimina la medición |

### `taskController.js`

| Función | Descripción |
|---------|-------------|
| `createTask` | Inserta tarea con ID generado |
| `getTasksByUser` | Tareas donde `creado_por = userId` |
| `getTasksByAssignee` | Tareas donde `asignado_a = userId` |
| `getTasksByCrop` | Tareas de una cosecha |
| `getTaskById` | Una tarea por ID |
| `updateTask` | Actualiza campos. **Lógica especial**: si `estado = 'completada'` y no se envió `fecha_completada`, se agrega automáticamente la fecha actual |
| `deleteTask` | Elimina la tarea |
| `uploadImage` | Igual que en crops: guarda URL de Cloudinary en BD |
| `deleteImage` | Borra de Cloudinary y pone `null` en BD |

### `userController.js`

| Función | Descripción |
|---------|-------------|
| `createUser` | Crea trabajador o supervisor (rechaza `rol = 'administrador'` con 400) |
| `getUsersByEmpresa` | Lista usuarios de la empresa (excluye admins al consultar desde WorkerPage) |
| `getUserById` | Devuelve usuario sin `password_hash` |
| `updateUser` | Si se cambia `email`, verifica que no exista en otro usuario. Si se envía `contrasena`, la hashea antes de guardar |
| `deleteUser` | Elimina el usuario |
| `uploadImage` | Guarda URL de Cloudinary en BD |
| `deleteImage` | Borra de Cloudinary y pone `null` en BD |

### `reportController.js`

| Función | Descripción |
|---------|-------------|
| `generateCropReport` | Ejecuta 4 queries en secuencia (cosecha + admin, trabajadores, tareas, mediciones), construye el objeto `reportData` y llama a `reportService.generatePDF`. Devuelve el buffer como `application/pdf` con `Content-Disposition: attachment` |
| `getCropReportData` | Mismas 4 queries, devuelve `reportData` como JSON (útil para debug sin generar PDF) |

---

## Models

Todos los modelos usan el patrón de callbacks `(err, result)` ya que `express-myconnection` provee una conexión con la API de callbacks de `mysql2`.

### Patrón general

```javascript
class Model {
  static create(conn, data, callback) { ... }
  static findBy*(conn, param, callback) { ... }
  static update(conn, id, data, callback) { ... }
  static delete(conn, id, callback) { ... }
}
```

### `userModel.js`

**Métodos admin:**

| Método | Query | Descripción |
|--------|-------|-------------|
| `findByUsername(conn, nombre_usuario, cb)` | `SELECT * FROM users WHERE nombre_usuario = ?` | Busca por username (incluye `password_hash`) |
| `findByEmail(conn, email, cb)` | `SELECT * FROM users WHERE email = ?` | Verifica duplicados de email |
| `createAdmin(conn, userData, cb)` | `INSERT INTO users ...` | Inserta admin con `rol = 'administrador'` |
| `findById(conn, id, cb)` | `SELECT * FROM users WHERE id = ?` | Para JWT y lógica interna |
| `updateLastAccess(conn, userId, cb)` | `UPDATE users SET ultimo_acceso = NOW() ...` | Se llama en cada login exitoso |

**Métodos worker:**

| Método | Descripción |
|--------|-------------|
| `createWorker(conn, userData, cb)` | Inserta usuario con rol `trabajador` o `supervisor` |
| `findWorkerByUsername(conn, username, cb)` | Verifica username único al crear |
| `findWorkerByEmail(conn, email, cb)` | Verifica email único al crear |
| `findWorkerByEmpresa(conn, empresa, cb)` | Lista todos los no-admin de la empresa, ORDER BY `created_at DESC` |
| `findWorkerByIdSafe(conn, id, cb)` | Devuelve usuario **sin** `password_hash` |
| `updateWorker(conn, id, data, cb)` | Actualiza campos permitidos; protege `id`, `nombre_usuario`, `empresa`, `rol`, `created_at` |
| `deleteWorker(conn, id, cb)` | `DELETE FROM users WHERE id = ?` |
| `updateImageUrl(conn, id, url, cb)` | `UPDATE users SET imagen_url = ? WHERE id = ?` |
| `getImageUrl(conn, id, cb)` | Devuelve solo el campo `imagen_url` |
| `findWorkerByEmailExcludingId(conn, email, id, cb)` | Verifica email único al actualizar (excluye al propio usuario) |

### `cropModel.js`

| Método | Descripción |
|--------|-------------|
| `create(conn, cropData, cb)` | `INSERT INTO crops ...` |
| `findByUser(conn, userId, cb)` | Cosechas del usuario, ORDER BY `created_at DESC` |
| `findById(conn, id, cb)` | Una cosecha por ID |
| `update(conn, id, data, cb)` | Actualiza campos; protege `id`, `usuario_creador_id`, `empresa`, `created_at` |
| `delete(conn, id, cb)` | Elimina la cosecha (CASCADE elimina mediciones y pone NULL en tareas) |
| `updateImageUrl(conn, id, url, cb)` | Actualiza `imagen_url` |
| `getImageUrl(conn, id, cb)` | Devuelve `imagen_url` actual |

### `cropWorkerModel.js`

| Método | Descripción |
|--------|-------------|
| `findByCrop(conn, cropId, cb, rol = null)` | `SELECT u.id, u.nombre, u.apellido, u.rol, u.imagen_url FROM crop_workers JOIN users ...`. Si `rol` no es `null`, agrega `AND u.rol = ?` |
| `setByCrop(conn, cropId, userIds, cb)` | `DELETE FROM crop_workers WHERE cultivo_id = ?` + `INSERT INTO crop_workers (id, cultivo_id, usuario_id) VALUES ?` con UUIDs nuevos |
| `deleteByCrop(conn, cropId, cb)` | Elimina todas las asignaciones de una cosecha |

### `measurementModel.js`

| Método | Descripción |
|--------|-------------|
| `create(conn, data, cb)` | Inserta medición |
| `findByUser(conn, userId, cb)` | Mediciones con JOIN a `crops` para nombre del cultivo |
| `findByCrop(conn, cropId, cb)` | Mediciones de una cosecha ORDER BY `fecha_medicion DESC` |
| `findById(conn, id, cb)` | Una medición con JOIN a `crops` |
| `update(conn, id, data, cb)` | Actualiza; protege `id`, `usuario_id`, `created_at` |
| `delete(conn, id, cb)` | Elimina la medición |

### `taskModel.js`

| Método | Descripción |
|--------|-------------|
| `create(conn, data, cb)` | Inserta tarea |
| `findByUser(conn, userId, cb)` | Tareas creadas por el usuario |
| `findByAssignee(conn, userId, cb)` | Tareas asignadas al usuario |
| `findByCrop(conn, cropId, cb)` | Tareas de una cosecha |
| `findById(conn, id, cb)` | Una tarea por ID |
| `update(conn, id, data, cb)` | Actualiza; protege `id`, `creado_por`, `empresa`, `created_at` |
| `delete(conn, id, cb)` | Elimina la tarea |
| `updateImageUrl(conn, id, url, cb)` | Actualiza `imagen_url` |
| `getImageUrl(conn, id, cb)` | Devuelve `imagen_url` actual |

### `reportModel.js`

Queries específicas para reportes, con JOINs a múltiples tablas:

| Método | Descripción |
|--------|-------------|
| `findCropWithCreator(conn, cropId, cb)` | Cosecha + datos completos del admin (`admin_nombre`, `admin_apellido`, `admin_email`, `admin_empresa`, `admin_telefono`, `admin_imagen_url`) vía JOIN a `users` |
| `findWorkersByCrop(conn, cropId, cb)` | Personal asignado a la cosecha vía `crop_workers` JOIN `users` |
| `findTasksByCrop(conn, cropId, cb)` | Tareas de la cosecha con nombre del asignado vía LEFT JOIN a `users` |
| `findMeasurementsByCrop(conn, cropId, cb)` | Mediciones con nombre del supervisor vía LEFT JOIN a `users` |

---

## Services

### `multerService.js`

Gestiona los uploads de imágenes a Cloudinary. Exporta dos funciones:

**`createUpload(subfolder)`**

Devuelve una instancia de multer configurada con `CloudinaryStorage`. El `public_id` se fija al UUID de la entidad (`req.params.id`) con `overwrite: true`, lo que garantiza que actualizar la imagen sobreescriba la anterior sin dejar archivos huérfanos en Cloudinary.

```javascript
createUpload('crops')  // → guarda en croptrack/crops/{uuid}
createUpload('tasks')  // → guarda en croptrack/tasks/{uuid}
createUpload('users')  // → guarda en croptrack/users/{uuid}
```

- Formatos permitidos: `jpg`, `jpeg`, `png`, `gif`, `webp`
- Tamaño máximo: 5 MB
- La URL resultante (`req.file.path`) es la URL pública de Cloudinary

**`deleteFile(imageUrl)`**

Extrae el `public_id` de la URL de Cloudinary con regex y llama a `cloudinary.uploader.destroy(publicId)`. Se usa en los endpoints `DELETE /:id/image`.

### `reportServices.js`

Genera el PDF completo de un reporte de cosecha. Es la parte más compleja del servidor.

**`generatePDF(reportData, callback)`**

Recibe el objeto `reportData` construido por el controller (cosecha, administrador, trabajadores, tareas, mediciones) y devuelve un buffer con el PDF a través del callback.

**Estructura del PDF (A4, márgenes 40pt):**

| Sección | Contenido |
|---------|-----------|
| Header | Logo de CropTrack, nombre del sistema, franja verde, nombre de la cosecha, empresa y fecha de generación |
| Resumen ejecutivo | Grid 2x2 con métricas: total de tareas, mediciones, trabajadores asignados y área en hectáreas |
| Detalles del cultivo | Tabla de 2 columnas con todos los campos de la cosecha (tipo, variedad, ubicación, fechas, estado, notas) |
| Trabajadores asignados | Lista con nombre, apellido y rol de cada trabajador/supervisor asignado |
| Tareas | Tabla con título, estado (con color), prioridad y fecha límite de cada tarea |
| Mediciones | Tabla con tipo, valor, unidad, fecha y supervisor de cada medición |
| Análisis de tareas | Gráfico de barras (distribución por estado) + gráfico de torta (distribución por prioridad) |
| Gráficos de mediciones | Gráficos de barras agrupados por tipo de medición |
| Footer (todas las páginas) | Número de página y total |

**Detalles técnicos:**
- `bufferPages: true` permite al PDFKit numerar páginas al final (requiere iterar con `switchToPage`)
- `ChartJSNodeCanvas` crea un canvas virtual en Node (bindings Cairo) — se instancia una sola vez globalmente para evitar fugas de memoria
- Los gráficos se renderizan como PNG con `renderToBuffer(config)` y se insertan en el PDF con `doc.image(buffer, x, y, options)`
- El `info.Title` del PDF usa el mismo formato del `Content-Disposition` header: `reporte-{safeName}-{cropId}`, lo que hace que Chrome muestre el nombre correcto al imprimir desde el visor de PDFs

---

## Esquema de base de datos

### Tabla: `users`

```sql
CREATE TABLE users (
  id              VARCHAR(36)  PRIMARY KEY,
  nombre_usuario  VARCHAR(50)  UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  nombre          VARCHAR(100) NOT NULL,
  apellido        VARCHAR(100) NOT NULL,
  email           VARCHAR(100) UNIQUE NOT NULL,
  empresa         VARCHAR(100) NOT NULL,
  telefono        VARCHAR(20),
  rol             ENUM('administrador','supervisor','trabajador') DEFAULT 'administrador',
  imagen_url      VARCHAR(255),
  ultimo_acceso   TIMESTAMP    NULL,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `crops`

```sql
CREATE TABLE crops (
  id                      VARCHAR(36)   PRIMARY KEY,
  empresa                 VARCHAR(100)  NOT NULL,
  usuario_creador_id      VARCHAR(36)   NOT NULL,
  nombre                  VARCHAR(100)  NOT NULL,
  tipo                    VARCHAR(50)   NOT NULL,
  variedad                VARCHAR(100),
  area_hectareas          DECIMAL(10,2),
  ubicacion               VARCHAR(200),
  fecha_siembra           DATE,
  fecha_cosecha_estimada  DATE,
  fecha_cosecha_real      DATE,
  estado                  ENUM('planificado','sembrado','en_crecimiento','maduro','cosechado','cancelado') DEFAULT 'planificado',
  notas                   TEXT,
  imagen_url              VARCHAR(255),
  created_at              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_creador_id) REFERENCES users(id)
);
```

### Tabla: `measurements`

```sql
CREATE TABLE measurements (
  id              VARCHAR(36)   PRIMARY KEY,
  cultivo_id      VARCHAR(36)   NOT NULL,
  usuario_id      VARCHAR(36),
  tipo_medicion   VARCHAR(50)   NOT NULL,
  valor           DECIMAL(10,2) NOT NULL,
  unidad          VARCHAR(20)   NOT NULL,
  fecha_medicion  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  observaciones   TEXT,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cultivo_id) REFERENCES crops(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES users(id)
);
```

### Tabla: `tasks`

```sql
CREATE TABLE tasks (
  id               VARCHAR(36)  PRIMARY KEY,
  empresa          VARCHAR(100) NOT NULL,
  cultivo_id       VARCHAR(36),
  creado_por       VARCHAR(36)  NOT NULL,
  asignado_a       VARCHAR(36),
  titulo           VARCHAR(150) NOT NULL,
  descripcion      TEXT,
  prioridad        ENUM('baja','media','alta','urgente')            DEFAULT 'media',
  estado           ENUM('pendiente','en_proceso','completada','cancelada') DEFAULT 'pendiente',
  fecha_inicio     DATE,
  fecha_limite     DATE,
  fecha_completada TIMESTAMP    NULL,
  observaciones    TEXT,
  imagen_url       VARCHAR(255),
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cultivo_id)  REFERENCES crops(id) ON DELETE SET NULL,
  FOREIGN KEY (creado_por)  REFERENCES users(id),
  FOREIGN KEY (asignado_a)  REFERENCES users(id)
);
```

### Tabla: `crop_workers`

```sql
CREATE TABLE crop_workers (
  id          VARCHAR(36) PRIMARY KEY,
  cultivo_id  VARCHAR(36) NOT NULL,
  usuario_id  VARCHAR(36) NOT NULL,
  FOREIGN KEY (cultivo_id) REFERENCES crops(id)  ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES users(id)  ON DELETE CASCADE,
  UNIQUE KEY uq_crop_user (cultivo_id, usuario_id)
);
```

---

## Respuestas de la API

### Creación exitosa (201)
```json
{ "message": "Recurso creado correctamente", "id": "uuid" }
```

### Login exitoso (200)
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid", "usuario": "admin1", "nombre": "Ana", "apellido": "García",
    "email": "ana@empresa.com", "empresa": "AgroSur", "telefono": "123",
    "rol": "administrador", "imagen_url": null, "ultimo_acceso": "...", "created_at": "..."
  }
}
```

### Error de validación (400)
```json
{
  "message": "Error de validacion",
  "errors": [{ "field": "email", "message": "Email invalido", "value": "abc" }]
}
```

### No autenticado (401) / No autorizado (403)
```json
{ "message": "Usuario o contrasena incorrectos" }
{ "message": "Este usuario no tiene permisos de administrador" }
```

### No encontrado (404)
```json
{ "error": "Cosecha no encontrada" }
```

### Error de servidor (500)
```json
{ "error": "Error de conexion con la base de datos" }
```

---

## Testing

### Tests unitarios

**`loginController.test.js`** (~30 tests)
- Error de conexión BD → 500
- Usuario no encontrado → 401
- Contraseña incorrecta → 401
- Rol incorrecto → 403
- Login exitoso: valida formato JWT, payload correcto
- Actualización de `ultimo_acceso`

**`registerController.test.js`** (~40 tests)
- Username duplicado → 400
- Email duplicado → 400
- Hash de contraseña con bcrypt (10 rounds)
- Registro exitoso → 201 con UUID
- Normalización de email a minúsculas
- Mapeo de campos: `nombre_empresa` → `empresa`

**`userModel.test.js`** (~70 tests)
- Todos los métodos admin y worker con mocks de `conn.query`
- Manejo de errores en cada método
- Resultados vacíos, resultados con datos

**`validate.test.js`** / **`validateLogin.test.js`** (~60 tests combinados)
- Validación exitosa con todos los campos
- Cada campo inválido devuelve el error correcto
- Múltiples errores en un solo request

### Tests de integración

Requieren la base de datos `croptrack_test`. Se ejecutan con `--runInBand` (secuencial).

**`loginFlow`** (~25 tests): Flujo completo Route → Middleware → Controller → Model → BD → respuesta HTTP con JWT real

**`registerFlow`** (~100 tests): Registro completo, verificación de datos en BD, casos de duplicados, normalización de email

### Ejecutar tests

```bash
npm test                        # Todos
npm run test:unit               # Solo unitarios
npm run test:unit:coverage      # Unitarios con cobertura HTML
npm run test:integration        # Integración (requiere BD test)
npm run test:all                # Todo con cobertura
```

---

*CropTrack Backend API — Express.js © 2026*
