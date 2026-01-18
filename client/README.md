# CropTrack - Frontend

Aplicacion React para el sistema de gestion agricola CropTrack.

---

## Tecnologias

| Tecnologia | Version | Descripcion |
|------------|---------|-------------|
| React | 19.2.3 | Framework UI |
| React DOM | 19.2.3 | Renderizado DOM |
| React Router DOM | 6.x | Enrutamiento SPA |
| React Scripts | 5.0.1 | Build tools (CRA) |

---

## Dependencias

```json
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-scripts": "5.0.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/user-event": "^13.5.0",
    "web-vitals": "^2.1.4"
  }
}
```

---

## Scripts Disponibles

| Script | Comando | Descripcion |
|--------|---------|-------------|
| Desarrollo | `npm start` | Inicia en http://localhost:3000 |
| Build | `npm run build` | Compila para produccion |
| Tests | `npm test` | Ejecuta tests con Jest |

---

## Estructura de Carpetas

```
client/
├── public/
│   ├── index.html              # HTML principal (entry point)
│   ├── favicon.ico             # Icono de la app
│   └── manifest.json           # PWA manifest
├── src/
│   ├── assets/
│   │   └── Logo.png            # Logo de CropTrack
│   ├── components/
│   │   ├── AuthModal/
│   │   │   ├── AuthModal.jsx   # Selector de rol
│   │   │   └── AuthModal.css
│   │   ├── Footer/
│   │   │   ├── Footer.jsx      # Pie de pagina
│   │   │   └── Footer.css
│   │   ├── NavBar/
│   │   │   ├── NavBar.jsx      # Barra de navegacion
│   │   │   └── NavBar.css
│   │   ├── NavigationButtons/
│   │   │   ├── NavigationButtons.jsx
│   │   │   └── NavigationButtons.css
│   │   ├── ProtectedRoutes/
│   │   │   └── ProtectedRoutes.jsx
│   │   ├── Crop/
│   │   │   ├── Card/
│   │   │   │   ├── CropCard.jsx
│   │   │   │   └── CropCard.css
│   │   │   ├── Form/
│   │   │   │   ├── CropForm.jsx
│   │   │   │   └── CropForm.css
│   │   │   └── List/
│   │   │       ├── CropList.jsx
│   │   │       └── CropList.css
│   │   ├── Measurement/
│   │   │   ├── Card/
│   │   │   │   ├── MeasurementCard.jsx
│   │   │   │   └── MeasurementCard.css
│   │   │   ├── Form/
│   │   │   │   ├── MeasurementForm.jsx
│   │   │   │   └── MeasurementForm.css
│   │   │   └── List/
│   │   │       ├── MeasurementList.jsx
│   │   │       └── MeasurementList.css
│   │   └── Task/
│   │       ├── Card/
│   │       │   ├── TaskCard.jsx
│   │       │   └── TaskCard.css
│   │       ├── Form/
│   │       │   ├── TaskForm.jsx
│   │       │   └── TaskForm.css
│   │       └── List/
│   │           ├── TaskList.jsx
│   │           └── TaskList.css
│   ├── pages/
│   │   ├── Landing/
│   │   │   ├── LandingPage.jsx
│   │   │   └── LandingPage.css
│   │   ├── Login/
│   │   │   ├── LoginPage.jsx
│   │   │   └── LoginPage.css
│   │   ├── Register/
│   │   │   ├── RegisterPage.jsx
│   │   │   └── RegisterPage.css
│   │   ├── Main/
│   │   │   ├── MainPage.jsx
│   │   │   └── MainPage.css
│   │   ├── Crop/
│   │   │   ├── CropPage.jsx
│   │   │   └── CropPage.css
│   │   ├── Measurement/
│   │   │   ├── MeasurementPage.jsx
│   │   │   └── MeasurementPage.css
│   │   ├── Task/
│   │   │   ├── TaskPage.jsx
│   │   │   └── TaskPage.css
│   │   ├── Worker/
│   │   │   └── WorkerPage.jsx
│   │   ├── Profile/
│   │   │   └── ProfilePage.jsx
│   │   └── Extras/
│   │       └── ExtrasPage.jsx
│   ├── services/
│   │   └── authService.js      # Servicios de autenticacion
│   ├── index.js                # Entry point + React Router
│   └── index.css               # Estilos globales
└── package.json
```

---

## public/index.html

El archivo HTML principal que sirve como punto de entrada:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#87D000" />
  <meta name="description" content="CropTrack - Sistema de Gestion Agricola" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <title>CropTrack</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

---

## Sistema de Rutas

### Rutas Publicas

| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/` | LandingPage | Pagina de inicio publica |
| `/login` | LoginPage | Inicio de sesion |
| `/register/register-admin` | RegisterPage | Registro de administrador |

### Rutas Protegidas

Requieren autenticacion (token en localStorage):

| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/main` | MainPage | Dashboard principal |
| `/crops` | CropPage | Gestion de cultivos |
| `/measurement` | MeasurementPage | Gestion de mediciones |
| `/task` | TaskPage | Gestion de tareas |
| `/worker` | WorkerPage | Gestion de trabajadores |
| `/profile` | ProfilePage | Perfil de usuario |
| `/extras` | ExtrasPage | Funciones adicionales |

---

## Componentes Globales

### NavBar.jsx
Barra de navegacion superior:
- Logo y nombre de la aplicacion
- Badge de rol del usuario (si esta autenticado)
- Nombre del usuario logueado
- Botones de Login/Logout segun estado

### Footer.jsx
Pie de pagina:
- Informacion de la Universidad del Norte Santo Tomas de Aquino
- Copyright

