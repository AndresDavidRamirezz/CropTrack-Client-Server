// ==================== TEST DE INTEGRACIÓN - LOGIN ====================
// Prueba la integración entre LoginPage y AuthModal (componente real)
// Enfocado en: selección de rol y llenado de formulario

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/Login/LoginPage';

// ==================== MOCKS ENCAPSULADOS ====================

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// ==================== HELPERS ====================

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

// ==================== SUITE DE TESTS ====================

describe('Integration: LoginPage + AuthModal', () => {
  let mockFetch;
  let mockLocalStorage;

  beforeEach(() => {
    // Mock fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Reset navigate
    mockNavigate.mockClear();

    // Silenciar console.log y console.error
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ==================== INTEGRACIÓN DE COMPONENTES ====================

  describe('Renderizado integrado de componentes', () => {
    test('LoginPage renderiza AuthModal con los tres botones de rol', () => {
      renderLoginPage();

      // Verificar que AuthModal está integrado con sus botones reales
      expect(screen.getByRole('button', { name: /^Administrador$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Trabajador$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Supervisor$/i })).toBeInTheDocument();
    });

    test('LoginPage renderiza el formulario de login', () => {
      renderLoginPage();

      expect(screen.getByPlaceholderText(/Ingresa tu usuario/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ingresa tu contraseña/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Iniciar sesión/i })).toBeInTheDocument();
    });

    test('El rol Administrador está activo por defecto en AuthModal', () => {
      renderLoginPage();

      const adminButton = screen.getByRole('button', { name: /^Administrador$/i });
      expect(adminButton).toHaveClass('active');
    });
  });

  // ==================== SELECCIÓN DE ROL ====================

  describe('Selección de rol (integración AuthModal → LoginPage)', () => {
    test('Al seleccionar rol Trabajador, el botón se marca como activo', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const trabajadorButton = screen.getByRole('button', { name: /^Trabajador$/i });
      await user.click(trabajadorButton);

      expect(trabajadorButton).toHaveClass('active');
      expect(screen.getByRole('button', { name: /^Administrador$/i })).not.toHaveClass('active');
    });

    test('Al seleccionar rol Supervisor, el botón se marca como activo', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const supervisorButton = screen.getByRole('button', { name: /^Supervisor$/i });
      await user.click(supervisorButton);

      expect(supervisorButton).toHaveClass('active');
      expect(screen.getByRole('button', { name: /^Administrador$/i })).not.toHaveClass('active');
    });

    test('El rol seleccionado se envía correctamente en el submit', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token', user: { id: '1' } }),
      });

      renderLoginPage();

      // Seleccionar rol Supervisor
      await user.click(screen.getByRole('button', { name: /^Supervisor$/i }));

      // Llenar formulario
      await user.type(screen.getByPlaceholderText(/Ingresa tu usuario/i), 'usuario_test');
      await user.type(screen.getByPlaceholderText(/Ingresa tu contraseña/i), 'password123');

      // Submit
      await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }));

      // Verificar que el rol supervisor se envió en la petición
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:4000/api/auth/login',
          expect.objectContaining({
            body: JSON.stringify({
              usuario: 'usuario_test',
              contrasena: 'password123',
              rol: 'supervisor',
            }),
          })
        );
      });
    });
  });

  // ==================== LLENADO DE FORMULARIO ====================

  describe('Llenado de formulario', () => {
    test('Los inputs actualizan su valor al escribir', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usuarioInput = screen.getByPlaceholderText(/Ingresa tu usuario/i);
      const contrasenaInput = screen.getByPlaceholderText(/Ingresa tu contraseña/i);

      await user.type(usuarioInput, 'mi_usuario');
      await user.type(contrasenaInput, 'mi_password');

      expect(usuarioInput).toHaveValue('mi_usuario');
      expect(contrasenaInput).toHaveValue('mi_password');
    });

    test('El formulario envía los datos correctamente al hacer submit', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'jwt-token', user: { id: '1', usuario: 'admin' } }),
      });

      renderLoginPage();

      // Llenar formulario
      await user.type(screen.getByPlaceholderText(/Ingresa tu usuario/i), 'admin_user');
      await user.type(screen.getByPlaceholderText(/Ingresa tu contraseña/i), 'secure123');

      // Submit
      await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }));

      // Verificar llamada a API con datos correctos
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:4000/api/auth/login',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuario: 'admin_user',
              contrasena: 'secure123',
              rol: 'administrador',
            }),
          }
        );
      });
    });

    test('Login exitoso guarda datos en localStorage y navega a /main', async () => {
      const user = userEvent.setup();
      const mockUserData = { id: '123', usuario: 'test_user', rol: 'administrador' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'my-jwt-token', user: mockUserData }),
      });

      renderLoginPage();

      // Llenar y enviar formulario
      await user.type(screen.getByPlaceholderText(/Ingresa tu usuario/i), 'test_user');
      await user.type(screen.getByPlaceholderText(/Ingresa tu contraseña/i), 'password123');
      await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }));

      // Verificar localStorage
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'my-jwt-token');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockUserData));
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('usuario', 'test_user');
      });

      // Verificar navegación
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/main');
      });
    });
  });

  // ==================== FLUJO COMPLETO ====================

  describe('Flujo completo de integración', () => {
    test('Usuario selecciona rol, llena formulario y completa login', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'token-trabajador',
          user: { id: '456', usuario: 'worker', rol: 'trabajador' },
        }),
      });

      renderLoginPage();

      // 1. Seleccionar rol Trabajador
      const trabajadorButton = screen.getByRole('button', { name: /^Trabajador$/i });
      await user.click(trabajadorButton);
      expect(trabajadorButton).toHaveClass('active');

      // 2. Llenar formulario
      await user.type(screen.getByPlaceholderText(/Ingresa tu usuario/i), 'worker_user');
      await user.type(screen.getByPlaceholderText(/Ingresa tu contraseña/i), 'worker_pass');

      // 3. Submit
      await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }));

      // 4. Verificar integración completa
      await waitFor(() => {
        // API llamada con rol correcto
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:4000/api/auth/login',
          expect.objectContaining({
            body: JSON.stringify({
              usuario: 'worker_user',
              contrasena: 'worker_pass',
              rol: 'trabajador',
            }),
          })
        );
      });

      // 5. Verificar navegación exitosa
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/main');
      });
    });
  });
});