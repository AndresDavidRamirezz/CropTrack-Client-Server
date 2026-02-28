# CropTrack

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-29-C21325?style=flat&logo=jest&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-15-17202C?style=flat&logo=cypress&logoColor=white)

## Sistema de Gestión Agrícola

CropTrack es un sistema integral para la gestión de cultivos agrícolas que permite a empresas del sector agropecuario administrar cosechas, registrar mediciones de campo, organizar tareas, gestionar equipos de trabajo y generar reportes PDF completos con análisis gráfico.

---

## Índice

- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Descripción de cada capa](#descripción-de-cada-capa)
- [Estructura del monorepo](#estructura-del-monorepo)
- [Stack tecnológico](#stack-tecnológico)
- [Deploy](#deploy)
- [Variables de entorno](#variables-de-entorno)
- [Instalación rápida](#instalación-rápida)
- [Scripts disponibles](#scripts-disponibles)
- [Módulos del sistema](#módulos-del-sistema)
- [Roles de usuario](#roles-de-usuario)
- [Testing](#testing)

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Netlify)                        │
│              React 19 SPA  ·  React Router v7                   │
│                                                                 │
│  /login  /register  /crops  /measurements  /tasks               │
│  /users  /profile  /report  /main                               │
│                                                                 │
│  Axios (interceptor JWT) → API REST                             │
└────────────────────────┬────────────────────────────────────────┘
                         │  HTTPS · JSON · multipart/form-data
                         │  Authorization: Bearer <JWT>
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVIDOR (Render)                         │
│          Express.js 4  ·  ES Modules  ·  Patrón MVC             │
│                                                                 │
│  Rutas → Middleware (validación + generateId)                   │
│       → Controllers (lógica de negocio)                         │
│       → Models (queries MySQL callback-based)                   │
│                                                                 │
│  Services:                                                      │
│  · multerService  → upload multipart a Cloudinary              │
│  · reportServices → PDFKit + Chart.js → buffer PDF             │
└──────────┬───────────────────────────────┬──────────────────────┘
           │                               │
           ▼                               ▼
┌──────────────────────┐       ┌───────────────────────────┐
│   MySQL (Railway)    │       │     Cloudinary (CDN)       │
│                      │       │                           │
│  users               │       │  croptrack/crops/{uuid}   │
│  crops               │       │  croptrack/tasks/{uuid}   │
│  tasks               │       │  croptrack/users/{uuid}   │
│  measurements        │       │                           │
│  crop_workers        │       │  public_id fijo por       │
│                      │       │  entidad → sobreescritura │
└──────────────────────┘       └───────────────────────────┘
```

---

## Descripción de cada capa

### Cliente (React SPA — Netlify)

Interfaz de usuario construida como Single Page Application. Maneja:
- **Autenticación**: formulario de login con selector de rol, registro de administrador, guardado de JWT en localStorage
- **Rutas protegidas**: `ProtectedRoute` verifica token en cada navegación
- **Módulos CRUD**: páginas independientes para Cosechas, Tareas, Mediciones y Trabajadores, cada una con formulario (crear/editar), lista y tarjetas individuales
- **Imágenes**: upload directo al servidor vía `multipart/form-data`; la URL de Cloudinary se guarda en base de datos y se muestra en las tarjetas
- **Reportes PDF**: solicita el PDF al servidor, recibe un blob, lo muestra en un `<iframe>` de previsualización y ofrece botón de descarga
- **Diseño responsive**: breakpoints a 768px (tablet) y 480px (móvil); en escritorio los márgenes laterales se reducen al 10% en cada lado

### Servidor (Express API — Render)

API REST con arquitectura MVC estricta:
- **Rutas**: definen los endpoints y encadenan middleware → controlador. Los uploads de imágenes pasan por multer antes del controlador
- **Middleware**: valida todos los campos de entrada con `express-validator` antes de llegar al controlador; `generateId` inyecta un UUID v4 en `req.body.id` en cada operación de creación
- **Controladores**: reciben `req`/`res`, obtienen la conexión a BD con `req.getConnection()`, delegan queries a los modelos y manejan los errores de cada operación
- **Modelos**: contienen las queries SQL con placeholders parametrizados, operan con callbacks `(err, result)` y protegen campos críticos de modificación
- **multerService**: crea instancias de multer con `CloudinaryStorage`; el `public_id` se fija al UUID de la entidad para sobreescritura sin archivos huérfanos
- **reportServices**: genera un PDF completo por cosecha usando PDFKit (layout A4, encabezado, secciones, tablas) y Chart.js Node Canvas (gráficos de barras y torta embebidos en el PDF)

### Base de datos (MySQL — Railway)

Base de datos relacional con cinco tablas principales:
- **users**: todos los roles (administrador, supervisor, trabajador) en una sola tabla con campo `rol`
- **crops**: cosechas vinculadas a un usuario creador y una empresa
- **tasks**: tareas con prioridad, estado y fechas; pueden asignarse a un trabajador y vincularse a una cosecha
- **measurements**: mediciones de campo (temperatura, humedad, pH, etc.) asociadas a una cosecha y un supervisor
- **crop_workers**: tabla pivote `(cultivo_id, usuario_id)` que define qué trabajadores/supervisores están asignados a cada cosecha

### Cloudinary (CDN de imágenes)

Almacenamiento externo de imágenes con CDN global. Cada entidad tiene un slot fijo en Cloudinary usando `public_id = UUID` con `overwrite: true`. Esto garantiza que al actualizar la imagen se sobreescriba la anterior sin dejar archivos huérfanos. Las imágenes se organizan en subcarpetas: `croptrack/crops/`, `croptrack/tasks/`, `croptrack/users/`.

---

## Estructura del monorepo

```
CropTrack-Client-Server/
├── package.json          # Scripts raíz (dev, install-all, test)
├── .gitignore
├── README.md             # Este archivo
├── client/               # React SPA → ver client/README.md
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.png   # Logo de la app como favicon
│   │   └── _redirects    # Netlify SPA routing
│   ├── src/
│   └── package.json
└── server/               # Express API → ver server/README.md
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── index.js
    └── package.json
```

---

## Stack tecnológico

### Frontend
| Tecnología | Versión | Rol |
|------------|---------|-----|
| React | 19.2.3 | Librería de UI con hooks |
| React Router DOM | 7.13.0 | Enrutamiento SPA con rutas protegidas |
| Axios | 1.13.5 | Cliente HTTP con interceptor JWT automático |
| CSS puro | — | Estilos globales sin frameworks (sin CSS Modules) |

### Backend
| Tecnología | Versión | Rol |
|------------|---------|-----|
| Node.js | 18+ | Runtime JavaScript (ES Modules) |
| Express | 4.18.2 | Framework HTTP |
| MySQL2 + express-myconnection | — | Conexión a BD, inyectada por request |
| jsonwebtoken | 9.0.2 | Autenticación stateless JWT |
| bcryptjs | 3.0.3 | Hash de contraseñas (10 salt rounds) |
| express-validator | 7.3.1 | Validación declarativa de inputs |
| PDFKit | 0.17.2 | Generación de PDFs |
| chartjs-node-canvas | 5.0.0 | Gráficos Chart.js en Node (para los PDFs) |
| Multer + multer-storage-cloudinary | — | Upload de imágenes a Cloudinary |
| uuid | 13.0.0 | Generación de IDs (UUIDv4) |
| dotenv | 16.3.1 | Variables de entorno en desarrollo |

### Infraestructura
| Servicio | Plataforma | Propósito |
|----------|-----------|-----------|
| Frontend | Netlify | Hosting SPA estático |
| Backend | Render | Web Service (Node.js) |
| Base de datos | Railway | MySQL gestionado |
| Imágenes | Cloudinary | CDN + almacenamiento |

### Testing
| Herramienta | Versión | Uso |
|------------|---------|-----|
| Jest | 29.7.0 | Unit e integration tests (server + client) |
| Supertest | 6.3.4 | Tests HTTP del servidor |
| @testing-library/react | 16.1.0 | Tests de componentes React |
| Cypress | 15.9.0 | Tests end-to-end |

---

## Deploy

### Netlify (Frontend)

| Configuración | Valor |
|--------------|-------|
| Base directory | `client/` |
| Build command | `npm run build` |
| Publish directory | `client/build` |
| Variable de entorno | `REACT_APP_API_URL=https://tu-servidor.onrender.com` |

El archivo `client/public/_redirects` contiene `/* /index.html 200` para que el routing SPA funcione al refrescar o acceder directo a una ruta.

### Render (Backend)

| Configuración | Valor |
|--------------|-------|
| Root directory | `server/` |
| Build command | `npm install` |
| Start command | `node index.js` |
| Variables de entorno | Configurar en el dashboard de Render (ver sección siguiente) |

> **Cold start**: El plan gratuito de Render apaga el servicio tras 15 minutos de inactividad. El primer request después de inactividad puede demorar ~30 segundos.

### Railway (Base de datos)

MySQL Plugin de Railway. Las credenciales de conexión se obtienen del panel de Railway y se configuran como variables de entorno en Render.

### Cloudinary

Cuenta gratuita de Cloudinary. Las credenciales (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) se configuran en el dashboard de Render.

---

## Variables de entorno

### Servidor — `server/.env` (desarrollo local)

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=croptrack

# Servidor
PORT=4000

# JWT
JWT_SECRET=tu_secreto_seguro_aqui

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# CORS — URL del cliente permitido
CLIENT_URL=http://localhost:3000
```

> En Render, estas variables se configuran en **Settings → Environment Variables**. El archivo `.env` nunca se sube al repositorio.

### Cliente — `client/.env.production`

```env
REACT_APP_API_URL=https://tu-servidor.onrender.com
```

Para desarrollo local, crear `client/.env.local`:
```env
REACT_APP_API_URL=http://localhost:4000
```

---

## Instalación rápida

**Prerrequisitos:** Node.js 18+, MySQL corriendo localmente

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd CropTrack-Client-Server

# 2. Instalar todas las dependencias (raíz + server + client)
npm run install-all

# 3. Configurar variables de entorno del servidor
# Crear server/.env con los valores de la sección anterior

# 4. Iniciar servidor y cliente en paralelo
npm run dev
```

El servidor levanta en `http://localhost:4000` y el cliente en `http://localhost:3000`.

---

## Scripts disponibles

### Desarrollo

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor + cliente en paralelo (concurrently) |
| `npm run server` | Solo el servidor (nodemon, hot reload) |
| `npm run client` | Solo el cliente (react-scripts start) |
| `npm run install-all` | `npm install` en raíz, server y client |

### Testing

| Script | Descripción |
|--------|-------------|
| `npm run test:unit` | Unit tests de client y server en paralelo |
| `npm run test:unit:client` | Unit tests del frontend con cobertura |
| `npm run test:unit:server` | Unit tests del backend con cobertura |
| `npm run test:integration` | Integration tests de client y server |
| `npm run test:e2e` | Tests E2E con Cypress (headless) |
| `npm run test:e2e:headed` | Tests E2E con navegador visible |
| `npm run test:e2e:open` | Abre Cypress Test Runner interactivo |
| `npm run test:all:no-e2e` | Unit + integration sin E2E |
| `npm run test:all` | Unit + integration + E2E |

---

## Módulos del sistema

| Módulo | Ruta cliente | Endpoints servidor | Descripción |
|--------|-------------|-------------------|-------------|
| Autenticación | `/login`, `/register/register-admin` | `/api/auth`, `/api/register` | Login JWT, registro de admin |
| Cosechas | `/crops` | `/api/crops` | CRUD + imagen + asignación de personal |
| Tareas | `/tasks` | `/api/tasks` | CRUD + imagen + asignación a trabajadores |
| Mediciones | `/measurements` | `/api/measurements` | CRUD + registro por cosecha y supervisor |
| Trabajadores | `/users` | `/api/users` | CRUD + imagen de perfil |
| Perfil | `/profile` | `/api/users/:id` | Ver y editar datos propios |
| Reportes | `/report` | `/api/reports` | Generación de PDF con gráficos por cosecha |
| Asignación | — (interno) | `/api/crops/:id/workers` | Vincular personal a cosechas |

---

## Roles de usuario

| Rol | Cómo se crea | Permisos |
|-----|-------------|----------|
| `administrador` | `POST /api/register/register-admin` | Crea y gestiona todo. Único rol que puede usar el panel de admin |
| `supervisor` | Admin lo crea desde WorkerPage | Se asigna a cosechas; aparece como responsable en mediciones |
| `trabajador` | Admin lo crea desde WorkerPage | Se asigna a cosechas; aparece como asignado en tareas |

---

## Testing

El proyecto implementa tres niveles de testing:

### Tests unitarios
Validan funciones y componentes de forma aislada con mocks. ~140 tests en total.
- **Server**: controllers (login, register), models (userModel), middleware (validate, validateLogin, generateId)
- **Client**: pages (LoginPage, RegisterPage), components (AuthModal, NavBar, Footer)

### Tests de integración
Validan flujos completos entre múltiples capas. ~80 tests en total.
- **Server**: loginFlow (route → validación → controller → model → BD → JWT), registerFlow
- **Client**: LoginPage y RegisterPage con mocks de API y navegación

### Tests E2E (Cypress)
Validan flujos de usuario contra la aplicación real corriendo. ~30 tests.
- `login.e2e.cy.js`: formulario → API real → localStorage → redirección a /main
- `register.e2e.cy.js`: formulario → API real → creación en BD

**Requisitos para E2E**: servidor en puerto 4000, cliente en puerto 3000, base de datos `croptrack_test` disponible.

---

## Puertos por defecto

| Servicio | URL |
|----------|-----|
| Frontend (React) | http://localhost:3000 |
| Backend (Express) | http://localhost:4000 |

---

## Documentación adicional

- [server/README.md](./server/README.md) — Documentación completa de la API, endpoints, modelos, middleware y servicios
- [client/README.md](./client/README.md) — Documentación completa del frontend, componentes, páginas y flujos

---

## Autor

**Andrés David Ramírez**

**Universidad del Norte Santo Tomás de Aquino**

---

*CropTrack — Sistema de Gestión Agrícola © 2026*
