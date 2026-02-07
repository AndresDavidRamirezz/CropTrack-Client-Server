// ==================== TEST DE INTEGRACIÓN - REGISTER ====================
// Prueba el flujo completo de registro de administrador
// Enfocado en: llenado de formulario y registro exitoso (sin validaciones)

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../src/pages/Register/RegisterPage';

// ==================== MOCKS ENCAPSULADOS ====================

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// ==================== HELPERS ====================

const renderRegisterPage = () => {
  return render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  );
};

// Datos válidos para el formulario
const validFormData = {
  usuario: 'admin_test',
  contrasena: 'Password123!',
  confirmar_contrasena: 'Password123!',
  nombre: 'Juan',
  apellido: 'Perez',
  email: 'juan.perez@test.com',
  nombre_empresa: 'Mi Empresa',
  telefono: '+54 381 123-4567',
};

// Helper para obtener inputs por ID
const getInputById = (id) => document.getElementById(id);

// Helper para llenar el formulario completo
const fillForm = async (user, data = validFormData) => {
  await user.type(getInputById('usuario'), data.usuario);
  await user.type(getInputById('contrasena'), data.contrasena);
  await user.type(getInputById('confirmar_contrasena'), data.confirmar_contrasena);
  await user.type(getInputById('nombre'), data.nombre);
  await user.type(getInputById('apellido'), data.apellido);
  await user.type(getInputById('email'), data.email);
  await user.type(getInputById('nombre_empresa'), data.nombre_empresa);
  if (data.telefono) {
    await user.type(getInputById('telefono'), data.telefono);
  }
};

// ==================== SUITE DE TESTS ====================

