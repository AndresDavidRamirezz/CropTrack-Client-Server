# CropTrack - Backend API

API RESTful con Express.js para el sistema de gestion agricola CropTrack.

---

## Tecnologias

| Tecnologia | Version | Descripcion |
|------------|---------|-------------|
| Node.js | 18+ | Runtime JavaScript |
| Express | 4.18.2 | Framework web |
| MySQL | 8.0+ | Base de datos |
| JWT | 9.0.2 | Autenticacion |
| bcryptjs | 3.0.3 | Hash de contrasenas |
| Jest | 29.7.0 | Testing unitario e integracion |
| Supertest | 6.3.4 | Testing de endpoints HTTP |

---

## Dependencias

### Produccion

| Dependencia | Version | Descripcion |
|-------------|---------|-------------|
| express | ^4.18.2 | Framework web HTTP |
| express-myconnection | ^1.0.4 | Inyeccion de conexion MySQL por request |
| express-validator | ^7.3.1 | Validacion y sanitizacion de inputs |
| express-rate-limit | ^7.1.5 | Limitacion de peticiones por IP |
| cors | ^2.8.5 | Configuracion de Cross-Origin Resource Sharing |
| dotenv | ^16.3.1 | Variables de entorno desde archivo .env |
| helmet | ^7.1.0 | Headers de seguridad HTTP |
| bcrypt | ^5.1.1 | Hash de contrasenas (nativo) |
| bcryptjs | ^3.0.3 | Hash de contrasenas (JavaScript puro) |
| jsonwebtoken | ^9.0.2 | Generacion y verificacion de JWT |
| multer | ^1.4.5-lts.1 | Manejo de uploads multipart/form-data |
| uuid | ^13.0.0 | Generacion de identificadores unicos UUID v4 |
| winston | ^3.11.0 | Logger con niveles y transportes |

### Desarrollo

| Dependencia | Version | Descripcion |
|-------------|---------|-------------|
| jest | ^29.7.0 | Framework de testing |
| @types/jest | ^30.0.0 | Tipos TypeScript para autocompletado Jest |
| babel-jest | ^30.2.0 | Transformador Babel para Jest |
| @babel/core | ^7.29.0 | Compilador Babel (core) |
| @babel/preset-env | ^7.29.0 | Preset de Babel para ES modules |
| @babel/plugin-transform-runtime | ^7.29.0 | Plugin para async/await en tests |
| @babel/runtime | ^7.28.6 | Runtime helpers de Babel |
| supertest | ^6.3.4 | Testing de endpoints HTTP |
| mysql2 | ^3.16.1 | Driver MySQL para tests de integracion |
| nodemon | ^3.0.2 | Reinicio automatico en desarrollo |
| nyc | ^17.1.0 | Cobertura de codigo |

---

## Scripts Disponibles

### Desarrollo

| Script | Comando | Descripcion |
|--------|---------|-------------|
| Produccion | `npm start` | Inicia con node |
| Desarrollo | `npm run dev` | Inicia con nodemon (hot reload) |

### Testing

| Script | Comando | Descripcion |
|--------|---------|-------------|
| Tests todos | `npm test` | Ejecuta todos los tests con Jest |
| Tests watch | `npm run test:watch` | Tests en modo observacion |
| Tests unitarios | `npm run test:unit` | Solo tests unitarios |
| Tests unitarios + cobertura | `npm run test:unit:coverage` | Unitarios con reporte de cobertura |
| Tests integracion | `npm run test:integration` | Solo tests de integracion (secuencial) |
| Tests integracion + cobertura | `npm run test:integration:coverage` | Integracion con reporte de cobertura |
| Tests todos + cobertura | `npm run test:all` | Todos los tests con cobertura |

### Base de Datos de Test

| Script | Comando | Descripcion |
|--------|---------|-------------|
| Crear BD test | `npm run db:create-test` | Crea la base de datos `croptrack_test` |
| Setup BD test | `npm run db:setup-test` | Ejecuta el schema SQL en `croptrack_test` |

---

## Variables de Entorno

Crear archivo `.env` en la carpeta `server/`:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=croptrack_db

# Servidor
PORT=4000

# JWT
JWT_SECRET=tu_secreto_seguro_aqui
JWT_EXPIRES_IN=7d

