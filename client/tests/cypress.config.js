/**
 * Configuración de Cypress para Tests E2E
 *
 * Esta configuración está diseñada para probar el flujo completo:
 * Client (React :3000) → Server (Express :4000) → Database (MySQL)
 *
 * IMPORTANTE: Antes de correr los tests E2E:
 * 1. El servidor debe estar corriendo en puerto 4000
 * 2. El cliente debe estar corriendo en puerto 3000
 * 3. La base de datos croptrack_test debe estar disponible
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // URL base del cliente React
    baseUrl: 'http://localhost:3000',

    // Patrón para encontrar archivos de test E2E (incluye carpetas de módulos)
    specPattern: ['tests/e2e/**/*.e2e.cy.{js,jsx}', 'tests/report/e2e/**/*.e2e.cy.{js,jsx}'],

    // Carpeta de soporte (comandos personalizados, setup)
    supportFile: 'tests/setup/cypress/support/e2e.js',

    // Carpeta de fixtures (datos de prueba)
    fixturesFolder: 'tests/setup/cypress/fixtures',

    // Carpeta para screenshots cuando fallan tests
    screenshotsFolder: 'tests/e2e/screenshots',

    // Carpeta para videos de ejecución
    videosFolder: 'tests/e2e/videos',

    // Timeouts
    defaultCommandTimeout: 10000,  // 10 segundos para comandos
    requestTimeout: 10000,         // 10 segundos para requests HTTP
    responseTimeout: 30000,        // 30 segundos para respuestas
    pageLoadTimeout: 30000,        // 30 segundos para carga de página

    // Viewport (tamaño de ventana)
    viewportWidth: 1280,
    viewportHeight: 720,

    // No grabar video por defecto (ahorra tiempo)
    video: false,

    // Capturar screenshots solo cuando falla
    screenshotOnRunFailure: true,

    // Configuración del navegador
    chromeWebSecurity: false,  // Permite requests cross-origin

    // Variables de entorno para los tests
    env: {
      API_URL: 'http://localhost:4000/api',
      TEST_DB: 'croptrack_test'
    },

    // Reintentar tests fallidos
    retries: {
      runMode: 2,      // En CI: reintentar 2 veces
      openMode: 0      // En desarrollo: no reintentar
    },

    // Setup de eventos
    setupNodeEvents(on, config) {
      // Registrar eventos personalizados aquí si es necesario

      // Evento para limpiar la base de datos antes de cada test
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        // Se puede agregar un task para limpiar BD si es necesario
        // cleanDatabase() { ... }
      });

      return config;
    }
  }
});
