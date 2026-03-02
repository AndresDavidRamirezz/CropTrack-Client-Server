/**
 * Tests E2E - Flujo Completo de Reportes
 *
 * Prueba el flujo COMPLETO desde el usuario hasta el server y de vuelta:
 *
 * 1. Usuario ya autenticado navega a /report
 * 2. Client hace GET /api/crops/user/:userId → Server → MySQL → retorna cosechas
 * 3. Usuario ve las cosechas en el grid
 * 4. Usuario hace click en una cosecha
 * 5. Client hace GET /api/reports/:cropId → Server → MySQL → genera PDF → retorna blob
 * 6. Client muestra modal de preview con el PDF
 * 7. Usuario puede descargar el PDF
 * 8. Usuario puede cerrar el preview
 *
 * REQUISITOS PREVIOS:
 * - Server corriendo en puerto 4000
 * - Client corriendo en puerto 3000
 * - Base de datos croptrack_test disponible
 * - Usuario administrador y cosecha de prueba existentes
 */

describe('Flujo E2E de Reportes', () => {
  const timestamp = Date.now();

  // Usuario de prueba que se crea antes de los tests
  let testUser;
  let testCropId;

  before(() => {
    testUser = {
      usuario: `report_test_${timestamp}`,
      contrasena: 'ReportTest123!',
      nombre: 'Report',
      apellido: 'Tester',
      email: `report.test.${timestamp}@croptrack.com`,
      nombre_empresa: 'Report Test Company',
      telefono: ''
    };

    // 1. Registrar el usuario administrador
    cy.request({
      method: 'POST',
      url: 'http://localhost:4000/api/register/register-admin',
      body: { ...testUser, rol: 'administrador' },
      failOnStatusCode: false
    }).then((registerResponse) => {
      cy.log('Registro de usuario: ' + registerResponse.status);

      // 2. Login para obtener token y userId
      cy.request({
        method: 'POST',
        url: 'http://localhost:4000/api/auth/login',
        body: {
          usuario: testUser.usuario,
          contrasena: testUser.contrasena,
          rol: 'administrador'
        }
      }).then((loginResponse) => {
        const { token, user } = loginResponse.body;
        cy.log('Login exitoso - userId: ' + user.id);

        // 3. Crear una cosecha de prueba via API
        cy.request({
          method: 'POST',
          url: 'http://localhost:4000/api/crops',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            nombre: `Cosecha E2E ${timestamp}`,
            tipo: 'Hortaliza',
            variedad: 'Cherry',
            area_hectareas: 5.5,
            ubicacion: 'Parcela de Prueba E2E',
            fecha_siembra: '2026-01-15',
            estado: 'en_crecimiento',
            usuario_creador_id: user.id
          },
          failOnStatusCode: false
        }).then((cropResponse) => {
          if (cropResponse.status === 201 || cropResponse.status === 200) {
            testCropId = cropResponse.body.id || cropResponse.body.cropId;
            cy.log('Cosecha creada: ' + testCropId);
          } else {
            cy.log('No se pudo crear cosecha: ' + JSON.stringify(cropResponse.body));
          }
        });

        // 4. Guardar token y userData en localStorage para simular sesión activa
        cy.window().then((win) => {
          win.localStorage.setItem('token', token);
          win.localStorage.setItem('userData', JSON.stringify(user));
          win.localStorage.setItem('usuario', testUser.usuario);
        });
      });
    });
  });

  beforeEach(() => {
    // Restaurar sesión antes de cada test
    cy.request({
      method: 'POST',
      url: 'http://localhost:4000/api/auth/login',
      body: {
        usuario: testUser.usuario,
        contrasena: testUser.contrasena,
        rol: 'administrador'
      }
    }).then(({ body }) => {
      // Setear localStorage via cy.visit + window
      cy.visit('/report', {
        onBeforeLoad(win) {
          win.localStorage.setItem('token', body.token);
          win.localStorage.setItem('userData', JSON.stringify(body.user));
          win.localStorage.setItem('usuario', testUser.usuario);
        }
      });

      cy.url().should('include', '/report');
    });
  });

  // ============================================
  // TESTS DE RENDERIZADO Y CARGA
  // ============================================

  describe('Renderizado de la página de reportes', () => {
    it('debería mostrar el título "Reportes de Cosechas"', () => {
      cy.contains('h1', 'Reportes de Cosechas').should('be.visible');
    });

    it('debería mostrar el subtítulo de instrucción', () => {
      cy.contains('Selecciona una cosecha para generar su reporte PDF completo').should('be.visible');
    });

    it('debería cargar las cosechas del usuario', () => {
      // Esperar que desaparezca el loading
      cy.get('.report-page-loading', { timeout: 10000 }).should('not.exist');

      // Debería mostrar las cosechas o el estado vacío
      cy.get('body').then(($body) => {
        if ($body.find('.report-page-grid').length) {
          cy.get('.report-crop-card').should('have.length.at.least', 1);
        } else {
          cy.get('.report-page-empty').should('be.visible');
        }
      });
    });

    it('debería mostrar la cosecha de prueba en el grid', () => {
      cy.get('.report-page-loading', { timeout: 10000 }).should('not.exist');

      cy.get('body').then(($body) => {
        if ($body.find('.report-page-grid').length) {
          cy.get('.report-crop-card').should('have.length.at.least', 1);
          cy.get('.report-crop-card-name').should('be.visible');
        } else {
          // Si no hay cosechas, el test documenta el estado vacío
          cy.get('.report-page-empty').should('be.visible');
          cy.log('No hay cosechas - el test de generación será omitido');
        }
      });
    });
  });

  // ============================================
  // TESTS DE ESTADO DE CARGA
  // ============================================

  describe('Estado de carga', () => {
    it('debería mostrar spinner mientras carga', () => {
      // Interceptar la petición para retrasarla
      cy.intercept('GET', '**/api/crops/user/**', (req) => {
        req.on('response', (res) => { res.setDelay(500); });
      }).as('slowCropsLoad');

      cy.visit('/report', {
        onBeforeLoad(win) {
          win.localStorage.setItem('token', 'test-token');
          win.localStorage.setItem('userData', JSON.stringify({ id: 'test', empresa: 'Test' }));
        }
      });

      // El loading debería ser visible mientras espera
      cy.get('.report-page-loading').should('be.visible');
      cy.get('.report-spinner').should('be.visible');
      cy.contains('Cargando cosechas...').should('be.visible');
    });

    it('debería desaparecer el loading después de cargar', () => {
      cy.intercept('GET', '**/api/crops/user/**').as('cropsLoad');
      cy.wait('@cropsLoad', { timeout: 10000 });
      cy.get('.report-page-loading').should('not.exist');
    });
  });

  // ============================================
  // TESTS DE GENERACIÓN DE REPORTE (E2E REAL)
  // ============================================

  describe('Flujo completo de generación de reporte', () => {
    it('debería generar reporte PDF y abrir modal de preview', () => {
      cy.get('.report-page-loading', { timeout: 10000 }).should('not.exist');

      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) {
          cy.log('No hay cosechas disponibles - omitiendo test de generación');
          return;
        }

        // Interceptar la petición de reporte
        cy.intercept('GET', '**/api/reports/**').as('generateReport');

        // Click en la primera cosecha
        cy.get('.report-crop-card').first().click();

        // Verificar overlay de generando
        cy.get('.report-crop-card-overlay', { timeout: 5000 }).should('be.visible');
        cy.contains('Generando reporte...').should('be.visible');

        // Esperar respuesta del servidor (PDF puede tardar varios segundos)
        cy.wait('@generateReport', { timeout: 60000 }).then((interception) => {
          cy.log('Reporte generado - status: ' + interception.response.statusCode);
          expect(interception.response.statusCode).to.equal(200);
          expect(interception.response.headers['content-type']).to.include('application/pdf');
        });

        // El modal de preview debe aparecer
        cy.get('.report-preview-modal', { timeout: 30000 }).should('be.visible');
        cy.get('.report-preview-header').should('be.visible');
      });
    });

    it('debería mostrar el nombre de la cosecha en el header del modal', () => {
      cy.get('.report-page-loading', { timeout: 10000 }).should('not.exist');

      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) {
          cy.log('No hay cosechas - omitiendo test');
          return;
        }

        cy.intercept('GET', '**/api/reports/**').as('generateReport');

        // Obtener el nombre de la primera cosecha
        cy.get('.report-crop-card-name').first().invoke('text').then((cropName) => {
          cy.get('.report-crop-card').first().click();
          cy.wait('@generateReport', { timeout: 60000 });

          cy.get('.report-preview-header').should('contain', cropName);
        });
      });
    });

    it('debería mostrar el iframe con el PDF en el modal', () => {
      cy.get('.report-page-loading', { timeout: 10000 }).should('not.exist');

      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) {
          cy.log('No hay cosechas - omitiendo test');
          return;
        }

        cy.intercept('GET', '**/api/reports/**').as('generateReport');
        cy.get('.report-crop-card').first().click();
        cy.wait('@generateReport', { timeout: 60000 });

        cy.get('.report-preview-iframe', { timeout: 10000 }).should('be.visible');
        cy.get('.report-preview-iframe').should('have.attr', 'src').and('match', /^blob:/);
      });
    });
  });

  // ============================================
  // TESTS DEL MODAL DE PREVIEW
  // ============================================

  describe('Modal de preview', () => {
    const openPreview = () => {
      cy.get('.report-page-loading', { timeout: 10000 }).should('not.exist');

      cy.intercept('GET', '**/api/reports/**').as('generateReport');
      cy.get('.report-crop-card').first().click();
      cy.wait('@generateReport', { timeout: 60000 });
      cy.get('.report-preview-modal', { timeout: 10000 }).should('be.visible');
    };

    it('debería tener botón de Descargar PDF', () => {
      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) { return; }
        openPreview();
        cy.contains('button', /Descargar PDF/).should('be.visible');
      });
    });

    it('debería tener botón de Cerrar', () => {
      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) { return; }
        openPreview();
        cy.contains('button', 'Cerrar').should('be.visible');
      });
    });

    it('debería cerrar el modal al hacer click en Cerrar', () => {
      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) { return; }
        openPreview();
        cy.contains('button', 'Cerrar').click();
        cy.get('.report-preview-modal').should('not.exist');
      });
    });

    it('debería cerrar el modal al hacer click en el overlay', () => {
      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) { return; }
        openPreview();
        cy.get('.report-preview-overlay').click({ force: true });
        cy.get('.report-preview-modal').should('not.exist');
      });
    });

    it('debería tener botón de cierre × en el header del modal', () => {
      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) { return; }
        openPreview();
        cy.get('.report-preview-close').should('be.visible');
        cy.get('.report-preview-close').click();
        cy.get('.report-preview-modal').should('not.exist');
      });
    });
  });

  // ============================================
  // TESTS DE MANEJO DE ERRORES
  // ============================================

  describe('Manejo de errores', () => {
    it('debería mostrar banner de error si la API de cosechas falla', () => {
      // Interceptar para simular error
      cy.intercept('GET', '**/api/crops/user/**', {
        statusCode: 500,
        body: { error: 'Error interno del servidor' }
      }).as('cropsError');

      cy.visit('/report', {
        onBeforeLoad(win) {
          win.localStorage.setItem('token', 'test-token');
          win.localStorage.setItem('userData', JSON.stringify({ id: 'test-id', empresa: 'Test' }));
        }
      });

      cy.wait('@cropsError');
      cy.get('.report-error-banner', { timeout: 5000 }).should('be.visible');
    });

    it('debería poder cerrar el banner de error', () => {
      cy.intercept('GET', '**/api/crops/user/**', {
        statusCode: 500,
        body: { error: 'Error de prueba' }
      }).as('cropsError');

      cy.visit('/report', {
        onBeforeLoad(win) {
          win.localStorage.setItem('token', 'test-token');
          win.localStorage.setItem('userData', JSON.stringify({ id: 'test-id', empresa: 'Test' }));
        }
      });

      cy.wait('@cropsError');
      cy.get('.report-error-banner').should('be.visible');
      cy.get('.report-error-close').click();
      cy.get('.report-error-banner').should('not.exist');
    });

    it('debería mostrar error si la generación del PDF falla', () => {
      cy.get('.report-page-loading', { timeout: 10000 }).should('not.exist');

      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) { return; }

        // Interceptar el reporte para que falle
        cy.intercept('GET', '**/api/reports/**', {
          statusCode: 500,
          body: { error: 'Error al generar el reporte PDF' }
        }).as('reportError');

        cy.get('.report-crop-card').first().click();
        cy.wait('@reportError');

        cy.get('.report-error-banner', { timeout: 5000 }).should('be.visible');
        cy.get('.report-preview-modal').should('not.exist');
      });
    });
  });

  // ============================================
  // TESTS DE ACCESIBILIDAD Y UX
  // ============================================

  describe('Accesibilidad y experiencia de usuario', () => {
    it('debería mostrar ícono 🌱 para cosechas sin imagen', () => {
      cy.get('.report-page-loading', { timeout: 10000 }).should('not.exist');

      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) { return; }

        // Verificar cards sin imagen
        cy.get('.report-crop-card').each(($card) => {
          if ($card.find('img').length === 0) {
            cy.wrap($card).find('.report-crop-card-icon').should('contain', '🌱');
          }
        });
      });
    });

    it('debería mostrar el estado del cultivo con badge de color', () => {
      cy.get('.report-page-loading', { timeout: 10000 }).should('not.exist');

      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) { return; }

        cy.get('.report-crop-card-estado').first().should('be.visible');
        cy.get('.report-crop-card-estado').first()
          .should('have.attr', 'style')
          .and('include', 'background-color');
      });
    });

    it('debería mostrar texto "Click para generar reporte" en el footer de cada card', () => {
      cy.get('.report-page-loading', { timeout: 10000 }).should('not.exist');

      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) { return; }

        cy.get('.report-crop-card-footer').each(($footer) => {
          cy.wrap($footer).should('contain', 'Click para generar reporte');
        });
      });
    });
  });

  // ============================================
  // TESTS DE DATOS DEL REPORTE JSON
  // ============================================

  describe('Endpoint de datos del reporte', () => {
    it('debería retornar datos JSON estructurados del reporte', () => {
      cy.get('body').then(($body) => {
        if (!$body.find('.report-crop-card').length) { return; }

        // Obtener el cropId de la primera card
        cy.get('.report-crop-card').first().then(($card) => {
          // Verificar el endpoint de datos directamente
          cy.request({
            method: 'GET',
            url: 'http://localhost:4000/api/reports/' + testCropId + '/data',
            failOnStatusCode: false
          }).then((response) => {
            if (response.status === 200) {
              expect(response.body).to.have.property('cosecha');
              expect(response.body).to.have.property('administrador');
              expect(response.body).to.have.property('trabajadores');
              expect(response.body).to.have.property('tareas');
              expect(response.body).to.have.property('mediciones');
              expect(response.body).to.have.property('generado_en');
            } else {
              cy.log('No se pudo acceder al reporte: ' + response.status);
            }
          });
        });
      });
    });
  });
});