# Entorno
NODE_ENV=development
```

---

## Estructura de Carpetas

```
server/
├── config/
│   └── dbConfig.js              # Configuracion MySQL con express-myconnection
├── controllers/
│   ├── registerController.js    # Logica de registro
│   ├── loginController.js       # Logica de autenticacion
│   ├── cropController.js        # CRUD de cultivos
│   ├── measurementController.js # CRUD de mediciones
│   ├── taskController.js        # CRUD de tareas
│   ├── userController.js        # CRUD de usuarios/trabajadores
│   └── reportController.js      # Reportes (en desarrollo)
├── models/
│   ├── userModel.js             # Modelo de usuarios (admin + worker)
│   ├── cropModel.js             # Modelo de cultivos
│   ├── measurementModel.js      # Modelo de mediciones
│   ├── taskModel.js             # Modelo de tareas
│   └── reportModel.js           # Modelo de reportes (en desarrollo)
├── routes/
│   ├── registerRoutes.js        # Rutas de registro
│   ├── loginRoutes.js           # Rutas de login
│   ├── cropRoutes.js            # Rutas de cultivos
│   ├── measurementRoutes.js     # Rutas de mediciones
│   ├── taskRoutes.js            # Rutas de tareas
│   ├── userRoutes.js            # Rutas de usuarios/trabajadores
│   └── reportRoutes.js          # Rutas de reportes (en desarrollo)
├── middleware/
│   ├── authMiddleware.js        # Verificacion de JWT en rutas protegidas
│   ├── generateId.js            # Genera UUID para cada request de creacion
│   ├── validate.js              # Validacion de registro de admin
│   ├── validateLogin.js         # Validacion de login
│   ├── validateCrop.js          # Validacion de cultivos
│   ├── validateMeasurement.js   # Validacion de mediciones
│   ├── validateTask.js          # Validacion de tareas
│   ├── validateUser.js          # Validacion de creacion de usuario/worker
│   └── validateUserUpdate.js    # Validacion de actualizacion de usuario
├── database/
│   └── schema.sql               # Esquema de la base de datos
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   │   ├── loginController.test.js
│   │   │   └── registerController.test.js
│   │   ├── models/
│   │   │   └── userModel.test.js
│   │   └── middleware/
│   │       ├── validate.test.js
│   │       ├── validateLogin.test.js
│   │       └── generateId.test.js
│   ├── integration/
│   │   ├── loginFlow.integration.test.js
│   │   └── registerFlow.integration.test.js
│   └── setup/
│       └── testDbConfig.js
├── index.js                     # Entry point de la aplicacion
├── package.json
└── .env                         # Variables de entorno (no versionado)
```

---

## Punto de Entrada (index.js)

### Configuracion Principal

```javascript
import express from 'express';
import cors from 'cors';
import dbConnection from './config/dbConfig.js';

const app = express();

// Middlewares globales
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
dbConnection(app);

