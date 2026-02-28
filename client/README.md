# CropTrack — Frontend

Aplicación React 19 SPA (Single Page Application) para el sistema de gestión agrícola CropTrack. Se comunica con la API Express vía Axios, gestiona autenticación JWT en localStorage y soporta upload de imágenes y descarga de reportes PDF.

---

## Índice

- [Scripts disponibles](#scripts-disponibles)
- [Variables de entorno](#variables-de-entorno)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Dependencias](#dependencias)
- [Punto de entrada (src/index.js)](#punto-de-entrada-srcindexjs)
- [Sistema de rutas](#sistema-de-rutas)
- [Conexión con el backend (axiosConfig)](#conexión-con-el-backend-axiosconfig)
- [Almacenamiento local](#almacenamiento-local-localstorage)
- [Componentes globales](#componentes-globales)
- [Páginas](#páginas)
- [Patrón de componentes por módulo](#patrón-de-componentes-por-módulo)
- [Services](#services)
- [Estilos y responsive](#estilos-y-responsive)
- [Deploy en Netlify](#deploy-en-netlify)
- [Testing](#testing)

---

## Scripts disponibles

### Desarrollo y build

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia en http://localhost:3000 (hot reload) |
| `npm run build` | Compila la app para producción en `build/` |
| `npm run eject` | Expone la configuración de CRA — **irreversible** |

### Testing con Jest

| Script | Descripción |
|--------|-------------|
| `npm test` | Todos los tests (modo silencioso) |
| `npm run test:watch` | Tests en modo observación (re-ejecuta al guardar) |
| `npm run test:coverage` | Todos los tests con reporte de cobertura |
| `npm run test:unit` | Solo tests de `tests/unit/` |
| `npm run test:unit:coverage` | Unitarios con cobertura |
| `npm run test:integration` | Solo tests de `tests/integration/` |
| `npm run test:integration:coverage` | Integración con cobertura |
| `npm run test:all` | Todos los tests con cobertura completa |
| `npm run test:ci` | Optimizado para CI (2 workers, silencioso) |

### Testing E2E con Cypress

| Script | Descripción |
|--------|-------------|
| `npm run cypress:open` | Abre Cypress Test Runner interactivo |
| `npm run test:e2e` | Ejecuta E2E en modo headless |
| `npm run test:e2e:headed` | Ejecuta E2E con navegador visible |
| `npm run test:e2e:chrome` | Ejecuta E2E en Chrome |
| `npm run test:e2e:firefox` | Ejecuta E2E en Firefox |

---

## Variables de entorno

### `client/.env.production` (producción — Netlify)

```env
REACT_APP_API_URL=https://tu-servidor.onrender.com
```

### `client/.env.local` (desarrollo local — no se sube al repo)

```env
REACT_APP_API_URL=http://localhost:4000
```

`REACT_APP_API_URL` es la base URL del servidor. Todos los componentes y servicios la consumen como:

```javascript
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
```

---

## Estructura de carpetas

```
client/
├── public/
│   ├── index.html          # HTML principal — incluye fuente Inter (Google Fonts)
│   ├── favicon.png         # Logo de CropTrack como favicon de la pestaña
│   └── _redirects          # Netlify: "/* /index.html 200" para SPA routing
│
├── src/
│   ├── index.js            # Entry point: React + Router + rutas + layout global
│   ├── index.css           # Estilos globales: reset, body, #root, main
│   │
│   ├── api/
│   │   └── axiosConfig.js  # Instancia de Axios con baseURL + interceptor JWT
│   │
│   ├── assets/
│   │   ├── Logo.png           # Logo de CropTrack (NavBar, PDF header)
│   │   ├── ImagenLogin.png    # Imagen decorativa de la pantalla de login
│   │   └── ImagenRegistro.png # Imagen decorativa de la pantalla de registro
│   │
│   ├── components/
│   │   ├── AuthModal/         # Modal selector de rol (login)
│   │   ├── Footer/            # Pie de página con info institucional
│   │   ├── NavBar/            # Barra de navegación global
│   │   ├── NavigationButtons/ # Botones de navegación reutilizables
│   │   ├── ProtectedRoutes.jsx# HOC que verifica JWT antes de renderizar
│   │   ├── Crop/
│   │   │   ├── Card/          # CropCard: tarjeta de una cosecha
│   │   │   ├── Form/          # CropForm: formulario crear/editar cosecha
│   │   │   └── List/          # CropList: grilla de CropCards
│   │   ├── Measurement/
│   │   │   ├── Card/          # MeasurementCard
│   │   │   ├── Form/          # MeasurementForm (carga supervisores de la cosecha)
│   │   │   └── List/          # MeasurementList
│   │   ├── Task/
│   │   │   ├── Card/          # TaskCard
│   │   │   ├── Form/          # TaskForm (carga trabajadores de la cosecha + webcam)
│   │   │   └── List/          # TaskList
│   │   └── Worker/
│   │       ├── Card/          # WorkerCard
│   │       ├── Form/          # WorkerForm
│   │       └── List/          # WorkerList
│   │
│   ├── pages/
│   │   ├── MainPage.jsx/.css      # Dashboard post-login
│   │   ├── Login/
│   │   │   ├── LoginPage.jsx      # Pantalla de login con selector de rol
│   │   │   └── LoginPage.css
│   │   ├── Register/
│   │   │   ├── RegisterPage.jsx   # Registro de administrador
│   │   │   └── RegisterPage.css
│   │   ├── Crop/
│   │   │   ├── CropPage.jsx       # CRUD cosechas + asignación de personal
│   │   │   └── CropPage.css
│   │   ├── Measurement/
│   │   │   ├── MeasurementPage.jsx
│   │   │   └── MeasurementPage.css
│   │   ├── Task/
│   │   │   ├── TaskPage.jsx
│   │   │   └── TaskPage.css
│   │   ├── Worker/
│   │   │   ├── WorkerPage.jsx     # CRUD trabajadores + supervisores
│   │   │   └── WorkerPage.css
│   │   ├── Profile/
│   │   │   ├── ProfilePage.jsx    # Ver y editar datos del usuario logueado
│   │   │   └── ProfilePage.css
│   │   └── Report/
│   │       ├── ReportPage.jsx     # Genera y previsualiza PDFs por cosecha
│   │       └── ReportPage.css
│   │
│   └── services/
│       └── authService.js     # Funciones de login/logout/registro
│
└── tests/
    ├── unit/
    │   ├── pages/
    │   │   ├── LoginPage.test.jsx
    │   │   └── RegisterPage.test.jsx
    │   └── components/
    │       ├── AuthModal.test.jsx
    │       ├── NavBar.test.jsx
    │       └── Footer.test.jsx
    ├── integration/
    │   ├── LoginPage.integration.test.jsx
    │   └── RegisterPage.integration.test.jsx
    ├── e2e/
    │   ├── login.e2e.cy.js
    │   └── register.e2e.cy.js
    └── cypress.config.js
```

---

## Dependencias

### Producción

| Dependencia | Versión | Descripción |
|-------------|---------|-------------|
| `react` | ^19.2.3 | Librería principal de UI con hooks |
| `react-dom` | ^19.2.3 | Renderizado de React en el DOM del navegador |
| `react-router-dom` | ^7.13.0 | Enrutamiento SPA, `BrowserRouter`, `Routes`, `Route` |
| `axios` | ^1.13.5 | Cliente HTTP; se usa con interceptor para adjuntar JWT automáticamente |
| `react-scripts` | 5.0.1 | Build tools de Create React App (webpack, babel, dev server) |
| `@testing-library/dom` | ^10.4.1 | Utilidades DOM base para testing |
| `web-vitals` | ^2.1.4 | Métricas de rendimiento web (CLS, FID, LCP) |

### Desarrollo

| Dependencia | Versión | Descripción |
|-------------|---------|-------------|
| `jest` | ^29.7.0 | Framework de testing (reemplaza el jest de CRA) |
| `jest-environment-jsdom` | ^29.7.0 | Simula el DOM del navegador en Node.js para los tests |
| `@testing-library/react` | ^16.1.0 | Renderiza componentes React en tests con `render()` |
| `@testing-library/jest-dom` | ^6.6.3 | Matchers adicionales: `toBeInTheDocument`, `toHaveValue`, etc. |
| `@testing-library/user-event` | ^14.6.1 | Simula interacciones reales del usuario (click, type, etc.) |
| `cypress` | ^15.9.0 | Framework de tests E2E en navegador real |
| `babel-jest` | ^29.7.0 | Transformador para que Jest entienda JSX y ES Modules |
| `@babel/preset-env` | ^7.28.6 | Transpila ES2015+ a CommonJS para Jest |
| `@babel/preset-react` | ^7.28.5 | Transpila JSX para Jest |
| `identity-obj-proxy` | ^3.0.0 | Mockea los imports de CSS en tests (evita errores de parsing) |

---

## Punto de entrada (src/index.js)

Monta la aplicación con el layout global:
- `<NavBar />` fuera del `<Routes>` → aparece en todas las páginas
- `<main>` contiene el `<Routes>` → el contenido cambia por ruta
- `<Footer />` fuera del `<Routes>` → aparece en todas las páginas

```javascript
<BrowserRouter>
  <NavBar />
  <main>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/register-admin" element={<RegisterPage />} />
      <Route path="/crops"        element={<ProtectedRoute><CropPage /></ProtectedRoute>} />
      <Route path="/measurements" element={<ProtectedRoute><MeasurementPage /></ProtectedRoute>} />
      <Route path="/tasks"        element={<ProtectedRoute><TaskPage /></ProtectedRoute>} />
      <Route path="/users"        element={<ProtectedRoute><WorkerPage /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/report"       element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
      <Route path="/main"         element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
    </Routes>
  </main>
  <Footer />
</BrowserRouter>
```

---

## Sistema de rutas

### Rutas públicas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Inline en index.js | Landing page de bienvenida |
| `/login` | `LoginPage` | Formulario de inicio de sesión con selector de rol |
| `/register/register-admin` | `RegisterPage` | Registro de nuevo administrador |

### Rutas protegidas

Todas requieren `token` y `userData` válidos en localStorage. `ProtectedRoute` redirige a `/` si no hay sesión activa.

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/main` | `MainPage` | Dashboard con navegación a los módulos |
| `/crops` | `CropPage` | CRUD de cosechas con asignación de personal |
| `/measurements` | `MeasurementPage` | CRUD de mediciones de campo |
| `/tasks` | `TaskPage` | CRUD de tareas agrícolas |
| `/users` | `WorkerPage` | CRUD de trabajadores y supervisores |
| `/profile` | `ProfilePage` | Ver y editar datos del usuario logueado |
| `/report` | `ReportPage` | Generación y descarga de reportes PDF |

---

## Conexión con el backend (axiosConfig)

`src/api/axiosConfig.js` exporta una instancia de Axios con:

1. **`baseURL`**: toma el valor de `REACT_APP_API_URL` o cae en `http://localhost:4000`
2. **Interceptor de request**: adjunta el token JWT del localStorage en el header `Authorization: Bearer <token>` en cada llamada automáticamente

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Las páginas y el authService importan esta instancia (`import api from '../../api/axiosConfig'`) y usan `api.get(...)`, `api.post(...)`, etc.

> **Nota importante sobre CSS global**: este proyecto usa CSS global (sin CSS Modules). Varios archivos CSS definen las mismas clases (`.form-input`, `.btn-submit`, etc.). Siempre usar el selector del contenedor padre para evitar colisiones: `.crop-form .form-input` en lugar de `.form-input`.

---

## Almacenamiento local (localStorage)

| Key | Tipo | Descripción |
|-----|------|-------------|
| `token` | String | JWT de autenticación. Expira en 7 días |
| `userData` | JSON | Objeto completo del usuario logueado |
| `usuario` | String | Nombre de usuario para mostrar en NavBar |

### Estructura de `userData`

```javascript
{
  id: "uuid-del-usuario",
  usuario: "nombre_usuario",
  nombre: "Nombre",
  apellido: "Apellido",
  email: "email@empresa.com",
  empresa: "Nombre de Empresa",
  telefono: "123456789",    // puede ser null
  rol: "administrador" | "supervisor" | "trabajador",
  imagen_url: "https://res.cloudinary.com/..."  // puede ser null
}
```

---

## Componentes globales

### `NavBar.jsx`

Barra de navegación visible en todas las páginas. Muestra:
- Logo y nombre "CropTrack" (link a `/`)
- Badge con el rol del usuario (si está autenticado)
- Nombre del usuario logueado
- Botón "Iniciar sesión" si no hay sesión, "Cerrar sesión" si hay

### `Footer.jsx`

Pie de página con información institucional (Universidad del Norte Santo Tomás de Aquino) y copyright.

### `ProtectedRoutes.jsx`

HOC (Higher Order Component) que envuelve rutas privadas. Lee `token` y `userData` del localStorage; si no existen redirige a `/` con `<Navigate>`. Si existen, renderiza los `children`.

### `AuthModal.jsx`

Modal de selección de rol que aparece en la pantalla de login. Presenta tres opciones: Administrador, Supervisor y Trabajador. El rol seleccionado se envía junto a las credenciales en el `POST /api/auth/login`.

### `NavigationButtons.jsx`

Botones reutilizables para navegar entre las secciones del sistema desde el dashboard.

---

## Páginas

### `LoginPage`

- **Descripción**: Pantalla de inicio de sesión
- **Componentes**: `AuthModal` para selección de rol
- **Campos**: `usuario`, `contrasena`
- **Validaciones cliente**: usuario ≥ 3 chars, contraseña ≥ 6 chars
- **API**: `POST /api/auth/login`
- **Al éxito**: guarda `token`, `userData`, `usuario` en localStorage y redirige a `/main`

### `RegisterPage`

- **Descripción**: Registro de nuevo administrador
- **Campos**: `usuario`, `contrasena`, `confirmar_contrasena`, `nombre`, `apellido`, `email`, `nombre_empresa`, `telefono` (opcional)
- **Validaciones**: usuario alfanumérico, contraseñas coincidentes con indicador de fortaleza, email válido
- **API**: `POST /api/register/register-admin`

### `CropPage`

- **Descripción**: Módulo de gestión de cosechas (CRUD completo)
- **Flujo**: carga las cosechas del usuario → muestra `CropList` con `CropCard` → botón "Nueva Cosecha" abre `CropForm` → al guardar llama a la API
- **Extra**: desde cada `CropCard` se puede gestionar la asignación de personal (trabajadores y supervisores) vía `PUT /api/crops/:id/workers`
- **Upload de imagen**: en modo edición, `CropForm` sube la imagen con `PUT /api/crops/:id/image`
- **API**: `/api/crops/*`

### `MeasurementPage`

- **Descripción**: Módulo de mediciones de campo
- **Flujo**: `MeasurementForm` carga primero las cosechas del usuario → al seleccionar una cosecha, fetchea `GET /api/crops/:cropId/workers?rol=supervisor` para poblar el dropdown de supervisores (solo muestra los que están asignados a esa cosecha)
- **Campos**: `cultivo_id`, `supervisor` (usuario_id), `tipo_medicion`, `valor`, `unidad`, `fecha_medicion`, `observaciones`
- **Tipos de medición**: temperatura, humedad, pH, nutrientes, altura, peso, rendimiento, plaga, enfermedad, riego, fertilización, otro
- **API**: `/api/measurements/*`

### `TaskPage`

- **Descripción**: Módulo de gestión de tareas
- **Flujo**: `TaskForm` carga las cosechas del usuario → al seleccionar una cosecha, fetchea `GET /api/crops/:cropId/workers?rol=trabajador` para poblar el dropdown de asignación (solo trabajadores de esa cosecha)
- **Extra**: en modo edición, `TaskForm` incluye sección de imagen con botón "Subir imagen" y botón "Tomar foto" (webcam usando `getUserMedia`, con fallback a input de cámara nativa)
- **Campos**: `titulo`, `cultivo_id`, `asignado_a`, `prioridad`, `estado`, `fecha_inicio`, `fecha_limite`, `descripcion`, `observaciones`
- **API**: `/api/tasks/*`

### `WorkerPage`

- **Descripción**: Módulo de gestión de trabajadores y supervisores
- **Flujo**: carga todos los usuarios de la empresa (no-admins) → muestra `WorkerList` → `WorkerForm` para crear o editar
- **Campos editables**: nombre, apellido, email, teléfono, contraseña (opcional al editar)
- **Al crear**: el rol (`trabajador` o `supervisor`) es obligatorio y se selecciona en el formulario
- **API**: `/api/users/*`

### `ProfilePage`

- **Descripción**: Perfil del usuario logueado
- **Layout**: card horizontal con avatar (imagen de Cloudinary o inicial del nombre), badge de rol, grid de datos personales
- **Sección de imagen**: botón "Cambiar foto" (upload) + botón "Eliminar foto"
- **Edición**: formulario con nombre, apellido, email, teléfono y contraseña opcional
- **API**: `GET /api/users/:id`, `PUT /api/users/:id`, `PUT /api/users/:id/image`, `DELETE /api/users/:id/image`

### `ReportPage`

- **Descripción**: Generación de reportes PDF por cosecha
- **Flujo**:
  1. Carga las cosechas del usuario (`GET /api/crops/user/:id`)
  2. Muestra una grilla de tarjetas, una por cosecha
  3. Al hacer click en una tarjeta, llama `GET /api/reports/:cropId` con `responseType: 'blob'`
  4. Crea un `Blob` con el PDF y genera una URL de objeto con `URL.createObjectURL`
  5. Muestra la URL en un `<iframe>` dentro de un modal de previsualización
  6. Botón "Descargar PDF" crea un `<a>` programático con `download` para forzar la descarga
- **Nombre del archivo al descargar**: `reporte-{nombreCosecha}-{cropId}.pdf` (el `info.Title` del PDF tiene el mismo formato para que el nombre coincida también al imprimir)
- **API**: `GET /api/reports/:cropId`

### `MainPage`

Dashboard principal post-login con accesos directos a todos los módulos.

---

## Patrón de componentes por módulo

Cada módulo (Crop, Measurement, Task, Worker) sigue la misma estructura de tres capas:

```
[Módulo]/
├── Card/   → [Módulo]Card.jsx + .css   — tarjeta individual
├── Form/   → [Módulo]Form.jsx + .css   — formulario crear/editar
└── List/   → [Módulo]List.jsx + .css   — grilla de tarjetas
```

### Card
- Muestra los datos más relevantes del item
- Badges de estado/prioridad con colores definidos
- Acciones: "Editar" (pasa el item como `initialData` al Form), "Eliminar" (con confirmación)
- En `CropCard`: también muestra imagen de la cosecha y el estado con color dinámico

### Form
- Modo **crear**: estado inicial vacío, botón "Crear"
- Modo **editar**: detecta `initialData !== null`, pre-llena los campos, botón "Actualizar"
- Validaciones en el cliente antes de enviar
- Los campos de asignación de personal (supervisor en MeasurementForm, trabajador en TaskForm) se deshabilitan hasta que se seleccione una cosecha, luego se cargan dinámicamente con `GET /api/crops/:cropId/workers?rol=...`

### List
- Grid responsive (2 columnas en desktop, 1 en mobile)
- Estado de carga: spinner centrado
- Estado vacío: ícono + mensaje descriptivo
- Contador de items en el header

---

## Services

### `src/services/authService.js`

Funciones auxiliares para autenticación:
- `login(usuario, contrasena, rol)`: llama `POST /api/auth/login` y guarda los datos en localStorage
- `logout()`: limpia localStorage y redirige
- `isAuthenticated()`: verifica si existe token en localStorage
- `getUserData()`: parsea y devuelve `userData` del localStorage

### `src/api/axiosConfig.js`

Ver sección [Conexión con el backend](#conexión-con-el-backend-axiosconfig).

---

## Estilos y responsive

### Tema de colores

| Elemento | Color | Hex |
|----------|-------|-----|
| Acento principal | Verde lima | `#87D000` |
| Fondo páginas | Gris claro | `#f1f5f9` |
| Fondo cards | Blanco | `#ffffff` |
| Texto principal | Gris oscuro | `#1e293b` |
| Error | Rojo | `#ef4444` |
| Éxito | Verde | `#198754` |
| Advertencia | Amarillo | `#ffc107` |

### Breakpoints responsive

| Breakpoint | Ancho | Comportamiento |
|------------|-------|----------------|
| Desktop | > 768px | Grid de 2+ columnas; padding lateral del 10% en las páginas principales |
| Tablet | ≤ 768px | Grid de 1 columna, formularios apilados, padding lateral estándar (30px) |
| Móvil | ≤ 480px | Layout compacto, botones full-width, fuentes reducidas |

Las páginas principales (`CropPage`, `MeasurementPage`, `TaskPage`, `WorkerPage`, `ProfilePage`, `ReportPage`) tienen al final de su CSS:

```css
@media (min-width: 769px) {
  .{page-name} {
    padding-left: 10%;
    padding-right: 10%;
  }
}
```

### CSS global vs. modular

Este proyecto **no usa CSS Modules**. Todos los estilos son globales. Regla importante: **siempre usar el selector del contenedor padre** para evitar colisiones entre páginas:

```css
/* Correcto */
.crop-form .form-input { ... }

/* Incorrecto — puede afectar inputs de otras páginas */
.form-input { ... }
```

---

## Deploy en Netlify

1. Conectar el repositorio a Netlify
2. Configurar:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`
3. Agregar variable de entorno: `REACT_APP_API_URL=https://tu-servidor.onrender.com`
4. El archivo `client/public/_redirects` contiene `/* /index.html 200` — esto es **crítico** para que el SPA routing funcione al navegar directo a una ruta o refrescar la página

---

## Testing

### Tests unitarios (Jest + Testing Library)

**`LoginPage.test.jsx`**
- Renderiza el formulario con inputs de usuario y contraseña
- Renderiza el componente `AuthModal`
- Verifica placeholders, labels y botón submit
- Mocks: `react-router-dom`, `AuthModal`, `localStorage`, `fetch`

**`RegisterPage.test.jsx`**
- Renderiza todos los campos del formulario de registro
- Verifica labels y estructura del formulario
- Mocks: `react-router-dom`, navegación

**`AuthModal.test.jsx`**
- Renderiza las tres opciones de rol
- Interacción con las opciones

**`NavBar.test.jsx`**
- Renderiza logo, título y estructura (navbar-left, center, right)
- Estado sin autenticación: muestra botón de login
- Clases CSS correctas

**`Footer.test.jsx`**
- Renderiza el contenido del pie de página

### Tests de integración (Jest + Testing Library)

**`LoginPage.integration.test.jsx`**
- Flujo completo: render → llenar campos → submit → respuesta mock de API → redirección
- Verifica que el token se guarda en localStorage tras login exitoso

**`RegisterPage.integration.test.jsx`**
- Flujo completo de registro con todos los campos
- Helper para llenar el formulario programáticamente
- Valida respuestas de error del servidor

### Tests E2E (Cypress)

Configuración en `tests/cypress.config.js`:
- Base URL: `http://localhost:3000`
- Viewport: 1280×720
- Timeouts: 10s (comandos), 30s (carga de página)

**`login.e2e.cy.js`**
- Prerrequisitos: server en 4000, client en 3000, BD `croptrack_test` con datos
- Setup: crea usuario de prueba via API antes del test
- Tests: visibilidad del formulario, login exitoso con JWT real, almacenamiento en localStorage, redirección a `/main`
- Validaciones de campos vacíos y mensajes de error

**`register.e2e.cy.js`**
- Flujo completo de registro
- Validaciones del formulario
- Verificación de creación en BD

### Ejecutar tests

```bash
npm test                        # Todos (silencioso)
npm run test:unit:coverage      # Unitarios con reporte de cobertura
npm run test:integration        # Tests de integración
npm run test:e2e                # E2E headless (requiere server + client corriendo)
npm run cypress:open            # E2E interactivo
```

---

*CropTrack Frontend — React 19 © 2026*
