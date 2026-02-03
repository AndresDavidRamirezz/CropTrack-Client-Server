// ==================== SETUP GLOBAL PARA TODOS LOS TESTS ====================

import '@testing-library/jest-dom';

// ✅ POLYFILL PARA TextEncoder/TextDecoder (requerido por react-router-dom v7+)
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Configurar entorno de testing
global.console = {
  ...console,
  error: jest.fn(), // Mock de console.error para tests más limpios
  warn: jest.fn(),  // Mock de console.warn
};

// Mock de window.matchMedia (necesario para algunos componentes)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});