// Puerto por defecto
const PORT = process.env.PORT || 4000;
```

### Rutas Registradas

| Path | Router | Descripcion |
|------|--------|-------------|
| `/api/register` | registerRoutes | Registro de usuarios |
| `/api/auth` | loginRoutes | Autenticacion |
| `/api/crops` | cropRoutes | Gestion de cultivos |
| `/api/measurements` | measurementRoutes | Gestion de mediciones |
| `/api/tasks` | taskRoutes | Gestion de tareas |
| `/api/users` | userRoutes | Gestion de usuarios/trabajadores |

---

## Configuracion de Base de Datos

### config/dbConfig.js

Utiliza `express-myconnection` para inyectar la conexion MySQL en cada request:

```javascript
import myConnection from 'express-myconnection';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const dbOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const dbConnection = (app) => {
  app.use(myConnection(mysql, dbOptions, 'single'));
};
```

### Uso en Controllers

```javascript
req.getConnection((err, conn) => {
  if (err) {
    return res.status(500).json({ error: 'Error de conexion' });
  }
  // Usar conn para queries
});
```

---

## API Endpoints

### Autenticacion

| Metodo | Endpoint | Descripcion | Middleware |
|--------|----------|-------------|------------|
| POST | `/api/register/register-admin` | Registro de administrador | validate, generateId |
| POST | `/api/auth/login` | Inicio de sesion | validateLogin |

### Cultivos (Crops)

| Metodo | Endpoint | Descripcion | Middleware |
|--------|----------|-------------|------------|
| POST | `/api/crops` | Crear cultivo | generateId, validateCrop |
| GET | `/api/crops/user/:userId` | Obtener por usuario | - |
| GET | `/api/crops/:id` | Obtener por ID | - |
| PUT | `/api/crops/:id` | Actualizar cultivo | - |
| DELETE | `/api/crops/:id` | Eliminar cultivo | - |

### Mediciones (Measurements)

| Metodo | Endpoint | Descripcion | Middleware |
|--------|----------|-------------|------------|
| POST | `/api/measurements` | Crear medicion | generateId, validateMeasurement |
| GET | `/api/measurements/user/:userId` | Obtener por usuario | - |
| GET | `/api/measurements/crop/:cropId` | Obtener por cultivo | - |
| GET | `/api/measurements/:id` | Obtener por ID | - |
| PUT | `/api/measurements/:id` | Actualizar medicion | - |
| DELETE | `/api/measurements/:id` | Eliminar medicion | - |

### Tareas (Tasks)

| Metodo | Endpoint | Descripcion | Middleware |
|--------|----------|-------------|------------|
| POST | `/api/tasks` | Crear tarea | generateId, validateTask |
| GET | `/api/tasks/user/:userId` | Tareas creadas por usuario | - |
| GET | `/api/tasks/assigned/:userId` | Tareas asignadas a usuario | - |
| GET | `/api/tasks/crop/:cropId` | Tareas por cultivo | - |
| GET | `/api/tasks/:id` | Obtener por ID | - |
| PUT | `/api/tasks/:id` | Actualizar tarea | - |
| DELETE | `/api/tasks/:id` | Eliminar tarea | - |

### Usuarios / Trabajadores (Users)

| Metodo | Endpoint | Descripcion | Middleware |
|--------|----------|-------------|------------|
| GET | `/api/users/:id` | Obtener usuario por ID | - |
| PUT | `/api/users/:id` | Actualizar datos de usuario | validateUserUpdate |

---

## Middleware

### authMiddleware.js

Verifica el JWT en el header `Authorization: Bearer <token>` para rutas protegidas.

### generateId.js

Genera un UUID v4 para cada request de creacion:

```javascript
import { v4 as uuidv4 } from 'uuid';