describe('Integration: RegisterPage - Flujo de registro', () => {
  let mockFetch;

  beforeEach(() => {
    // Mock fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;

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

  // ==================== RENDERIZADO DEL FORMULARIO ====================

  describe('Renderizado del formulario', () => {
    test('Renderiza el título del formulario', () => {
      renderRegisterPage();

      expect(screen.getByRole('heading', { name: /Registro de Administrador/i })).toBeInTheDocument();
    });

    test('Renderiza todos los campos del formulario', () => {
      renderRegisterPage();

      expect(getInputById('usuario')).toBeInTheDocument();
      expect(getInputById('contrasena')).toBeInTheDocument();
      expect(getInputById('confirmar_contrasena')).toBeInTheDocument();
      expect(getInputById('nombre')).toBeInTheDocument();
      expect(getInputById('apellido')).toBeInTheDocument();
      expect(getInputById('email')).toBeInTheDocument();
      expect(getInputById('nombre_empresa')).toBeInTheDocument();
      expect(getInputById('telefono')).toBeInTheDocument();
    });

    test('Renderiza los botones de acción', () => {
      renderRegisterPage();

      expect(screen.getByRole('button', { name: /Registrar Administrador/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Volver al Login/i })).toBeInTheDocument();
    });
  });

  // ==================== LLENADO DE FORMULARIO ====================

  describe('Llenado de formulario', () => {
    test('Los inputs actualizan su valor al escribir', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const usuarioInput = getInputById('usuario');
      const nombreInput = getInputById('nombre');
      const emailInput = getInputById('email');

      await user.type(usuarioInput, 'mi_usuario');
      await user.type(nombreInput, 'Juan');
      await user.type(emailInput, 'juan@test.com');

      expect(usuarioInput).toHaveValue('mi_usuario');
      expect(nombreInput).toHaveValue('Juan');
      expect(emailInput).toHaveValue('juan@test.com');
    });

    test('El indicador de fortaleza de contraseña aparece al escribir', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const contrasenaInput = getInputById('contrasena');

      // Inicialmente no debe haber indicador
      expect(screen.queryByText(/Muy débil|Débil|Media|Buena|Excelente/i)).not.toBeInTheDocument();

      // Escribir contraseña
      await user.type(contrasenaInput, 'Pass123!');

      // Ahora debe aparecer el indicador
      await waitFor(() => {
        expect(screen.getByText(/Muy débil|Débil|Media|Buena|Excelente/i)).toBeInTheDocument();
      });
    });

    test('El indicador muestra mejor fortaleza con contraseña compleja', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const contrasenaInput = getInputById('contrasena');

      // Contraseña compleja
      await user.type(contrasenaInput, 'MiPassword123!@#');

      await waitFor(() => {
        // Debe mostrar Buena o Excelente
        const strengthText = screen.getByText(/Buena|Excelente/i);
        expect(strengthText).toBeInTheDocument();
      });
    });
  });

  // ==================== ENVÍO DEL FORMULARIO ====================

  describe('Envío del formulario', () => {
    test('El formulario envía los datos correctamente a la API', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Administrador registrado correctamente' }),
      });

      renderRegisterPage();

      // Llenar formulario
      await fillForm(user);

      // Submit
      await user.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      // Verificar llamada a API
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:4000/api/register/register-admin',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuario: 'admin_test',
              contrasena: 'Password123!',
              nombre: 'Juan',
              apellido: 'Perez',
              email: 'juan.perez@test.com',
              nombre_empresa: 'Mi Empresa',
              telefono: '+54 381 123-4567',
              rol: 'administrador',
            }),
          }
        );
      });
    });

    test('El email se envía en minúsculas', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'OK' }),
      });

      renderRegisterPage();

      // Llenar formulario con email en mayúsculas
      await fillForm(user, {
        ...validFormData,
        email: 'JUAN.PEREZ@TEST.COM',
      });

      await user.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining('"email":"juan.perez@test.com"'),
          })
        );
      });
    });

    test('Teléfono vacío se envía como null', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'OK' }),
      });

      renderRegisterPage();

      // Llenar formulario sin teléfono
      await fillForm(user, {
        ...validFormData,
        telefono: '',
      });

      await user.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining('"telefono":null'),
          })
        );
      });
    });
  });

  // ==================== REGISTRO EXITOSO ====================

  describe('Registro exitoso', () => {
    test('Muestra mensaje de éxito después de registro correcto', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Administrador registrado correctamente' }),
      });

      renderRegisterPage();

      await fillForm(user);
      await user.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(screen.getByText(/Administrador registrado correctamente/i)).toBeInTheDocument();
      });
    });

    test('El formulario se limpia después del registro exitoso', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'OK' }),
      });

      renderRegisterPage();

      await fillForm(user);
      await user.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(getInputById('usuario')).toHaveValue('');
        expect(getInputById('nombre')).toHaveValue('');
        expect(getInputById('email')).toHaveValue('');
      });
    });

    test('Navega a /login después del registro exitoso', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'OK' }),
      });

      renderRegisterPage();

      await fillForm(user);
      await user.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      // Avanzar el tiempo para el setTimeout de navegación
      await waitFor(() => {
        expect(screen.getByText(/Administrador registrado correctamente/i)).toBeInTheDocument();
      });

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });

      jest.useRealTimers();
    });
  });

  // ==================== NAVEGACIÓN ====================

  describe('Navegación', () => {
    test('El botón "Volver al Login" navega a /login', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      await user.click(screen.getByRole('button', { name: /Volver al Login/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  // ==================== FLUJO COMPLETO ====================

  describe('Flujo completo de integración', () => {
    test('Usuario llena formulario, hace registro y es redirigido al login', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Administrador registrado correctamente',
          user: { id: '123', usuario: 'admin_test' },
        }),
      });

      renderRegisterPage();

      // 1. Verificar que el formulario está vacío inicialmente
      expect(getInputById('usuario')).toHaveValue('');

      // 2. Llenar todos los campos
      await fillForm(user);

      // 3. Verificar que los campos tienen los valores correctos
      expect(getInputById('usuario')).toHaveValue('admin_test');
      expect(getInputById('nombre')).toHaveValue('Juan');
      expect(getInputById('email')).toHaveValue('juan.perez@test.com');

      // 4. Submit
      await user.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      // 5. Verificar llamada a API
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // 6. Verificar mensaje de éxito
      await waitFor(() => {
        expect(screen.getByText(/Administrador registrado correctamente/i)).toBeInTheDocument();
      });

      // 7. Verificar que el formulario se limpió
      await waitFor(() => {
        expect(getInputById('usuario')).toHaveValue('');
      });

      // 8. Avanzar tiempo y verificar navegación
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });

      jest.useRealTimers();
    });
  });
});
