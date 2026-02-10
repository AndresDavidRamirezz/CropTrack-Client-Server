# CropTrack - Frontend

Aplicacion React para el sistema de gestion agricola CropTrack.

---

## Tecnologias

| Tecnologia | Version | Descripcion |
|------------|---------|-------------|
| React | 19.2.3 | Framework UI |
| React DOM | 19.2.3 | Renderizado DOM |
| React Router DOM | 7.13.0 | Enrutamiento SPA |
| React Scripts | 5.0.1 | Build tools (CRA) |
| Jest | 29.7.0 | Testing unitario e integracion |
| Cypress | 15.9.0 | Testing E2E |

---

## Dependencias

### Produccion

| Dependencia | Version | Descripcion |
|-------------|---------|-------------|
| react | ^19.2.3 | Biblioteca principal de UI |
| react-dom | ^19.2.3 | Renderizado de React en el DOM |
| react-router-dom | ^7.13.0 | Enrutamiento y navegacion SPA |
| react-scripts | 5.0.1 | Scripts de Create React App (build, start) |
| @testing-library/dom | ^10.4.1 | Utilidades DOM para testing |
| web-vitals | ^2.1.4 | Metricas de rendimiento web |

### Desarrollo

| Dependencia | Version | Descripcion |
|-------------|---------|-------------|
| jest | ^29.7.0 | Framework de testing |
| jest-environment-jsdom | ^29.7.0 | Entorno DOM simulado para Jest |
| @testing-library/react | ^16.1.0 | Utilidades de testing para componentes React |
| @testing-library/jest-dom | ^6.6.3 | Matchers adicionales de Jest para el DOM |
| @testing-library/user-event | ^14.6.1 | Simulacion de interacciones de usuario |
| cypress | ^15.9.0 | Framework de testing E2E |
| babel-jest | ^29.7.0 | Transformador Babel para Jest |
| @babel/preset-env | ^7.28.6 | Preset de Babel para ES modules |
| @babel/preset-react | ^7.28.5 | Preset de Babel para JSX |
| identity-obj-proxy | ^3.0.0 | Mock de imports CSS en tests |

---

## Scripts Disponibles

### Desarrollo

| Script | Comando | Descripcion |
|--------|---------|-------------|
| Desarrollo | `npm start` | Inicia en http://localhost:3000 |
| Build | `npm run build` | Compila para produccion |
| Eject | `npm run eject` | Expone configuracion de CRA (irreversible) |

### Testing con Jest

| Script | Comando | Descripcion |
|--------|---------|-------------|
| Tests todos | `npm test` | Ejecuta todos los tests (modo silencioso) |
| Tests watch | `npm run test:watch` | Tests en modo observacion |
| Tests + cobertura | `npm run test:coverage` | Todos los tests con reporte de cobertura |
| Tests verbose | `npm run test:verbose` | Tests con output detallado |
| Tests unitarios | `npm run test:unit` | Solo tests de `tests/unit/` |
| Tests unitarios + cobertura | `npm run test:unit:coverage` | Unitarios con reporte de cobertura |
| Tests unit components | `npm run test:unit:components` | Solo tests de componentes |
| Tests unit services | `npm run test:unit:services` | Solo tests de servicios |
| Tests unit utils | `npm run test:unit:utils` | Solo tests de utilidades |
| Tests integracion | `npm run test:integration` | Solo tests de `tests/integration/` |
| Tests integracion + cobertura | `npm run test:integration:coverage` | Integracion con reporte de cobertura |
| Tests todos + cobertura | `npm run test:all` | Todos los tests con cobertura completa |
| Tests CI | `npm run test:ci` | Tests optimizados para CI (2 workers, silencioso) |
| Tests debug | `npm run test:debug` | Tests con inspector de Node.js |

### Testing E2E con Cypress

| Script | Comando | Descripcion |
|--------|---------|-------------|
| Cypress interactivo | `npm run cypress:open` | Abre Cypress Test Runner |
| Cypress headless | `npm run cypress:run` | Ejecuta tests en terminal |
| Cypress visual | `npm run cypress:run:headed` | Ejecuta con navegador visible |
| E2E headless | `npm run test:e2e` | Alias de cypress:run |
| E2E visual | `npm run test:e2e:headed` | Alias de cypress:run:headed |
| E2E Chrome | `npm run test:e2e:chrome` | Ejecuta E2E en Chrome |
| E2E Firefox | `npm run test:e2e:firefox` | Ejecuta E2E en Firefox |

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
│   │   ├── ProtectedRoutes.jsx
│   │   ├── Crop/
│   │   │   ├── Card/           # CropCard.jsx + CropCard.css
│   │   │   ├── Form/           # CropForm.jsx + CropForm.css
│   │   │   └── List/           # CropList.jsx + CropList.css
│   │   ├── Measurement/
│   │   │   ├── Card/           # MeasurementCard.jsx + .css
│   │   │   ├── Form/           # MeasurementForm.jsx + .css
│   │   │   └── List/           # MeasurementList.jsx + .css
│   │   ├── Task/
│   │   │   ├── Card/           # TaskCard.jsx + TaskCard.css
│   │   │   ├── Form/           # TaskForm.jsx + TaskForm.css
│   │   │   └── List/           # TaskList.jsx + TaskList.css
│   │   └── Worker/
│   │       ├── Card/           # WorkerCard.jsx + WorkerCard.css
│   │       ├── Form/           # WorkerForm.jsx + WorkerForm.css
│   │       └── List/           # WorkerList.jsx + WorkerList.css
│   ├── pages/
│   │   ├── Login/
│   │   │   ├── LoginPage.jsx
│   │   │   └── LoginPage.css
│   │   ├── Register/
│   │   │   ├── RegisterPage.jsx
│   │   │   └── RegisterPage.css
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
│   │   │   ├── ProfilePage.jsx
│   │   │   └── ProfilePage.css
│   │   ├── Extras/
│   │   │   └── ExtrasPage.jsx
│   │   └── MainPage.jsx + MainPage.css
│   ├── services/
│   │   └── authService.js      # Servicios de autenticacion
│   ├── index.js                # Entry point + React Router
│   └── index.css               # Estilos globales
├── tests/
│   ├── unit/
│   │   ├── pages/
│   │   │   ├── LoginPage.test.jsx
│   │   │   └── RegisterPage.test.jsx
│   │   └── components/
│   │       ├── AuthModal.test.jsx
│   │       ├── NavBar.test.jsx
│   │       └── Footer.test.jsx
│   ├── integration/
│   │   ├── LoginPage.integration.test.jsx
│   │   └── RegisterPage.integration.test.jsx
│   ├── e2e/
│   │   ├── login.e2e.cy.js
│   │   └── register.e2e.cy.js
│   ├── setup/
│   │   └── cypress/
│   │       ├── support/
│   │       └── fixtures/
│   └── cypress.config.js
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