export const generateId = (req, res, next) => {
  req.body.id = uuidv4();
  next();
};
```

### validate.js (Registro)

Validaciones para registro de administrador:

| Campo | Reglas |
|-------|--------|
| usuario | 3-50 chars, alfanumerico + _ |
| contrasena | 6-100 chars |
| nombre | 2-100 chars, solo letras y espacios |
| apellido | 2-100 chars, solo letras y espacios |
| email | Formato email valido, max 100 chars |
| nombre_empresa | 2-100 chars |
| telefono | Opcional, max 20 chars, formato telefonico |

### validateLogin.js

Validaciones para inicio de sesion:

| Campo | Reglas |
|-------|--------|
| usuario | Obligatorio, 3-50 chars |
| contrasena | Obligatorio, min 6 chars |
| rol | Opcional: administrador, supervisor, trabajador |

### validateCrop.js

Validaciones para cultivos:

| Campo | Reglas |
|-------|--------|
| nombre | Obligatorio, 2-100 chars |
| empresa | Obligatorio, 2-100 chars |
| tipo | Obligatorio, 2-50 chars |
| variedad | Opcional, max 100 chars |
| area_hectareas | Opcional, decimal >= 0 |
| ubicacion | Opcional, max 200 chars |
| fecha_siembra | Opcional, formato ISO8601 |
| fecha_cosecha_estimada | Opcional, ISO8601, >= fecha_siembra |
| estado | Opcional: planificado, sembrado, en_crecimiento, maduro, cosechado, cancelado |
| notas | Opcional, max 5000 chars |

### validateMeasurement.js

Validaciones para mediciones:

| Campo | Reglas |
|-------|--------|
| cultivo_id | Obligatorio, UUID 36 chars |
| usuario_id | Obligatorio, UUID 36 chars |
| tipo_medicion | Obligatorio, 2-50 chars |
| valor | Obligatorio, decimal |
| unidad | Obligatorio, 1-20 chars |
| fecha_medicion | Opcional, formato ISO8601 |
| observaciones | Opcional, max 5000 chars |
| imagen_url | Opcional, max 255 chars |

### validateTask.js

Validaciones para tareas:

| Campo | Reglas |
|-------|--------|
| empresa | Obligatorio, 2-100 chars |
| creado_por | Obligatorio, UUID 36 chars |
| titulo | Obligatorio, 3-150 chars |
| cultivo_id | Opcional, UUID 36 chars |
| asignado_a | Opcional, UUID 36 chars |
| descripcion | Opcional, max 5000 chars |
| prioridad | Opcional: baja, media, alta, urgente |
| estado | Opcional: pendiente, en_proceso, completada, cancelada |
| fecha_inicio | Opcional, formato ISO8601 |
| fecha_limite | Opcional, ISO8601, >= fecha_inicio |
| observaciones | Opcional, max 5000 chars |
| imagen_url | Opcional, max 255 chars |

### validateUser.js

Validaciones para creacion de trabajadores.

### validateUserUpdate.js

Validaciones para actualizacion de datos de usuario/perfil.

---

## Controllers

### registerController.js

```javascript
createAdmin(req, res)
```

**Flujo:**
1. Recibe datos: usuario, contrasena, nombre, apellido, email, nombre_empresa, telefono, rol
2. Valida campos obligatorios
3. Verifica que usuario no exista
4. Verifica que email no exista
5. Hashea contrasena con bcrypt (10 rounds)
6. Inserta en tabla users
7. Retorna userId y usuario

### loginController.js

```javascript
login(req, res)
```

**Flujo:**
1. Recibe: usuario, contrasena, rol (opcional)
2. Busca usuario en BD
3. Valida rol si se especifico
4. Compara contrasena con bcrypt
5. Actualiza ultimo_acceso
6. Genera JWT con payload: id, usuario, rol, email
7. Retorna token + userData completo

### cropController.js

```javascript
createCrop(req, res)
getCropsByUser(req, res)
getCropById(req, res)
updateCrop(req, res)
deleteCrop(req, res)
```

**Campos protegidos en update:** id, usuario_creador_id, empresa, created_at

### measurementController.js

```javascript
createMeasurement(req, res)
getMeasurementsByUser(req, res)
getMeasurementsByCrop(req, res)
getMeasurementById(req, res)
updateMeasurement(req, res)
deleteMeasurement(req, res)
```

**Campos protegidos en update:** id, usuario_id, created_at

### taskController.js

```javascript
createTask(req, res)
getTasksByUser(req, res)
getTasksByAssignee(req, res)
getTasksByCrop(req, res)
getTaskById(req, res)
updateTask(req, res)
deleteTask(req, res)
```

**Campos protegidos en update:** id, creado_por, empresa, created_at

**Logica especial:** Cuando estado = 'completada', se agrega automaticamente fecha_completada

### userController.js

```javascript
getUserById(req, res)
updateUser(req, res)
```

Maneja la obtencion y actualizacion de datos de perfil de usuario.

---

## Models

### Patron de Metodos

Todos los modelos usan callbacks para operaciones asincronas:

```javascript
class Model {
  static create(conn, data, callback)
  static findByUser(conn, userId, callback)
  static findById(conn, id, callback)
  static update(conn, id, data, callback)
  static delete(conn, id, callback)
}
```

### userModel.js

**Metodos de Admin:**

| Metodo | Descripcion |
|--------|-------------|
| `findByUsername(conn, username, cb)` | Busca usuario por nombre_usuario |
| `findByEmail(conn, email, cb)` | Busca usuario por email |
| `createAdmin(conn, userData, cb)` | Inserta nuevo administrador |
| `findById(conn, id, cb)` | Busca usuario por ID |
| `updateLastAccess(conn, userId, cb)` | Actualiza timestamp ultimo_acceso |

**Metodos de Worker:**

| Metodo | Descripcion |
|--------|-------------|
| `createWorker(conn, data, cb)` | Crea trabajador |
| `findWorkerByUsername(conn, username, cb)` | Busca worker por username |
| `findWorkerByEmail(conn, email, cb)` | Busca worker por email |
| `findWorkerByEmpresa(conn, empresa, cb)` | Workers por empresa (ORDER BY created_at DESC) |
| `findWorkerByIdSafe(conn, id, cb)` | Busca worker excluyendo password_hash |
| `updateWorker(conn, id, data, cb)` | Actualiza worker (protege campos criticos) |
| `deleteWorker(conn, id, cb)` | Elimina worker |
| `findWorkerByEmailExcludingId(conn, email, id, cb)` | Busca email excluyendo un ID |

### cropModel.js

| Metodo | Descripcion |
|--------|-------------|
| `create(conn, cropData, cb)` | Crea nuevo cultivo |
| `findByUser(conn, userId, cb)` | Cultivos de un usuario (ORDER BY created_at DESC) |
| `findById(conn, id, cb)` | Cultivo por ID |
| `update(conn, id, data, cb)` | Actualiza cultivo |
| `delete(conn, id, cb)` | Elimina cultivo |

### measurementModel.js

| Metodo | Descripcion |
|--------|-------------|
| `create(conn, data, cb)` | Crea nueva medicion |
| `findByUser(conn, userId, cb)` | Mediciones de usuario (con JOIN a crops) |
| `findByCrop(conn, cropId, cb)` | Mediciones de un cultivo |
| `findById(conn, id, cb)` | Medicion por ID (con JOIN a crops) |
| `update(conn, id, data, cb)` | Actualiza medicion |
| `delete(conn, id, cb)` | Elimina medicion |

### taskModel.js

| Metodo | Descripcion |
|--------|-------------|
| `create(conn, data, cb)` | Crea nueva tarea |
| `findByUser(conn, userId, cb)` | Tareas creadas por usuario |
| `findByAssignee(conn, userId, cb)` | Tareas asignadas a usuario |
| `findByCrop(conn, cropId, cb)` | Tareas de un cultivo |
| `findById(conn, id, cb)` | Tarea por ID |
| `update(conn, id, data, cb)` | Actualiza tarea |
| `delete(conn, id, cb)` | Elimina tarea |

---

## Esquema de Base de Datos

### Tabla: users

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  empresa VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  rol ENUM('administrador', 'trabajador', 'supervisor') DEFAULT 'administrador',
  ultimo_acceso TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: crops

```sql
CREATE TABLE crops (
  id VARCHAR(36) PRIMARY KEY,
  empresa VARCHAR(100) NOT NULL,
  usuario_creador_id VARCHAR(36) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  variedad VARCHAR(100),
  area_hectareas DECIMAL(10,2),
  ubicacion VARCHAR(200),
  fecha_siembra DATE,
  fecha_cosecha_estimada DATE,
  fecha_cosecha_real DATE,
  estado ENUM('planificado', 'sembrado', 'en_crecimiento', 'maduro', 'cosechado', 'cancelado') DEFAULT 'planificado',
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_creador_id) REFERENCES users(id)
);
```

### Tabla: measurements

```sql
CREATE TABLE measurements (
  id VARCHAR(36) PRIMARY KEY,
  cultivo_id VARCHAR(36) NOT NULL,
  usuario_id VARCHAR(36) NOT NULL,
  tipo_medicion VARCHAR(50) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  unidad VARCHAR(20) NOT NULL,
  fecha_medicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT,
  imagen_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cultivo_id) REFERENCES crops(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES users(id)
);
```

### Tabla: tasks

```sql
CREATE TABLE tasks (
  id VARCHAR(36) PRIMARY KEY,
  empresa VARCHAR(100) NOT NULL,
  cultivo_id VARCHAR(36),
  creado_por VARCHAR(36) NOT NULL,
  asignado_a VARCHAR(36),
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  prioridad ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media',
  estado ENUM('pendiente', 'en_proceso', 'completada', 'cancelada') DEFAULT 'pendiente',
  fecha_inicio DATE,
  fecha_limite DATE,
  fecha_completada TIMESTAMP NULL,
  observaciones TEXT,
  imagen_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cultivo_id) REFERENCES crops(id) ON DELETE SET NULL,
  FOREIGN KEY (creado_por) REFERENCES users(id),
  FOREIGN KEY (asignado_a) REFERENCES users(id)
);
```

---

## Testing

### Estructura de Tests

```
tests/
├── unit/
│   ├── controllers/
│   │   ├── loginController.test.js      # ~30 tests
│   │   └── registerController.test.js   # ~40 tests
│   ├── models/
│   │   └── userModel.test.js            # ~70 tests
│   └── middleware/
│       ├── validate.test.js             # ~35 tests
│       ├── validateLogin.test.js        # ~25 tests
│       └── generateId.test.js
├── integration/
│   ├── loginFlow.integration.test.js    # ~25 tests
│   └── registerFlow.integration.test.js # ~100 tests
└── setup/
    └── testDbConfig.js
