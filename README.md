# CropTrack

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)

## Sistema de Gestion Agricola

CropTrack es un sistema integral para la gestion de cultivos agricolas que permite administrar cosechas, registrar mediciones y organizar tareas de forma eficiente.

---

## Tecnologias Principales

| Capa | Tecnologia | Version |
|------|------------|---------|
| Frontend | React | 19.2.3 |
| Backend | Express.js | 4.18.2 |
| Base de Datos | MySQL | 8.0+ |
| Autenticacion | JWT + bcrypt | - |

---

## Estructura del Proyecto

```
CropTrack-Client-Server/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── server/                 # Backend Express
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
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

| Script | Comando | Descripcion |
|--------|---------|-------------|
| Desarrollo | `npm run dev` | Inicia servidor y cliente simultaneamente |
| Solo Servidor | `npm run server` | Inicia solo el backend (puerto 4000) |
| Solo Cliente | `npm run client` | Inicia solo el frontend (puerto 3000) |
| Instalar Todo | `npm run install-all` | Instala dependencias de raiz, client y server |
| Tests | `npm test` | Ejecuta tests del servidor y cliente |

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
| Trabajadores | Gestion de personal | En desarrollo |
| Perfil | Configuracion de usuario | En desarrollo |

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

## Configuracion de Base de Datos

El sistema requiere una base de datos MySQL. Las tablas principales son:

- **users** - Usuarios del sistema
- **crops** - Cultivos/cosechas
- **measurements** - Mediciones de cultivos
- **tasks** - Tareas agricolas

Consulta `server/README.md` para el esquema completo.

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