### ProtectedRoutes.jsx
Componente wrapper para rutas protegidas:
- Valida existencia de `token` y `userData` en localStorage
- Redirige a `/` si no hay autenticacion
- Renderiza children si esta autenticado

### AuthModal.jsx
Modal de seleccion de rol:
- Opciones: Administrador, Trabajador, Supervisor
- Usado en la pagina de login

---

## Paginas Principales

### LoginPage
- **Formulario**: usuario, contrasena
- **Selector de rol**: Administrador, Trabajador, Supervisor
- **Validaciones**:
  - Usuario minimo 3 caracteres
  - Contrasena minimo 6 caracteres
- **API**: POST `/api/auth/login`
- **Almacenamiento**: Guarda token, userData, usuario en localStorage

### RegisterPage
- **Campos**: usuario, contrasena, confirmar_contrasena, nombre, apellido, email, nombre_empresa, telefono
- **Validaciones**:
  - Usuario: 3-50 chars, alfanumerico + _
  - Contrasena: minimo 6 chars, indicador de fortaleza
  - Nombre/Apellido: solo letras
  - Email: formato valido
  - Empresa: 2-100 chars
  - Telefono: opcional
- **API**: POST `/api/register/register-admin`

### CropPage
- **Funcionalidad**: CRUD de cultivos
- **Componentes**: CropForm, CropList, CropCard
- **API**: `/api/crops/*`
- **Campos**: nombre, tipo, variedad, area_hectareas, ubicacion, fecha_siembra, fecha_cosecha_estimada, estado, notas

### MeasurementPage
- **Funcionalidad**: CRUD de mediciones
- **Componentes**: MeasurementForm, MeasurementList, MeasurementCard
- **API**: `/api/measurements/*`
- **Campos**: cultivo_id, tipo_medicion, valor, unidad, fecha_medicion, observaciones

### TaskPage
- **Funcionalidad**: CRUD de tareas
- **Componentes**: TaskForm, TaskList, TaskCard
- **API**: `/api/tasks/*`
- **Campos**: titulo, cultivo_id, asignado_a, prioridad, estado, fecha_inicio, fecha_limite, descripcion, observaciones

---

## Patron de Componentes por Modulo

Cada modulo (Crop, Measurement, Task) sigue el mismo patron:

```
[Modulo]/
├── Card/
│   ├── [Modulo]Card.jsx    # Tarjeta individual con datos y acciones
│   └── [Modulo]Card.css    # Estilos de la tarjeta
├── Form/
│   ├── [Modulo]Form.jsx    # Formulario crear/editar
│   └── [Modulo]Form.css    # Estilos del formulario
└── List/
    ├── [Modulo]List.jsx    # Lista/grid de tarjetas
    └── [Modulo]List.css    # Estilos de la lista
```

### Card
- Muestra informacion resumida del item
- Badges de estado/prioridad con colores
- Botones de accion: Editar, Eliminar
- Confirmacion antes de eliminar

### Form
- Formulario para crear o editar
- Validaciones del lado del cliente
- Modo edicion detectado por `initialData`
- Campos obligatorios marcados con *

### List
- Grid responsive de Cards
- Contador de items
- Estado de carga (spinner)
- Estado vacio (mensaje + icono)

---

## Estilos

### Tema de Colores

| Elemento | Color | Hex |
|----------|-------|-----|
| Acento principal | Verde lima | #87D000 |
| Fondo cards | Gris oscuro | #1e293b |
| Bordes | Gris medio | #334155 |
| Texto principal | Blanco | #ffffff |
| Texto secundario | Gris claro | #94a3b8 |
| Error | Rojo | #ef4444 |
| Exito | Verde | #198754 |
| Advertencia | Amarillo | #ffc107 |

### Breakpoints Responsive

| Breakpoint | Ancho | Descripcion |
|------------|-------|-------------|
| Desktop | > 768px | Grid de 2+ columnas |
| Tablet | <= 768px | Grid de 1 columna, formularios apilados |
| Mobile | <= 480px | Layout compacto, botones full-width |

---

## Almacenamiento Local (localStorage)

| Key | Tipo | Descripcion |
|-----|------|-------------|
| `token` | String | JWT de autenticacion (expira en 7 dias) |
| `userData` | Object | Datos completos del usuario logueado |
| `usuario` | String | Nombre de usuario (para mostrar en NavBar) |

### Estructura de userData

```javascript
{
  id: "uuid-del-usuario",
  usuario: "nombre_usuario",
  nombre: "Nombre",
  apellido: "Apellido",
  email: "email@ejemplo.com",
  empresa: "Nombre Empresa",
  telefono: "123456789",
  rol: "administrador" | "trabajador" | "supervisor"
}
```

---

## Assets

### Logo.png
- Logo principal de CropTrack
- Ubicacion: `src/assets/Logo.png`
- Usado en: NavBar, LandingPage

---

## Flujo de Autenticacion

```
1. Usuario accede a /login
2. Ingresa credenciales + selecciona rol
3. Frontend valida campos
4. POST a /api/auth/login
5. Backend valida y retorna JWT + userData
6. Frontend guarda en localStorage
7. Redirige a /main
8. ProtectedRoute valida token en cada ruta protegida
9. Logout limpia localStorage y redirige a /
```

---

## Conexion con Backend

La aplicacion se conecta al backend en `http://localhost:4000`.

Las llamadas API se hacen directamente con `fetch()` en cada componente Page (sin servicios externos, todo encapsulado).

```javascript
// Ejemplo de llamada API
const API_URL = 'http://localhost:4000/api/crops';

const response = await fetch(`${API_URL}/user/${userId}`);
const data = await response.json();
```

---

## Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm start

# Ejecutar tests
npm test

# Build para produccion
npm run build
```

---

*CropTrack Frontend - React 19 (c) 2026*
