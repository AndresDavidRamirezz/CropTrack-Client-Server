/**
 * Tests E2E - Flujo Completo de Registro
 *
 * Este archivo prueba el flujo COMPLETO de registro:
 *
 * 1. Usuario navega a /register/register-admin
 * 2. Llena el formulario con datos válidos
 * 3. Submit envía POST a http://localhost:4000/api/register/register-admin
 * 4. Server procesa: routes → middleware (validate) → controller → model → MySQL
 * 5. MySQL guarda el usuario en tabla 'users'
 * 6. Server responde con éxito
 * 7. Client muestra mensaje de éxito
 * 8. Client redirige a /login
 *
 * REQUISITOS PREVIOS:
 * - Server corriendo en puerto 4000
 * - Client corriendo en puerto 3000
 * - Base de datos croptrack_test disponible
 */

describe('Flujo E2E de Registro de Administrador', () => {
  // Cargar fixtures con datos de prueba
  let testUsers;

  before(() => {
    // Cargar datos de usuarios de prueba
    cy.fixture('users').then((users) => {
      testUsers = users;
    });
  });

  beforeEach(() => {
    // Limpiar estado antes de cada test
    cy.clearLocalStorage();
    cy.clearCookies();

    // Navegar a la página de registro (ruta correcta)
    cy.visit('/register/register-admin');

    // Verificar que estamos en la página correcta
    cy.url().should('include', '/register/register-admin');

    // Esperar a que el formulario cargue
    cy.get('.registro-form', { timeout: 10000 }).should('be.visible');
  });

  // ============================================
  // TESTS DE RENDERIZADO Y UI
  // ============================================

  describe('Renderizado de la página', () => {
    it('debería mostrar todos los campos del formulario', () => {
      // Verificar título
      cy.get('h2').should('contain', 'Registro de Administrador');

      // Verificar campos obligatorios
      cy.get('#usuario').should('be.visible');
      cy.get('#contrasena').should('be.visible');
      cy.get('#confirmar_contrasena').should('be.visible');
      cy.get('#nombre').should('be.visible');
      cy.get('#apellido').should('be.visible');
      cy.get('#email').should('be.visible');
      cy.get('#nombre_empresa').should('be.visible');

      // Campo opcional
      cy.get('#telefono').should('be.visible');

      // Botones
      cy.contains('button', 'Registrar Administrador').should('be.visible');
      cy.contains('button', 'Volver al Login').should('be.visible');
    });

    it('debería mostrar labels con asterisco para campos requeridos', () => {
      cy.get('label[for="usuario"]').should('contain', '*');
      cy.get('label[for="contrasena"]').should('contain', '*');
      cy.get('label[for="nombre"]').should('contain', '*');
      cy.get('label[for="apellido"]').should('contain', '*');
      cy.get('label[for="email"]').should('contain', '*');
      cy.get('label[for="nombre_empresa"]').should('contain', '*');

      // Teléfono no es requerido
      cy.get('label[for="telefono"]').should('not.contain', '*');
    });
  });

  // ============================================
  // TESTS DE VALIDACIÓN EN CLIENTE
  // ============================================

  describe('Validación de campos en el cliente', () => {
    it('debería mostrar error cuando el usuario es muy corto', () => {
      // Escribir usuario muy corto y salir del campo (blur)
      cy.get('#usuario').type('ab').blur();

      // Verificar error de validación
      cy.get('.error-text').should('contain', 'Usuario debe tener 3-50 caracteres');
    });

    it('debería mostrar error cuando la contraseña es muy corta', () => {
      cy.get('#contrasena').type('12345').blur();

      cy.get('.error-text').should('contain', 'Contraseña debe tener mínimo 6 caracteres');
    });

    it('debería mostrar error cuando las contraseñas no coinciden', () => {
      cy.get('#contrasena').type('Test123456!');
      cy.get('#confirmar_contrasena').type('OtraPassword123').blur();

      cy.get('.error-text').should('contain', 'Las contraseñas deben coincidir');
    });

    it('debería mostrar error cuando el email es inválido', () => {
      cy.get('#email').type('no-es-email').blur();

      cy.get('.error-text').should('contain', 'Debe ser un email válido');
    });

    it('debería mostrar indicador de fortaleza de contraseña', () => {
      // Contraseña débil - escribir y verificar que aparece el indicador
      cy.get('#contrasena').type('123456');

      // El indicador de fortaleza debería aparecer
      cy.get('.password-strength').should('be.visible');

      // Verificar que hay una barra de fortaleza
      cy.get('.strength-bar').should('be.visible');

      // Verificar que hay un texto de nivel (puede ser cualquier nivel)
      cy.get('.password-strength span').should('be.visible');

      // Contraseña más fuerte
      cy.get('#contrasena').clear().type('Test123456!');
      cy.get('.password-strength').should('be.visible');
      cy.get('.strength-bar').should('be.visible');
    });
  });

  // ============================================
  // TESTS DE FLUJO COMPLETO (E2E REAL)
  // ============================================

  describe('Flujo completo de registro exitoso', () => {
    it('debería registrar un nuevo administrador y redirigir a login', () => {
      // Generar datos únicos para evitar conflictos
      const uniqueEmail = `e2e.test.${Date.now()}@croptrack.com`;
      const uniqueUsername = `e2e_user_${Date.now()}`;

      // IMPORTANTE: Interceptar ANTES de llenar el formulario
      cy.intercept('POST', '**/api/register/register-admin').as('registerRequest');

      // Llenar el formulario completo
      // NOTA: Los campos nombre y apellido solo aceptan letras y espacios (no números)
      cy.get('#usuario').type(uniqueUsername);
      cy.get('#contrasena').type('Test123456!');
      cy.get('#confirmar_contrasena').type('Test123456!');
      cy.get('#nombre').type('Usuario');
      cy.get('#apellido').type('Prueba Cypress');
      cy.get('#email').type(uniqueEmail);
      cy.get('#nombre_empresa').type('CropTrack E2E Testing');
      cy.get('#telefono').type('+54 381 999-8888');

      // Enviar formulario
      cy.contains('button', 'Registrar Administrador').click();

      // Esperar la respuesta del servidor
      cy.wait('@registerRequest', { timeout: 15000 }).then((interception) => {
        // Verificar que se envió la request correcta
        expect(interception.request.body).to.include({
          usuario: uniqueUsername,
          nombre: 'Usuario',
          apellido: 'Prueba Cypress',
          email: uniqueEmail,
          nombre_empresa: 'CropTrack E2E Testing',
          rol: 'administrador'
        });

        // Verificar respuesta exitosa del servidor
        expect(interception.response.statusCode).to.equal(201);
      });

      // Verificar mensaje de éxito en la UI
      cy.get('.success-message').should('contain', 'Administrador registrado correctamente');

      // Verificar redirección a login (después de 2 segundos)
      cy.url().should('include', '/login', { timeout: 5000 });
    });

    it('debería poder registrar sin teléfono (campo opcional)', () => {
      const uniqueEmail = `e2e.notel.${Date.now()}@croptrack.com`;
      const uniqueUsername = `e2e_notel_${Date.now()}`;

      // Llenar sin teléfono
      cy.get('#usuario').type(uniqueUsername);
      cy.get('#contrasena').type('Test123456!');
      cy.get('#confirmar_contrasena').type('Test123456!');
      cy.get('#nombre').type('Sin');
      cy.get('#apellido').type('Telefono');
      cy.get('#email').type(uniqueEmail);
      cy.get('#nombre_empresa').type('Empresa Sin Tel');
      // No llenamos teléfono

      cy.intercept('POST', '**/api/register/register-admin').as('registerNoTel');

      cy.contains('button', 'Registrar Administrador').click();

      cy.wait('@registerNoTel').then((interception) => {
        expect(interception.response.statusCode).to.equal(201);
      });

      cy.get('.success-message').should('contain', 'Administrador registrado correctamente');
    });
  });

  // ============================================
  // TESTS DE ERRORES DEL SERVIDOR
  // ============================================

  describe('Manejo de errores del servidor', () => {
    it('debería mostrar error cuando el usuario ya existe', () => {
      // Primero registrar un usuario
      const duplicateUsername = `duplicate_${Date.now()}`;
      const email1 = `dup1.${Date.now()}@croptrack.com`;
      const email2 = `dup2.${Date.now()}@croptrack.com`;

      // Registro inicial
      cy.get('#usuario').type(duplicateUsername);
      cy.get('#contrasena').type('Test123456!');
      cy.get('#confirmar_contrasena').type('Test123456!');
      cy.get('#nombre').type('Primero');
      cy.get('#apellido').type('Usuario');
      cy.get('#email').type(email1);
      cy.get('#nombre_empresa').type('Empresa Test');

      cy.intercept('POST', '**/api/register/register-admin').as('firstRegister');
      cy.contains('button', 'Registrar Administrador').click();
      cy.wait('@firstRegister');

      // Esperar redirección y volver a register
      cy.url().should('include', '/login', { timeout: 5000 });
      cy.visit('/register/register-admin');

      // Esperar a que cargue el formulario
      cy.get('.registro-form', { timeout: 10000 }).should('be.visible');

      // Intentar registrar con el mismo usuario
      cy.get('#usuario').type(duplicateUsername);
      cy.get('#contrasena').type('Test123456!');
      cy.get('#confirmar_contrasena').type('Test123456!');
      cy.get('#nombre').type('Segundo');
      cy.get('#apellido').type('Intento');
      cy.get('#email').type(email2);
      cy.get('#nombre_empresa').type('Otra Empresa');

      cy.intercept('POST', '**/api/register/register-admin').as('duplicateRegister');
      cy.contains('button', 'Registrar Administrador').click();

      cy.wait('@duplicateRegister').then((interception) => {
        // El servidor debería rechazar el registro duplicado
        expect(interception.response.statusCode).to.be.oneOf([400, 409]);
      });

      // Debería mostrar mensaje de error
      cy.get('.error-message').should('be.visible');
    });

    it('debería mostrar error cuando el email ya existe', () => {
      const username1 = `emaildup1_${Date.now()}`;
      const username2 = `emaildup2_${Date.now()}`;
      const duplicateEmail = `duplicate.${Date.now()}@croptrack.com`;

      // Registro inicial
      cy.get('#usuario').type(username1);
      cy.get('#contrasena').type('Test123456!');
      cy.get('#confirmar_contrasena').type('Test123456!');
      cy.get('#nombre').type('Primero');
      cy.get('#apellido').type('Email');
      cy.get('#email').type(duplicateEmail);
      cy.get('#nombre_empresa').type('Empresa Test');

      cy.intercept('POST', '**/api/register/register-admin').as('firstEmailReg');
      cy.contains('button', 'Registrar Administrador').click();
      cy.wait('@firstEmailReg');

      cy.url().should('include', '/login', { timeout: 5000 });
      cy.visit('/register/register-admin');

      // Esperar a que cargue
      cy.get('.registro-form', { timeout: 10000 }).should('be.visible');

      // Intentar registrar con el mismo email
      cy.get('#usuario').type(username2);
      cy.get('#contrasena').type('Test123456!');
      cy.get('#confirmar_contrasena').type('Test123456!');
      cy.get('#nombre').type('Segundo');
      cy.get('#apellido').type('Email');
      cy.get('#email').type(duplicateEmail);
      cy.get('#nombre_empresa').type('Otra Empresa');

      cy.intercept('POST', '**/api/register/register-admin').as('duplicateEmailReg');
      cy.contains('button', 'Registrar Administrador').click();

      cy.wait('@duplicateEmailReg').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([400, 409]);
      });

      cy.get('.error-message').should('be.visible');
    });
  });

  // ============================================
  // TESTS DE NAVEGACIÓN
  // ============================================

  describe('Navegación', () => {
    it('debería navegar a login al hacer clic en "Volver al Login"', () => {
      cy.contains('button', 'Volver al Login').click();

      cy.url().should('include', '/login');
    });

    it('debería deshabilitar el formulario mientras se procesa', () => {
      const uniqueEmail = `disabled.${Date.now()}@croptrack.com`;
      const uniqueUsername = `disabled_${Date.now()}`;

      // Llenar formulario
      cy.get('#usuario').type(uniqueUsername);
      cy.get('#contrasena').type('Test123456!');
      cy.get('#confirmar_contrasena').type('Test123456!');
      cy.get('#nombre').type('Test');
      cy.get('#apellido').type('Disabled');
      cy.get('#email').type(uniqueEmail);
      cy.get('#nombre_empresa').type('Test Company');

      // Interceptar para poder ver el estado de carga
      cy.intercept('POST', '**/api/register/register-admin', (req) => {
        req.on('response', (res) => {
          res.setDelay(500);
        });
      }).as('slowRegister');

      cy.contains('button', 'Registrar Administrador').click();

      // Verificar que el botón muestra "Registrando..."
      cy.contains('button', 'Registrando...').should('exist');

      // Esperar a que termine
      cy.wait('@slowRegister');
    });
  });

  // ============================================
  // TESTS DE LIMPIEZA DE FORMULARIO
  // ============================================

  describe('Limpieza de formulario después de registro', () => {
    it('debería limpiar los campos después de registro exitoso', () => {
      const uniqueEmail = `clean.${Date.now()}@croptrack.com`;
      const uniqueUsername = `clean_${Date.now()}`;

      // Llenar y enviar
      cy.get('#usuario').type(uniqueUsername);
      cy.get('#contrasena').type('Test123456!');
      cy.get('#confirmar_contrasena').type('Test123456!');
      cy.get('#nombre').type('Limpio');
      cy.get('#apellido').type('Formulario');
      cy.get('#email').type(uniqueEmail);
      cy.get('#nombre_empresa').type('Test Clean');

      cy.intercept('POST', '**/api/register/register-admin').as('cleanRegister');
      cy.contains('button', 'Registrar Administrador').click();
      cy.wait('@cleanRegister');

      // Verificar mensaje de éxito antes de redirección
      cy.get('.success-message').should('contain', 'Administrador registrado correctamente');

      // Los campos deberían estar vacíos
      cy.get('#usuario').should('have.value', '');
      cy.get('#contrasena').should('have.value', '');
    });
  });
});
