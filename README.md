# CropTrack

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-29-C21325?style=flat&logo=jest&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-15-17202C?style=flat&logo=cypress&logoColor=white)

## Sistema de Gestion Agricola

CropTrack es un sistema integral para la gestion de cultivos agricolas que permite administrar cosechas, registrar mediciones, organizar tareas y gestionar trabajadores de forma eficiente.

---

## Tecnologias Principales

| Capa | Tecnologia | Version |
|------|------------|---------|
| Frontend | React | 19.2.3 |
| Backend | Express.js | 4.18.2 |
| Base de Datos | MySQL | 8.0+ |
| Autenticacion | JWT + bcrypt | - |
| Testing Unitario/Integracion | Jest + Supertest | 29.7.0 |
| Testing E2E | Cypress | 15.9.0 |

---

## Estructura del Proyecto

```
CropTrack-Client-Server/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AuthModal/
│   │   │   ├── Crop/          # Card, Form, List
│   │   │   ├── Footer/
│   │   │   ├── Measurement/   # Card, Form, List
│   │   │   ├── NavBar/
│   │   │   ├── NavigationButtons/
│   │   │   ├── Task/          # Card, Form, List
│   │   │   ├── Worker/        # Card, Form, List
│   │   │   └── ProtectedRoutes.jsx
│   │   ├── pages/
│   │   │   ├── Crop/
│   │   │   ├── Extras/
│   │   │   ├── Login/
│   │   │   ├── Measurement/
│   │   │   ├── Profile/
│   │   │   ├── Register/
│   │   │   ├── Task/
│   │   │   └── Worker/
│   │   ├── services/
│   │   ├── index.js
│   │   └── index.css
│   ├── tests/
│   │   ├── unit/              # Tests unitarios (Jest)
│   │   ├── integration/       # Tests de integracion (Jest)
│   │   ├── e2e/               # Tests E2E (Cypress)
│   │   └── cypress.config.js
│   └── package.json
├── server/                 # Backend Express
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── database/
│   ├── tests/
│   │   ├── unit/              # Tests unitarios (Jest)
│   │   └── integration/       # Tests de integracion (Jest)
│   └── package.json
├── package.json            # Scripts del monorepo
├── .gitignore
├── CLAUDE.md
└── README.md
```

---

## Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MySQL** >= 8.0

---

## Instalacion Rapida

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/CropTrack-Client-Server.git
cd CropTrack-Client-Server

# 2. Instalar todas las dependencias (raiz, client y server)
npm run install-all

# 3. Configurar variables de entorno del servidor
cp server/.env.example server/.env
# Editar server/.env con tus credenciales de MySQL

