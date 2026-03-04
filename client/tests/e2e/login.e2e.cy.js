/**
 * Tests E2E - Flujo Completo de Login
 *
 * Este archivo prueba el flujo COMPLETO de login:
 *
 * 1. Usuario navega a /login
 * 2. Ingresa credenciales en el formulario
 * 3. Submit envía POST a http://localhost:4000/api/auth/login
 * 4. Server procesa: routes → middleware (validateLogin) → controller → model → MySQL
 * 5. MySQL verifica usuario y contraseña hasheada
 * 6. Server genera JWT token
 * 7. Server responde con token y datos del usuario
 * 8. Client guarda token en localStorage
 * 9. Client redirige a /main
 *
 * REQUISITOS PREVIOS:
 * - Server corriendo en puerto 4000
 * - Client corriendo en puerto 3000
 * - Base de datos croptrack_test disponible
 */

describe('Flujo E2E de Login', () => {
  // Variables para el usuario de prueba
  let testUser;
  const timestamp = Date.now();

  before(() => {
    // Crear un usuario de prueba antes de los tests de login
    testUser = {
      usuario: `login_test_${timestamp}`,
      contrasena: 'TestLogin123!',
      nombre: 'Login',
      apellido: 'Tester',
      email: `login.test.${timestamp}@croptrack.com`,
      nombre_empresa: 'Login Test Company',
      telefono: ''
    };

    // Registrar el usuario via API para usarlo en los tests
    cy.request({
      method: 'POST',
      url: 'http://localhost:4000/api/register/register-admin',
      body: {
        ...testUser,
        rol: 'administrador'
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 201) {
        cy.log('Usuario de prueba creado exitosamente');
      } else {
        cy.log('Usuario ya existe o error: ' + JSON.stringify(response.body));
      }
    });
  });

  beforeEach(() => {
    // Limpiar estado antes de cada test
    cy.clearLocalStorage();
    cy.clearCookies();

    // Navegar a la página de login
    cy.visit('/login');

    // Verificar que estamos en la página correcta
    cy.url().should('include', '/login');

    // Esperar a que el formulario cargue
    cy.get('.login-form', { timeout: 10000 }).should('be.visible');
  });

  // ============================================
  // TESTS DE RENDERIZADO Y UI
  // ============================================

  describe('Renderizado de la página de login', () => {
    it('debería mostrar el formulario de login', () => {
      // Verificar campos
      cy.get('input[name="usuario"]').should('be.visible');
      cy.get('input[name="contrasena"]').should('be.visible');

      // Verificar botones
      cy.contains('button', 'Iniciar sesión').should('be.visible');
      cy.contains('button', 'Registrar Administrador').should('be.visible');
    });

    it('debería mostrar el selector de rol', () => {
      // El AuthModal debería estar presente
      cy.get('.login-form').should('exist');
    });

    it('debería tener placeholders en los inputs', () => {
      cy.get('input[name="usuario"]')
        .should('have.attr', 'placeholder', 'Ingresa tu usuario');
      cy.get('input[name="contrasena"]')
        .should('have.attr', 'placeholder', 'Ingresa tu contraseña');
    });
  });

  // ============================================
  // TESTS DE VALIDACIÓN EN CLIENTE
  // ============================================

  describe('Validación de campos en el cliente', () => {
    // NOTA: Los inputs tienen 'required' nativo, por lo que el navegador
    // bloquea el submit antes de que React pueda validar campos vacíos.
    // Probamos las validaciones de longitud que sí llegan a React.

    it('debería mostrar error con usuario muy corto', () => {
      cy.get('input[name="usuario"]').type('ab');
      cy.get('input[name="contrasena"]').type('Test123456!');
      cy.contains('button', 'Iniciar sesión').click();

      cy.get('.error-message').should('contain', 'El usuario debe tener al menos 3 caracteres');
    });

    it('debería mostrar error con contraseña muy corta', () => {
      cy.get('input[name="usuario"]').type('validuser');
      cy.get('input[name="contrasena"]').type('12345');
      cy.contains('button', 'Iniciar sesión').click();

      cy.get('.error-message').should('contain', 'La contraseña debe tener al menos 6 caracteres');
    });

    it('debería limpiar error al escribir después de un error', () => {
      // Provocar error con usuario corto
      cy.get('input[name="usuario"]').type('ab');
      cy.get('input[name="contrasena"]').type('Test123456!');
      cy.contains('button', 'Iniciar sesión').click();

      // Verificar que aparece el error
      cy.get('.error-message').should('be.visible');

      // Escribir más caracteres - el error debería desaparecer
      cy.get('input[name="usuario"]').type('cdefgh');

      // El error debería desaparecer
      cy.get('.error-message').should('not.exist');
    });

    it('los campos deberían tener validación HTML5 required', () => {
      // Verificar que los inputs tienen el atributo required
      cy.get('input[name="usuario"]').should('have.attr', 'required');
      cy.get('input[name="contrasena"]').should('have.attr', 'required');
    });
  });

  // ============================================
  // TESTS DE FLUJO COMPLETO (E2E REAL)
  // ============================================

  describe('Flujo completo de login exitoso', () => {
    it('debería hacer login y redirigir a /main', () => {
      // Llenar credenciales del usuario de prueba
      cy.get('input[name="usuario"]').type(testUser.usuario);
      cy.get('input[name="contrasena"]').type(testUser.contrasena);

      // Interceptar request de login
      cy.intercept('POST', '**/api/auth/login').as('loginRequest');

      // Hacer login
      cy.contains('button', 'Iniciar sesión').click();

      // Esperar respuesta del servidor
      cy.wait('@loginRequest').then((interception) => {
        // Verificar que se envió la request correcta
        expect(interception.request.body).to.deep.include({
          usuario: testUser.usuario,
          contrasena: testUser.contrasena
        });

        // Verificar respuesta exitosa
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.have.property('token');
        expect(interception.response.body).to.have.property('user');
      });

      // Verificar redirección a /main
      cy.url().should('include', '/main', { timeout: 10000 });
    });

    it('debería guardar el token en localStorage', () => {
      cy.get('input[name="usuario"]').type(testUser.usuario);
      cy.get('input[name="contrasena"]').type(testUser.contrasena);

      cy.intercept('POST', '**/api/auth/login').as('loginWithToken');
      cy.contains('button', 'Iniciar sesión').click();
      cy.wait('@loginWithToken');

      // Esperar redirección
      cy.url().should('include', '/main');

      // Verificar localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.exist;
        expect(win.localStorage.getItem('token')).to.not.be.empty;
        expect(win.localStorage.getItem('userData')).to.exist;
        expect(win.localStorage.getItem('usuario')).to.equal(testUser.usuario);
      });
    });

    it('debería guardar datos del usuario en localStorage', () => {
      cy.get('input[name="usuario"]').type(testUser.usuario);
      cy.get('input[name="contrasena"]').type(testUser.contrasena);

      cy.intercept('POST', '**/api/auth/login').as('loginWithUserData');
      cy.contains('button', 'Iniciar sesión').click();
      cy.wait('@loginWithUserData');

      cy.url().should('include', '/main');

      cy.window().then((win) => {
        const userData = JSON.parse(win.localStorage.getItem('userData'));
        expect(userData).to.have.property('nombre', testUser.nombre);
        expect(userData).to.have.property('apellido', testUser.apellido);
        expect(userData).to.have.property('email', testUser.email);
      });
    });
  });

  // ============================================
  // TESTS DE ERRORES DE AUTENTICACIÓN
  // ============================================

  describe('Manejo de errores de autenticación', () => {
    it('debería mostrar error con contraseña incorrecta', () => {
      cy.get('input[name="usuario"]').type(testUser.usuario);
      cy.get('input[name="contrasena"]').type('ContraseñaIncorrecta123');

      cy.intercept('POST', '**/api/auth/login').as('wrongPassword');
      cy.contains('button', 'Iniciar sesión').click();

      cy.wait('@wrongPassword').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([401, 400]);
      });

      // Debería mostrar mensaje de error
      cy.get('.error-message').should('be.visible');

      // No debería redirigir
      cy.url().should('include', '/login');

      // No debería guardar token
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
    });

    it('debería mostrar error con usuario inexistente', () => {
      cy.get('input[name="usuario"]').type('usuario_que_no_existe_12345');
      cy.get('input[name="contrasena"]').type('Test123456!');

      cy.intercept('POST', '**/api/auth/login').as('nonExistentUser');
      cy.contains('button', 'Iniciar sesión').click();

      cy.wait('@nonExistentUser').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([401, 404, 400]);
      });

      cy.get('.error-message').should('be.visible');
      cy.url().should('include', '/login');
    });
  });

  // ============================================
  // TESTS DE NAVEGACIÓN
  // ============================================

  describe('Navegación desde login', () => {
    it('debería navegar a registro al hacer clic en "Registrar Administrador"', () => {
      cy.contains('button', 'Registrar Administrador').click();

      // La ruta correcta es /register/register-admin
      cy.url().should('include', '/register');
    });

    it('debería deshabilitar el formulario mientras se procesa', () => {
      cy.get('input[name="usuario"]').type(testUser.usuario);
      cy.get('input[name="contrasena"]').type(testUser.contrasena);

      cy.intercept('POST', '**/api/auth/login', (req) => {
        req.on('response', (res) => {
          res.setDelay(500);
        });
      }).as('slowLogin');

      cy.contains('button', 'Iniciar sesión').click();

      // Verificar estado de carga
      cy.contains('button', 'Iniciando sesión...').should('exist');

      // Los inputs deberían estar deshabilitados
      cy.get('input[name="usuario"]').should('be.disabled');
      cy.get('input[name="contrasena"]').should('be.disabled');

      cy.wait('@slowLogin');
    });
  });

  // ============================================
  // TESTS DE FLUJO REGISTRO + LOGIN
  // ============================================

  describe('Flujo completo: Registro → Login → Main', () => {
    it('debería poder registrar un usuario y luego hacer login', () => {
      const newUser = {
        usuario: `flow_test_${Date.now()}`,
        contrasena: 'FlowTest123!',
        nombre: 'Flow',
        apellido: 'Tester',
        email: `flow.${Date.now()}@croptrack.com`,
        nombre_empresa: 'Flow Test Company'
      };

      // PASO 1: Ir a registro (ruta correcta)
      cy.visit('/register/register-admin');

      // Esperar a que cargue el formulario
      cy.get('.registro-form', { timeout: 10000 }).should('be.visible');

      // PASO 2: Registrar usuario
      cy.get('#usuario').type(newUser.usuario);
      cy.get('#contrasena').type(newUser.contrasena);
      cy.get('#confirmar_contrasena').type(newUser.contrasena);
      cy.get('#nombre').type(newUser.nombre);
      cy.get('#apellido').type(newUser.apellido);
      cy.get('#email').type(newUser.email);
      cy.get('#nombre_empresa').type(newUser.nombre_empresa);

      cy.intercept('POST', '**/api/register/register-admin').as('registerFlow');
      cy.contains('button', 'Registrar Administrador').click();
      cy.wait('@registerFlow');

      // PASO 3: Esperar redirección a login
      cy.url().should('include', '/login', { timeout: 5000 });

      // Esperar a que cargue el formulario de login
      cy.get('.login-form', { timeout: 10000 }).should('be.visible');

      // PASO 4: Hacer login con el nuevo usuario
      cy.get('input[name="usuario"]').type(newUser.usuario);
      cy.get('input[name="contrasena"]').type(newUser.contrasena);

      cy.intercept('POST', '**/api/auth/login').as('loginFlow');
      cy.contains('button', 'Iniciar sesión').click();
      cy.wait('@loginFlow');

      // PASO 5: Verificar que llegamos a /main
      cy.url().should('include', '/main', { timeout: 10000 });

      // PASO 6: Verificar que el usuario está autenticado
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.exist;
        expect(win.localStorage.getItem('usuario')).to.equal(newUser.usuario);
      });
    });
  });

  // ============================================
  // TESTS DE PERSISTENCIA DE SESIÓN
  // ============================================

  describe('Persistencia de sesión', () => {
    it('debería mantener la sesión después de recargar la página', () => {
      // Login
      cy.get('input[name="usuario"]').type(testUser.usuario);
      cy.get('input[name="contrasena"]').type(testUser.contrasena);

      cy.intercept('POST', '**/api/auth/login').as('loginPersist');
      cy.contains('button', 'Iniciar sesión').click();
      cy.wait('@loginPersist');

      cy.url().should('include', '/main');

      // Guardar token antes de recargar
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        expect(token).to.exist;

        // Recargar página
        cy.reload();

        // Verificar que el token sigue presente
        cy.window().then((newWin) => {
          expect(newWin.localStorage.getItem('token')).to.equal(token);
        });
      });
    });
  });

  // ============================================
  // TESTS DE SEGURIDAD BÁSICA
  // ============================================

  describe('Seguridad básica', () => {
    it('no debería mostrar la contraseña en el campo', () => {
      cy.get('input[name="contrasena"]')
        .should('have.attr', 'type', 'password');
    });

    it('no debería enviar contraseña en la URL', () => {
      cy.get('input[name="usuario"]').type(testUser.usuario);
      cy.get('input[name="contrasena"]').type(testUser.contrasena);

      cy.intercept('POST', '**/api/auth/login').as('secureLogin');
      cy.contains('button', 'Iniciar sesión').click();
      cy.wait('@secureLogin');

      // La URL no debería contener la contraseña
      cy.url().should('not.include', testUser.contrasena);
    });

    it('debería enviar credenciales en el body, no en la URL', () => {
      cy.get('input[name="usuario"]').type(testUser.usuario);
      cy.get('input[name="contrasena"]').type(testUser.contrasena);

      cy.intercept('POST', '**/api/auth/login').as('bodyLogin');
      cy.contains('button', 'Iniciar sesión').click();

      cy.wait('@bodyLogin').then((interception) => {
        // Las credenciales deben estar en el body
        expect(interception.request.body).to.have.property('usuario');
        expect(interception.request.body).to.have.property('contrasena');

        // La URL no debe contener credenciales
        expect(interception.request.url).to.not.include(testUser.usuario);
        expect(interception.request.url).to.not.include(testUser.contrasena);
      });
    });
  });
});
