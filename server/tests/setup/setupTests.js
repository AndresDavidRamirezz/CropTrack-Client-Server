// ==================== SETUP GLOBAL PARA TODOS LOS TESTS ====================

// Aumentar timeout para tests de DB
jest.setTimeout(10000);

// Guardar referencias originales
const originalConsole = {
  log: console.log,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

// Mock de console para silenciar logs durante tests
global.console = {
  ...console,
  log: jest.fn(),      // Silenciar todos los console.log
  debug: jest.fn(),    // Silenciar debug
  info: jest.fn(),     // Silenciar info
  warn: jest.fn(),     // Silenciar warn
  error: originalConsole.error, // Mantener error para debugging
};

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.PORT = 4001;
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '7d';

// Limpiar después de todos los tests
afterAll(async () => {
  // Restaurar console original
  global.console = originalConsole;
});

// Resetear mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});