# 4. Iniciar en modo desarrollo
npm run dev
```

---

## Scripts Disponibles

### Desarrollo

| Script | Comando | Descripcion |
|--------|---------|-------------|
| Desarrollo completo | `npm run dev` | Inicia servidor y cliente simultaneamente |
| Solo Servidor | `npm run server` | Inicia solo el backend (puerto 4000) |
| Solo Cliente | `npm run client` | Inicia solo el frontend (puerto 3000) |
| Instalar Todo | `npm run install-all` | Instala dependencias de raiz, client y server |

### Testing

| Script | Comando | Descripcion |
|--------|---------|-------------|
| Tests unitarios (todos) | `npm run test:unit` | Ejecuta unit tests de client y server |
| Tests unitarios client | `npm run test:unit:client` | Unit tests del frontend con cobertura |
| Tests unitarios server | `npm run test:unit:server` | Unit tests del backend con cobertura |
| Tests integracion (todos) | `npm run test:integration` | Integration tests de client y server |
| Tests integracion client | `npm run test:integration:client` | Integration tests del frontend con cobertura |
| Tests integracion server | `npm run test:integration:server` | Integration tests del backend con cobertura |
| Tests E2E | `npm run test:e2e` | Ejecuta tests Cypress en modo headless |
| Tests E2E (visual) | `npm run test:e2e:headed` | Ejecuta Cypress con navegador visible |
| Tests E2E (interactivo) | `npm run test:e2e:open` | Abre Cypress Test Runner interactivo |
| Todos los tests | `npm run test:all` | Ejecuta unit + integration + E2E |
| Tests sin E2E | `npm run test:all:no-e2e` | Ejecuta unit + integration (sin Cypress) |

---

## Testing

El proyecto implementa una estrategia de testing en tres niveles:

### Tests Unitarios (~140 tests)

Validan funciones y componentes de forma aislada con mocks.

**Server (Jest + Supertest):**
- Controllers: `loginController`, `registerController`
- Models: `userModel` (admin + worker methods)
- Middleware: `validate` (registro), `validateLogin`, `generateId`

**Client (Jest + Testing Library):**
- Pages: `LoginPage`, `RegisterPage`
- Components: `AuthModal`, `NavBar`, `Footer`

### Tests de Integracion (~80 tests)

Validan flujos completos entre multiples capas.

**Server (Jest + Supertest + MySQL):**
- `loginFlow` - Ruta completa: Request → Validacion → Controller → Model → BD → JWT
- `registerFlow` - Registro completo con verificacion en BD

**Client (Jest + Testing Library):**
- `LoginPage` - Formulario completo con mocks de API
- `RegisterPage` - Registro con validaciones y navegacion

### Tests E2E (~30 tests)

Validan flujos de usuario reales con Cypress contra la aplicacion corriendo.

- `login.e2e.cy.js` - Login completo: formulario → API real → localStorage → redireccion
- `register.e2e.cy.js` - Registro completo: formulario → API real → creacion en BD

**Requisitos para E2E:** Server en puerto 4000, Client en puerto 3000, BD `croptrack_test` disponible.

---

## Puertos por Defecto

| Servicio | URL | Puerto |
|----------|-----|--------|
| Frontend (React) | http://localhost:3000 | 3000 |
| Backend (Express) | http://localhost:4000 | 4000 |

---

## Modulos del Sistema

| Modulo | Descripcion | Estado |
|--------|-------------|--------|
| Autenticacion | Login, registro de usuarios, JWT | Completo |
| Cultivos (Crops) | CRUD completo de cultivos | Completo |
| Mediciones | Registro de mediciones por cultivo | Completo |
| Tareas | Gestion de tareas agricolas | Completo |
| Trabajadores | Gestion de personal (CRUD) | Completo |
| Perfil | Visualizacion y edicion de datos de usuario | Completo |

---

## Dependencias del Monorepo

### Raiz

| Dependencia | Version | Descripcion |
|-------------|---------|-------------|
| concurrently | ^8.2.2 | Ejecutar client y server en paralelo |

### Server

Consultar [server/README.md](./server/README.md) para el listado completo.

### Client

Consultar [client/README.md](./client/README.md) para el listado completo.

---

## Configuracion de Base de Datos

El sistema requiere una base de datos MySQL. Las tablas principales son:

- **users** - Usuarios del sistema (admins, supervisores, trabajadores)
- **crops** - Cultivos/cosechas
- **measurements** - Mediciones de cultivos
- **tasks** - Tareas agricolas

Consulta `server/README.md` para el esquema completo.

---

## Contenido del .gitignore

```
# Dependencias
node_modules/

# Variables de entorno
.env
.env.local
.env.*.local

# Build
client/build/
server/dist/

# Logs
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Uploads
server/uploads/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

---

## Documentacion Adicional

- [Frontend (client/README.md)](./client/README.md) - Documentacion del cliente React
- [Backend (server/README.md)](./server/README.md) - Documentacion de la API Express

---

## Autores

- **Andres David Ramirez** - Desarrollo principal

## Institucion

**Universidad del Norte Santo Tomas de Aquino**

---

## Licencia

Este proyecto es parte de un trabajo academico. Todos los derechos reservados.

---

*CropTrack - Sistema de Gestion Agricola (c) 2026*
