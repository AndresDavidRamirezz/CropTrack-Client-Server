/**
 * Comandos Personalizados de Cypress
 *
 * Estos comandos son funciones reutilizables que simplifican los tests.
 * Se pueden usar como: cy.nombreDelComando()
 *
 * Documentación: https://on.cypress.io/custom-commands
 */

// ============================================
// COMANDOS DE FORMULARIO
// ============================================

/**
 * Llenar un campo de formulario por su ID o name
 * @param {string} selector - ID o name del campo
 * @param {string} value - Valor a escribir
 */
Cypress.Commands.add('fillField', (selector, value) => {
  // Intentar por ID primero, luego por name
  cy.get(`#${selector}, [name="${selector}"]`)
    .first()
    .clear()
    .type(value);
});

/**
 * Limpiar y escribir en un campo
 * @param {string} selector - Selector CSS
 * @param {string} value - Valor a escribir
 */
Cypress.Commands.add('clearAndType', (selector, value) => {
  cy.get(selector).clear().type(value);
});

// ============================================
// COMANDOS DE AUTENTICACIÓN
// ============================================

/**
 * Registrar un nuevo usuario administrador
 * @param {Object} userData - Datos del usuario
 */
Cypress.Commands.add('registerAdmin', (userData) => {
  const {
    usuario,
    contrasena,
    nombre,
    apellido,
    email,
    nombre_empresa,
    telefono = ''
  } = userData;

  // Navegar a página de registro
  cy.visit('/register');

  // Llenar formulario
  cy.fillField('usuario', usuario);
  cy.fillField('contrasena', contrasena);
  cy.fillField('confirmar_contrasena', contrasena);
  cy.fillField('nombre', nombre);
  cy.fillField('apellido', apellido);
  cy.fillField('email', email);
  cy.fillField('nombre_empresa', nombre_empresa);

  if (telefono) {
    cy.fillField('telefono', telefono);
  }

  // Enviar formulario
  cy.get('form').submit();
});

/**
 * Hacer login con credenciales
 * @param {string} usuario - Nombre de usuario
 * @param {string} contrasena - Contraseña
 */
Cypress.Commands.add('login', (usuario, contrasena) => {
  cy.visit('/login');

  cy.fillField('usuario', usuario);
  cy.fillField('contrasena', contrasena);

  cy.get('form').submit();
});

/**
 * Hacer login y verificar que fue exitoso
 * @param {string} usuario - Nombre de usuario
 * @param {string} contrasena - Contraseña
 */
Cypress.Commands.add('loginAndVerify', (usuario, contrasena) => {
  cy.login(usuario, contrasena);

  // Esperar redirección a /main
  cy.url().should('include', '/main', { timeout: 10000 });

  // Verificar que el token se guardó
  cy.window().then((win) => {
    expect(win.localStorage.getItem('token')).to.exist;
  });
});

/**
 * Hacer logout limpiando el localStorage
 */
Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage();
  cy.visit('/login');
});

// ============================================
// COMANDOS DE API
// ============================================

/**
 * Hacer request directo al API (sin pasar por la UI)
 * Útil para setup/cleanup de tests
 * @param {string} endpoint - Endpoint de la API (sin /api)
 * @param {string} method - Método HTTP
 * @param {Object} body - Cuerpo de la request
 */
Cypress.Commands.add('apiRequest', (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    url: `http://localhost:4000/api${endpoint}`,
    headers: {
      'Content-Type': 'application/json'
    },
    failOnStatusCode: false
  };

  if (body) {
    options.body = body;
  }

  return cy.request(options);
});

/**
 * Registrar usuario directamente via API (bypass UI)
 * Útil para setup de tests de login
 * @param {Object} userData - Datos del usuario
 */
Cypress.Commands.add('apiRegisterAdmin', (userData) => {
  return cy.apiRequest('/register/register-admin', 'POST', {
    usuario: userData.usuario,
    contrasena: userData.contrasena,
    nombre: userData.nombre,
    apellido: userData.apellido,
    email: userData.email,
    nombre_empresa: userData.nombre_empresa,
    telefono: userData.telefono || null,
    rol: 'administrador'
  });
});

/**
 * Limpiar usuarios de prueba de la base de datos
 * Hace request al endpoint de cleanup (si existe)
 * @param {string} email - Email del usuario a eliminar
 */
Cypress.Commands.add('cleanupTestUser', (email) => {
  // Esto es un ejemplo - requiere un endpoint en el server
  // Por ahora, simplemente hacemos log
  cy.log(`Cleanup: Usuario con email ${email} debería ser eliminado`);
});

// ============================================
// COMANDOS DE VERIFICACIÓN
// ============================================

/**
 * Verificar que se muestra un mensaje de error
 * @param {string} message - Texto del mensaje de error
 */
Cypress.Commands.add('shouldShowError', (message) => {
  cy.contains(message, { timeout: 5000 }).should('be.visible');
});

/**
 * Verificar que se muestra un mensaje de éxito
 * @param {string} message - Texto del mensaje de éxito
 */
Cypress.Commands.add('shouldShowSuccess', (message) => {
  cy.contains(message, { timeout: 5000 }).should('be.visible');
});

/**
 * Verificar que un campo tiene error de validación
 * @param {string} fieldName - Nombre del campo
 */
Cypress.Commands.add('fieldShouldHaveError', (fieldName) => {
  cy.get(`#${fieldName}, [name="${fieldName}"]`)
    .first()
    .should('have.class', 'input-error');
});

/**
 * Verificar que estamos en una ruta específica
 * @param {string} path - Ruta esperada
 */
Cypress.Commands.add('shouldBeOnPage', (path) => {
  cy.url().should('include', path);
});

// ============================================
// COMANDOS DE ESPERA
// ============================================

/**
 * Esperar a que el servidor esté listo
 * Hace ping al servidor hasta que responda
 */
Cypress.Commands.add('waitForServer', () => {
  cy.request({
    url: 'http://localhost:4000/api/health',
    failOnStatusCode: false,
    timeout: 30000
  }).then((response) => {
    if (response.status !== 200) {
      cy.log('Servidor no disponible, reintentando...');
      cy.wait(2000);
      cy.waitForServer();
    }
  });
});

/**
 * Esperar a que un elemento desaparezca
 * @param {string} selector - Selector CSS del elemento
 */
Cypress.Commands.add('waitForElementToDisappear', (selector) => {
  cy.get(selector).should('not.exist');
});

// ============================================
// COMANDOS DE DEBUG
// ============================================

/**
 * Log detallado de localStorage
 */
Cypress.Commands.add('logLocalStorage', () => {
  cy.window().then((win) => {
    const storage = {};
    for (let i = 0; i < win.localStorage.length; i++) {
      const key = win.localStorage.key(i);
      storage[key] = win.localStorage.getItem(key);
    }
    cy.log('localStorage:', JSON.stringify(storage, null, 2));
  });
});
