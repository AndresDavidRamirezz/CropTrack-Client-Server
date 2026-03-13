/**
 * E2E Demo — CropTrack: Flujo completo de generación de reportes
 *
 * Credenciales creadas en requestReporte2e.http:
 *   usuario:    demo_limones
 *   contraseña: Demo2025!
 *   rol:        administrador
 *
 * Pasos del flujo:
 *   1. Landing page (mostrar unos segundos)
 *   2. Navegar al login
 *   3. Tipear usuario y contraseña en el formulario
 *   4. Ingresar → MainPage
 *   5. Navegar a Reportes via NavigationButtons
 *   6. Abrir previsualización del reporte
 *   7. Descargar el PDF
 *   8. Cerrar sesión → volver a landing
 *
 * REQUISITOS:
 *   - Servidor corriendo en localhost:4000
 *   - Cliente corriendo en localhost:3000
 *   - Datos cargados con requestReporte2e.http en DB local
 */

describe('CropTrack Demo — Flujo completo de reportes', () => {
  it('Landing → Login → MainPage → Reportes → PDF → Logout', () => {

    // ── 1. Abrir la aplicación y mostrar la landing ───────────
    cy.visit('/');
    cy.wait(3000);

    // ── 2. Navegar al login ───────────────────────────────────
    cy.get('.nav-login-btn').click();
    cy.url().should('include', '/login');
    cy.wait(1000);

    // ── 3. Seleccionar rol Administrador y tipear credenciales ─
    cy.contains('button.role-button', 'Administrador').click();
    cy.wait(500);

    cy.get('input[name="usuario"]')
      .click()
      .type('demo_limones', { delay: 100 });
    cy.wait(400);

    cy.get('input[name="contrasena"]')
      .click()
      .type('Demo2025!', { delay: 80 });
    cy.wait(600);

    // ── 4. Iniciar sesión y esperar la MainPage ───────────────
    cy.get('button.btn-login').click();
    cy.url().should('include', '/main', { timeout: 15000 });
    cy.wait(2500);

    // ── 5. Navegar a Reportes via el botón de navegación ─────
    cy.get('.reportes-button').click();
    cy.url().should('include', '/report');

    cy.get('.report-page-loading', { timeout: 15000 }).should('not.exist');
    cy.get('.report-crop-card', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.wait(2000);

    // ── 6. Generar y previsualizar el reporte PDF ─────────────
    cy.intercept('GET', '**/api/reports/**').as('generarReporte');

    cy.get('.report-crop-card').first().click();
    cy.get('.report-crop-card-overlay', { timeout: 5000 }).should('be.visible');

    cy.wait('@generarReporte', { timeout: 90000 });

    cy.get('.report-preview-modal', { timeout: 30000 }).should('be.visible');
    cy.wait(2500);

    // ── 7. Descargar el PDF ───────────────────────────────────
    cy.get('.report-preview-modal').contains('button', /Descargar PDF/).click();
    cy.wait(2000);

    // ── 8. Cerrar el modal ────────────────────────────────────
    cy.get('.report-preview-close').click();
    cy.get('.report-preview-overlay').should('not.exist', { timeout: 10000 });
    cy.wait(1000);

    // ── 9. Cerrar sesión y volver a la landing ────────────────
    cy.get('.logout-btn').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
    cy.wait(2000);
  });
});