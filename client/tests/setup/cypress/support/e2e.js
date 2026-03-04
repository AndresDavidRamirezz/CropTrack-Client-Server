/**
 * Setup Global para Tests E2E de Cypress
 *
 * Este archivo se ejecuta ANTES de cada archivo de test.
 * Aquí se configuran:
 * - Comandos personalizados
 * - Hooks globales (before, beforeEach, after)
 * - Configuración de la aplicación
 */

// Importar comandos personalizados
import './commands';

// ============================================
// HOOKS GLOBALES
// ============================================

// Antes de cada test: limpiar estado
beforeEach(() => {
  // Limpiar localStorage
  cy.clearLocalStorage();

  // Limpiar cookies
  cy.clearCookies();

  // Log del test que está por ejecutarse
  cy.log('---------------------------------------------');
  cy.log('Iniciando nuevo test E2E...');
  cy.log('---------------------------------------------');
});

// Después de cada test
afterEach(() => {
  // Log del resultado
  cy.log('Test E2E finalizado');
});

// ============================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================

// Evitar que Cypress falle por errores de la aplicación
// (por ejemplo, errores de React en desarrollo)
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar errores conocidos de React en desarrollo
  if (err.message.includes('ResizeObserver loop')) {
    return false;
  }

  // Ignorar errores de hydration de React 19
  if (err.message.includes('Hydration')) {
    return false;
  }

  // Para otros errores, dejar que Cypress los maneje
  return true;
});

// ============================================
// CONFIGURACIÓN DE CYPRESS
// ============================================

// Aumentar timeout para operaciones lentas
Cypress.config('defaultCommandTimeout', 10000);

// ============================================
// ALIASES GLOBALES
// ============================================

// Hacer disponible la URL de la API en todos los tests
Cypress.env('API_URL', 'http://localhost:4000/api');