```

### Tests Unitarios

**loginController.test.js (~30 tests)**
- Errores de conexion a BD (500)
- Usuario no encontrado (401)
- Contrasena invalida (401)
- Login exitoso con generacion de JWT
- Validacion de rol (403 si no coincide)
- Actualizacion de ultimo_acceso
- Casos borde: sin rol, sin telefono

**registerController.test.js (~40 tests)**
- Validacion de campos obligatorios (400)
- Errores de conexion a BD (500)
- Verificacion de usuario/email duplicado (400)
- Encriptacion de contrasena con bcrypt (10 salt rounds)
- Creacion exitosa de admin
- Normalizacion de email a minusculas
- Mapeo de campos: usuario → nombre_usuario, nombre_empresa → empresa

**userModel.test.js (~70 tests)**
- Metodos de Admin: findByUsername, findByEmail, createAdmin, findById, updateLastAccess
- Metodos de Worker: createWorker, findWorkerByUsername, findWorkerByEmail, findWorkerByEmpresa, findWorkerByIdSafe, updateWorker, deleteWorker, findWorkerByEmailExcludingId
- Manejo de errores en cada metodo
- Resultados vacios

**validate.test.js (~35 tests)**
- Validacion exitosa con todos los campos
- Validacion exitosa sin telefono (opcional)
- Errores por campo: usuario, contrasena, nombre, apellido, email, nombre_empresa, telefono
- Multiples errores retornados juntos
- Estructura de respuesta de error

**validateLogin.test.js (~25 tests)**
- Validacion exitosa con y sin rol
- Errores: usuario vacio/<3 chars/>50 chars, contrasena vacia/<6 chars
- Rol invalido
- Multiples errores simultaneos

### Tests de Integracion

**loginFlow.integration.test.js (~25 tests)**
- Flujo completo: Route → ValidateLogin → Controller → Model → BD → JWT
- Setup: conexion a BD test, creacion de app, limpieza de tabla users
- Login exitoso de admin/supervisor/worker
- Validacion de formato JWT
- Rechazo por contrasena incorrecta (401), usuario inexistente (401), rol incorrecto (403)
- Verificacion de actualizacion de ultimo_acceso

**registerFlow.integration.test.js (~100 tests)**
- Flujo completo: Route → Middleware → Controller → Model → BD
- Registro exitoso (201) con verificacion de UUID
- Normalizacion de email
- Manejo de telefono opcional

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Solo unitarios
npm run test:unit

# Solo unitarios con cobertura
npm run test:unit:coverage

# Solo integracion (requiere BD croptrack_test)
npm run test:integration

# Todo con cobertura
npm run test:all
```