### WorkerPage
- **Funcionalidad**: CRUD de trabajadores
- **Componentes**: WorkerForm, WorkerList, WorkerCard
- **API**: `/api/users/*`
- **Campos**: nombre, apellido, email, telefono, rol

### ProfilePage
- **Funcionalidad**: Visualizacion y edicion de datos del usuario
- **Layout**: Card horizontal con avatar/rol + grid de datos personales
- **Edicion**: Formulario con nombre, apellido, email, telefono, cambio de contrasena opcional
- **API**: GET/PUT `/api/users/:id`

---

## Patron de Componentes por Modulo

Cada modulo (Crop, Measurement, Task, Worker) sigue el mismo patron:

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

### List
- Grid responsive de Cards
- Contador de items
- Estado de carga (spinner)
- Estado vacio (mensaje + icono)

---

## Testing

### Estructura de Tests

```
tests/
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
├── setup/
│   └── cypress/
│       ├── support/e2e.js
│       └── fixtures/
└── cypress.config.js
```

### Tests Unitarios (Jest + Testing Library)

**LoginPage.test.jsx**
- Renderizado de AuthModal, inputs de usuario/contrasena, labels, boton submit
- Verificacion de placeholders y textos
- Mocks: react-router-dom, AuthModal, localStorage, fetch

**RegisterPage.test.jsx**
- Renderizado del formulario de registro completo
- Verificacion de todos los campos
- Mocks: react-router-dom, navegacion

**AuthModal.test.jsx**
- Renderizado del modal de seleccion de rol
- Interaccion con opciones

**NavBar.test.jsx**
- Renderizado: navbar, logo, titulo
- Clases CSS aplicadas correctamente
- Estado sin autenticacion
- Estructura: navbar-left, navbar-center, navbar-right

**Footer.test.jsx**
- Renderizado del pie de pagina

### Tests de Integracion (Jest + Testing Library)

**LoginPage.integration.test.jsx**
- Flujo completo de login con formulario
- Interaccion de usuario simulada
- Mocks de API (fetch)
- Verificacion de navegacion post-login

**RegisterPage.integration.test.jsx**
- Flujo completo de registro con todos los campos
- Helper para llenar formulario
- BrowserRouter wrapper para navegacion
- Validaciones del formulario

### Tests E2E (Cypress)

**Configuracion** (`cypress.config.js`):
- Base URL: `http://localhost:3000`
- API URL: `http://localhost:4000/api`
- Viewport: 1280x720
- Reintentos: 2 (run mode), 0 (open mode)
- Videos: desactivados
- Timeouts: 10s (comandos), 30s (pagina)

**login.e2e.cy.js**
- **Prerrequisitos**: Server en 4000, Client en 3000, BD croptrack_test
- **Setup**: Crea usuario de prueba via API
- **Before each**: Limpia localStorage/cookies, visita /login
- **Tests**: Visibilidad del formulario, campos, login exitoso con JWT, almacenamiento en localStorage, redireccion a /main
- Validaciones de campos y mensajes de error

**register.e2e.cy.js**
- **Tests**: Flujo completo de registro, validaciones de formulario, creacion exitosa en BD

### Ejecutar Tests

```bash
# Todos los tests (Jest)
npm test

# Unitarios con cobertura
npm run test:unit:coverage

# Integracion con cobertura
npm run test:integration:coverage

# E2E headless (requiere server + client corriendo)
npm run test:e2e

# E2E interactivo
npm run cypress:open

# Todo con cobertura
npm run test:all
```

---

## Estilos

### Tema de Colores

| Elemento | Color | Hex |
|----------|-------|-----|
| Acento principal | Verde lima | #87D000 |
| Fondo cards (forms) | Gris oscuro | #1e293b |
| Bordes | Gris medio | #334155 |
| Texto principal | Blanco | #ffffff |
| Texto secundario | Gris claro | #94a3b8 |
| Error | Rojo | #ef4444 |
| Exito | Verde | #198754 |
| Advertencia | Amarillo | #ffc107 |

### Paleta por Modulo (en desarrollo)

| Modulo | Color principal | Uso |
|--------|----------------|-----|
| Perfil | Slate (#475569) | Tonos neutros/grises |
| Cosechas | Verde | Por definir |
| Mediciones | Azul | Por definir |
| Tareas | Naranja | Por definir |
| Trabajadores | Violeta | Por definir |

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

# Tests con cobertura
npm run test:all

# Build para produccion
npm run build
```

---

*CropTrack Frontend - React 19 (c) 2026*
