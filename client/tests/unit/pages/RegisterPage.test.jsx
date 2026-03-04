import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../../src/pages/Register/RegisterPage';

// ==================== MOCKS ====================

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../src/api/axiosConfig', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from '../../../src/api/axiosConfig';

// Helper para renderizar con Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RegisterPage - Tests Completos (100% Cobertura)', () => {
  // ==================== SETUP Y TEARDOWN ====================

  beforeEach(() => {
    jest.clearAllMocks();
    api.post.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==================== RENDERIZADO ====================

  describe('Renderizado', () => {
    it('debe renderizar el título "Registro de Administrador"', () => {
      renderWithRouter(<RegisterPage />);
      expect(screen.getByText('Registro de Administrador')).toBeInTheDocument();
    });

    it('debe renderizar todos los campos del formulario', () => {
      renderWithRouter(<RegisterPage />);
      
      expect(screen.getByLabelText(/Usuario/)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Contraseña/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirmar Contraseña/)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Nombre/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Apellido/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Empresa/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument();
    });

    it('debe renderizar los botones de acción', () => {
      renderWithRouter(<RegisterPage />);
      
      expect(screen.getByRole('button', { name: /Registrar Administrador/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Volver al Login/i })).toBeInTheDocument();
    });

    it('los inputs deben estar vacíos inicialmente', () => {
      renderWithRouter(<RegisterPage />);
      
      expect(screen.getByLabelText(/Usuario/)).toHaveValue('');
      expect(screen.getByLabelText(/^Contraseña/)).toHaveValue('');
      expect(screen.getByLabelText(/Email/)).toHaveValue('');
    });
  });

  // ==================== VALIDACIONES DE CAMPOS ====================

  describe('Validaciones de campos individuales', () => {
    it('debe validar usuario - campo requerido', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/Usuario/);
      fireEvent.focus(input);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/Usuario es requerido/i)).toBeInTheDocument();
      });
    });

    it('debe validar usuario - longitud mínima', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/Usuario/);
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/debe tener 3-50 caracteres/i)).toBeInTheDocument();
      });
    });

    it('debe validar usuario - solo caracteres válidos', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/Usuario/);
      fireEvent.change(input, { target: { value: 'user@invalid' } });
      fireEvent.blur(input);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/solo letras, números y guion bajo/i);
        const errorText = errorMessages.find(el => el.classList.contains('error-text'));
        expect(errorText).toBeInTheDocument();
      });
    });

    it('debe validar contraseña - longitud mínima', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/^Contraseña/);
      fireEvent.change(input, { target: { value: '12345' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/debe tener mínimo 6 caracteres/i)).toBeInTheDocument();
      });
    });

    it('debe validar que las contraseñas coincidan', async () => {
      renderWithRouter(<RegisterPage />);
      
      fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'password123' } });
      const confirmInput = screen.getByLabelText(/Confirmar Contraseña/);
      fireEvent.change(confirmInput, { target: { value: 'password456' } });
      fireEvent.blur(confirmInput);

      await waitFor(() => {
        expect(screen.getByText(/Las contraseñas deben coincidir/i)).toBeInTheDocument();
      });
    });

    it('debe validar email - formato válido', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/Email/);
      fireEvent.change(input, { target: { value: 'invalid-email' } });
      fireEvent.blur(input);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/Debe ser un email válido/i);
        const errorText = errorMessages.find(el => el.classList.contains('error-text'));
        expect(errorText).toBeInTheDocument();
      });
    });

    it('debe validar nombre - solo letras', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/^Nombre/);
      fireEvent.change(input, { target: { value: 'Juan123' } });
      fireEvent.blur(input);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/solo letras y espacios/i);
        const errorText = errorMessages.find(el => 
          el.classList.contains('error-text') && 
          el.textContent.includes('Nombre')
        );
        expect(errorText).toBeInTheDocument();
      });
    });

    it('debe validar apellido - solo letras', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/Apellido/);
      fireEvent.change(input, { target: { value: 'Pérez123' } });
      fireEvent.blur(input);

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/solo letras y espacios/i);
        const errorText = errorMessages.find(el => 
          el.classList.contains('error-text') && 
          el.textContent.includes('Apellido')
        );
        expect(errorText).toBeInTheDocument();
      });
    });

    it('debe aceptar teléfono opcional vacío', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/Teléfono/);
      fireEvent.focus(input);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText(/Teléfono es requerido/i)).not.toBeInTheDocument();
      });
    });

    it('debe validar formato de teléfono', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/Teléfono/);
      fireEvent.change(input, { target: { value: 'abc123' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/solo puede contener números/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== VALIDACIÓN COMPLETA DEL FORMULARIO ====================

  describe('Validación completa del formulario', () => {
    it('debe mostrar error cuando se envía formulario vacío', async () => {
      renderWithRouter(<RegisterPage />);
      
      const submitBtn = screen.getByRole('button', { name: /Registrar Administrador/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/corrige los errores en el formulario/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar errores de validación al submit', async () => {
      renderWithRouter(<RegisterPage />);
      
      const submitBtn = screen.getByRole('button', { name: /Registrar Administrador/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Usuario es requerido/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== ENVÍO DEL FORMULARIO ====================

  describe('Envío del formulario', () => {
    const llenarFormulario = () => {
      fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin_test' } });
      fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
      fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
      fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'juan@test.com' } });
      fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test Corp' } });
    };

    it('debe llamar a fetch con los datos correctos', async () => {
      api.post.mockResolvedValueOnce({ data: { message: 'Éxito' } });

      renderWithRouter(<RegisterPage />);
      llenarFormulario();

      fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/api/register/register-admin',
          expect.objectContaining({ usuario: 'admin_test' })
        );
      });
    });

    it('debe incluir rol "administrador" en el body', async () => {
      api.post.mockResolvedValueOnce({ data: { message: 'Éxito' } });

      renderWithRouter(<RegisterPage />);
      llenarFormulario();

      fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(api.post.mock.calls[0][1].rol).toBe('administrador');
      });
    });

    it('debe convertir email a minúsculas', async () => {
      api.post.mockResolvedValueOnce({ data: { message: 'Éxito' } });

      renderWithRouter(<RegisterPage />);

      fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin' } });
      fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
      fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
      fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'JUAN@TEST.COM' } });
      fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test' } });

      fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(api.post.mock.calls[0][1].email).toBe('juan@test.com');
      });
    });

    it('debe mostrar mensaje de éxito al registrar correctamente', async () => {
      api.post.mockResolvedValueOnce({ data: { message: 'Administrador registrado correctamente' } });

      renderWithRouter(<RegisterPage />);
      llenarFormulario();

      fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(screen.getByText(/Administrador registrado correctamente/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar error del servidor', async () => {
      api.post.mockRejectedValueOnce(Object.assign(new Error('fail'), { response: { data: { message: 'Usuario ya existe' } } }));

      renderWithRouter(<RegisterPage />);
      llenarFormulario();

      fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(screen.getByText(/Usuario ya existe/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar error de conexión', async () => {
      api.post.mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter(<RegisterPage />);
      llenarFormulario();

      fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(screen.getByText(/Error al registrar el administrador/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== NAVEGACIÓN ====================

  describe('Navegación', () => {
    it('debe navegar a /login al hacer click en "Volver al Login"', () => {
      renderWithRouter(<RegisterPage />);
      
      fireEvent.click(screen.getByRole('button', { name: /Volver al Login/i }));
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  // ==================== CLASES CSS ====================

  describe('Clases CSS', () => {
    it('debe aplicar clase input-error cuando hay error', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/Usuario/);
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toHaveClass('input-error');
      });
    });

    it('debe mostrar texto de error con clase error-text', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/Usuario/);
      fireEvent.blur(input);

      await waitFor(() => {
        const errorText = screen.getByText(/Usuario es requerido/i);
        expect(errorText).toHaveClass('error-text');
      });
    });
  });

  // ==================== ACCESIBILIDAD ====================

  describe('Accesibilidad', () => {
    it('todos los inputs deben tener label asociado', () => {
      renderWithRouter(<RegisterPage />);
      
      expect(screen.getByLabelText(/Usuario/)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Contraseña/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    });

    it('el formulario debe usar noValidate', () => {
      const { container } = renderWithRouter(<RegisterPage />);
      const form = container.querySelector('form');
      expect(form).toHaveAttribute('noValidate');
    });

    it('los campos de contraseña deben ser tipo password', () => {
      renderWithRouter(<RegisterPage />);
      
      expect(screen.getByLabelText(/^Contraseña/)).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText(/Confirmar Contraseña/)).toHaveAttribute('type', 'password');
    });

    it('el campo de email debe ser tipo email', () => {
      renderWithRouter(<RegisterPage />);
      
      expect(screen.getByLabelText(/Email/)).toHaveAttribute('type', 'email');
    });

    it('el campo de teléfono debe ser tipo tel', () => {
      renderWithRouter(<RegisterPage />);
      
      expect(screen.getByLabelText(/Teléfono/)).toHaveAttribute('type', 'tel');
    });
  });

  // ==================== TESTS ADICIONALES PARA 100% COBERTURA ====================

  describe('Cobertura 100% - Tests Adicionales', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    // ==================== LÍNEA 109: Limpiar Error/Success al Submit ====================
    
    describe('Limpiar mensajes al submit', () => {
      it('debe limpiar mensaje de error al hacer nuevo submit', async () => {
        renderWithRouter(<RegisterPage />);
        
        // Primer submit para generar error
        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));
        
        await waitFor(() => {
          expect(screen.getByText(/corrige los errores/i)).toBeInTheDocument();
        });

        // Llenar formulario correctamente
        fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin_test' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test Corp' } });

        api.post.mockResolvedValueOnce({ data: { message: 'Éxito' } });

        // Segundo submit - debe limpiar error anterior
        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        await waitFor(() => {
          expect(screen.queryByText(/corrige los errores/i)).not.toBeInTheDocument();
        });
      });

      it('debe limpiar mensaje de success al hacer nuevo submit', async () => {
        api.post.mockResolvedValueOnce({ data: { message: 'Éxito' } });

        renderWithRouter(<RegisterPage />);

        // Llenar y enviar formulario
        fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin1' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test' } });

        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        await waitFor(() => {
          expect(screen.getByText(/registrado correctamente/i)).toBeInTheDocument();
        });

        // Avanzar timers para limpiar el formulario
        jest.advanceTimersByTime(2000);

        // Nuevo submit para verificar que se limpió success
        api.post.mockRejectedValueOnce(Object.assign(new Error('fail'), { response: { data: { message: 'Error nuevo' } } }));

        fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin2' } });
        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        await waitFor(() => {
          expect(screen.queryByText(/registrado correctamente/i)).not.toBeInTheDocument();
        });
      });
    });

    // ==================== LÍNEAS 149-150: setTimeout y Navegación ====================
    
    describe('Navegación después de registro exitoso', () => {
      it('debe navegar a /login después de 2 segundos de registro exitoso', async () => {
        jest.useRealTimers(); // Importante: usar timers reales para este test

        api.post.mockResolvedValueOnce({ data: { message: 'Administrador registrado correctamente' } });

        renderWithRouter(<RegisterPage />);
        
        // Llenar formulario
        fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin_test' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test Corp' } });

        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        // Verificar que NO navegó inmediatamente
        await waitFor(() => {
          expect(screen.getByText(/registrado correctamente/i)).toBeInTheDocument();
        });
        expect(mockNavigate).not.toHaveBeenCalled();

        // Esperar 2.1 segundos para el setTimeout
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/login');
        }, { timeout: 2500 });
        
        jest.useFakeTimers(); // Volver a fake timers
      });

      it('debe limpiar el formulario después de registro exitoso', async () => {
        api.post.mockResolvedValueOnce({ data: { message: 'Éxito' } });

        renderWithRouter(<RegisterPage />);
        
        // Llenar formulario
        const usuarioInput = screen.getByLabelText(/Usuario/);
        const passwordInput = screen.getByLabelText(/^Contraseña/);
        const emailInput = screen.getByLabelText(/Email/);
        
        fireEvent.change(usuarioInput, { target: { value: 'admin_test' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
        fireEvent.change(emailInput, { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test Corp' } });

        // Verificar que los campos tienen valores
        expect(usuarioInput).toHaveValue('admin_test');
        expect(passwordInput).toHaveValue('password123');
        expect(emailInput).toHaveValue('juan@test.com');

        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        await waitFor(() => {
          expect(screen.getByText(/registrado correctamente/i)).toBeInTheDocument();
        });

        // Después del registro exitoso, los campos deben estar vacíos
        await waitFor(() => {
          expect(usuarioInput).toHaveValue('');
          expect(passwordInput).toHaveValue('');
          expect(emailInput).toHaveValue('');
        });
      });
    });

    // ==================== EDGE CASES ADICIONALES ====================
    
    describe('Edge cases para cobertura completa', () => {
      it('debe manejar respuesta del servidor sin mensaje de error específico', async () => {
        api.post.mockRejectedValueOnce(Object.assign(new Error('fail'), { response: { data: { error: 'Error genérico' } } }));

        renderWithRouter(<RegisterPage />);
        
        fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test' } });

        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        await waitFor(() => {
          expect(screen.getByText(/Error genérico/i)).toBeInTheDocument();
        });
      });

      it('debe manejar respuesta del servidor sin mensaje ni error', async () => {
        api.post.mockRejectedValueOnce(new Error('fail'));

        renderWithRouter(<RegisterPage />);
        
        fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test' } });

        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        await waitFor(() => {
          expect(screen.getByText(/Error al registrar el administrador/i)).toBeInTheDocument();
        });
      });

      it('debe deshabilitar inputs mientras está submitting', async () => {
        api.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ data: { message: 'Éxito' } }), 100)));

        renderWithRouter(<RegisterPage />);
        
        fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test' } });

        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        // Durante el submit, los inputs deben estar disabled
        await waitFor(() => {
          expect(screen.getByLabelText(/Usuario/)).toBeDisabled();
          expect(screen.getByLabelText(/Email/)).toBeDisabled();
        });
      });

      it('debe cambiar texto del botón a "Registrando..." durante submit', async () => {
        api.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ data: { message: 'Éxito' } }), 100)));

        renderWithRouter(<RegisterPage />);
        
        fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test' } });

        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        await waitFor(() => {
          expect(screen.getByText(/Registrando.../i)).toBeInTheDocument();
        });
      });
    });

    // ==================== VALIDACIÓN DE TELÉFONO NULL ====================
    
    describe('Manejo de teléfono vacío como null', () => {
      it('debe enviar telefono como null cuando está vacío', async () => {
        api.post.mockResolvedValueOnce({ data: { message: 'Éxito' } });

        renderWithRouter(<RegisterPage />);

        fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test' } });
        // No llenar teléfono

        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        await waitFor(() => {
          expect(api.post.mock.calls[0][1].telefono).toBeNull();
        });
      });

      it('debe enviar telefono como null cuando solo tiene espacios', async () => {
        api.post.mockResolvedValueOnce({ data: { message: 'Éxito' } });

        renderWithRouter(<RegisterPage />);

        fireEvent.change(screen.getByLabelText(/Usuario/), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/), { target: { value: 'pass123' } });
        fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: 'Pérez' } });
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Test' } });
        fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '   ' } });

        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        await waitFor(() => {
          expect(api.post.mock.calls[0][1].telefono).toBeNull();
        });
      });
    });
  });
});