---

## Respuestas de la API

### Exito (200/201)

```json
{
  "message": "Operacion exitosa",
  "id": "uuid-del-recurso"
}
```

### Login Exitoso (200)

```json
{
  "message": "Login exitoso",
  "token": "jwt.token.here",
  "user": {
    "id": "uuid",
    "usuario": "nombre_usuario",
    "nombre": "Nombre",
    "apellido": "Apellido",
    "email": "email@ejemplo.com",
    "empresa": "Nombre Empresa",
    "telefono": "123456789",
    "rol": "administrador",
    "ultimo_acceso": "2026-01-17T00:00:00.000Z",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

### Error de Validacion (400)

```json
{
  "message": "Error de validacion",
  "errors": [
    {
      "field": "nombre_campo",
      "message": "Descripcion del error",
      "value": "valor_enviado"
    }
  ]
}
```

### No Autenticado (401)

```json
{
  "message": "Usuario o contrasena incorrectos"
}
```

### No Autorizado (403)

```json
{
  "message": "Este usuario no tiene permisos de administrador"
}
```

### No Encontrado (404)

```json
{
  "error": "Recurso no encontrado"
}
```

### Error del Servidor (500)

```json
{
  "error": "Error de conexion con la base de datos"
}
```

---

## Seguridad

### Autenticacion

- **Passwords:** Hasheados con bcryptjs (10 salt rounds)
- **JWT:** Token con expiracion de 7 dias por defecto
- **Payload JWT:** id, usuario, rol, email

### Configuracion de CORS

```javascript
cors({
  origin: 'http://localhost:3000',  // Solo frontend permitido
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

### Validacion de Inputs

- Todos los endpoints de creacion usan `express-validator`
- Sanitizacion automatica con `trim()` y `normalizeEmail()`
- Validacion de formatos (email, UUID, fechas ISO8601)
- Limites de longitud en todos los campos

### Proteccion de Campos

Los modelos protegen campos criticos en operaciones de update:
- `id` - Nunca se puede modificar
- `created_at` - Timestamp de creacion inmutable
- Campos de relacion (`usuario_creador_id`, `creado_por`)
- Campos de empresa

---

## Desarrollo

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con credenciales de MySQL

# Iniciar en desarrollo
npm run dev

# Ejecutar tests
npm test

# Tests con cobertura
npm run test:all
```

---

*CropTrack Backend API - Express.js (c) 2026*
