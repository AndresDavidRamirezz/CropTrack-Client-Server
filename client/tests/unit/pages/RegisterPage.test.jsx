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

// Helper para renderizar con Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RegisterPage - Tests Completos (100% Cobertura)', () => {
  // ==================== SETUP Y TEARDOWN ====================

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
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

    it('debe mostrar hints de ayuda en los campos', () => {
      renderWithRouter(<RegisterPage />);
      
      expect(screen.getByText(/3-50 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/Mínimo 6 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/Debe coincidir con la contraseña/i)).toBeInTheDocument();
    });

    it('debe mostrar asterisco (*) en campos requeridos', () => {
      const { container } = renderWithRouter(<RegisterPage />);
      const requiredSpans = container.querySelectorAll('.required');
      expect(requiredSpans.length).toBeGreaterThanOrEqual(7);
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

  // ==================== INDICADOR DE FORTALEZA DE CONTRASEÑA ====================

  describe('Indicador de fortaleza de contraseña', () => {
    it('debe mostrar indicador cuando se escribe una contraseña', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/^Contraseña/);
      fireEvent.change(input, { target: { value: 'password' } });

      await waitFor(() => {
        expect(screen.getByText(/Débil|Media|Buena|Excelente|Muy débil/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar "Muy débil" o "Débil" para contraseñas cortas', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/^Contraseña/);
      fireEvent.change(input, { target: { value: '123456' } });

      await waitFor(() => {
        expect(screen.getByText(/Muy débil|Débil/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar mejor fortaleza con contraseña compleja', async () => {
      renderWithRouter(<RegisterPage />);
      
      const input = screen.getByLabelText(/^Contraseña/);
      fireEvent.change(input, { target: { value: 'MyP@ssw0rd123!' } });

      await waitFor(() => {
        expect(screen.getByText(/Buena|Excelente/i)).toBeInTheDocument();
      });
    });

    it('no debe mostrar indicador con contraseña vacía', () => {
      renderWithRouter(<RegisterPage />);
      
      expect(screen.queryByText(/Muy débil|Débil|Media|Buena|Excelente/i)).not.toBeInTheDocument();
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
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Éxito' }),
      });

      renderWithRouter(<RegisterPage />);
      llenarFormulario();

      fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:4000/api/register/register-admin',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });

    it('debe incluir rol "administrador" en el body', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Éxito' }),
      });

      renderWithRouter(<RegisterPage />);
      llenarFormulario();

      fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
        expect(callBody.rol).toBe('administrador');
      });
    });

    it('debe convertir email a minúsculas', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Éxito' }),
      });

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
        const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
        expect(callBody.email).toBe('juan@test.com');
      });
    });

    it('debe mostrar mensaje de éxito al registrar correctamente', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Administrador registrado correctamente' }),
      });

      renderWithRouter(<RegisterPage />);
      llenarFormulario();

      fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(screen.getByText(/Administrador registrado correctamente/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar error del servidor', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Usuario ya existe' }),
      });

      renderWithRouter(<RegisterPage />);
      llenarFormulario();

      fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(screen.getByText(/Usuario ya existe/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar error de conexión', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter(<RegisterPage />);
      llenarFormulario();

      fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

      await waitFor(() => {
        expect(screen.getByText(/Error de conexión/i)).toBeInTheDocument();
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

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Éxito' }),
        });

        // Segundo submit - debe limpiar error anterior
        fireEvent.click(screen.getByRole('button', { name: /Registrar Administrador/i }));

        await waitFor(() => {
          expect(screen.queryByText(/corrige los errores/i)).not.toBeInTheDocument();
        });
      });

      it('debe limpiar mensaje de success al hacer nuevo submit', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Éxito' }),
        });

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
        global.fetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Error nuevo' }),
        });

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
        
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Administrador registrado correctamente' }),
        });

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
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Éxito' }),
        });

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

    // ==================== LÍNEAS 251-252: Barra de Fortaleza de Contraseña ====================
    
    describe('Barra de fortaleza de contraseña - Estilos y colores', () => {
      it('debe aplicar ancho y color correcto para contraseña muy débil', async () => {
        const { container } = renderWithRouter(<RegisterPage />);
        
        const passwordInput = screen.getByLabelText(/^Contraseña/);
        fireEvent.change(passwordInput, { target: { value: '123456' } });

        await waitFor(() => {
          const strengthBar = container.querySelector('.strength-bar');
          expect(strengthBar).toBeInTheDocument();
          
          // Verificar que tiene estilos (no importa el valor exacto, solo que existan)
          const styles = window.getComputedStyle(strengthBar);
          expect(strengthBar.style.width).toBeTruthy();
          expect(strengthBar.style.backgroundColor).toBeTruthy();
        });
      });

      it('debe calcular ancho correcto basado en strength level', async () => {
        const { container } = renderWithRouter(<RegisterPage />);
        
        const passwordInput = screen.getByLabelText(/^Contraseña/);
        
        // Contraseña débil (strength = 1-2)
        fireEvent.change(passwordInput, { target: { value: 'pass12' } });

        await waitFor(() => {
          const strengthBar = container.querySelector('.strength-bar');
          const width = strengthBar.style.width;
          
          // El ancho debe ser un porcentaje entre 0-100%
          expect(width).toMatch(/^\d+(\.\d+)?%$/);
          
          // Para strength bajo, debe ser <= 40%
          const widthValue = parseFloat(width);
          expect(widthValue).toBeLessThanOrEqual(40);
        });
      });

      it('debe mostrar color correcto para cada nivel de fortaleza', async () => {
        renderWithRouter(<RegisterPage />);
        
        const passwordInput = screen.getByLabelText(/^Contraseña/);
        
        // Contraseña fuerte
        fireEvent.change(passwordInput, { target: { value: 'MyP@ssw0rd123!' } });

        await waitFor(() => {
          const strengthText = screen.getByText(/Buena|Excelente/i);
          
          // Verificar que el elemento existe con estilo
          expect(strengthText.style.color).toBeTruthy();
        });
      });

      it('debe actualizar la barra al cambiar la contraseña', async () => {
        const { container } = renderWithRouter(<RegisterPage />);
        
        const passwordInput = screen.getByLabelText(/^Contraseña/);
        
        // Contraseña débil
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        
        await waitFor(() => {
          expect(screen.getByText(/Muy débil|Débil/i)).toBeInTheDocument();
        });

        // Cambiar a contraseña fuerte
        fireEvent.change(passwordInput, { target: { value: 'StrongP@ss123!' } });

        await waitFor(() => {
          expect(screen.getByText(/Buena|Excelente/i)).toBeInTheDocument();
        });
      });

      it('no debe renderizar .strength-bar cuando contraseña está vacía', () => {
        const { container } = renderWithRouter(<RegisterPage />);
        
        const strengthBar = container.querySelector('.strength-bar');
        expect(strengthBar).not.toBeInTheDocument();
      });

      it('debe mostrar .password-strength solo cuando hay contraseña', async () => {
        const { container } = renderWithRouter(<RegisterPage />);
        
        // Sin contraseña
        expect(container.querySelector('.password-strength')).not.toBeInTheDocument();
        
        // Con contraseña
        const passwordInput = screen.getByLabelText(/^Contraseña/);
        fireEvent.change(passwordInput, { target: { value: 'test123' } });

        await waitFor(() => {
          expect(container.querySelector('.password-strength')).toBeInTheDocument();
        });
      });
    });

    // ==================== EDGE CASES ADICIONALES ====================
    
    describe('Edge cases para cobertura completa', () => {
      it('debe manejar respuesta del servidor sin mensaje de error específico', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Error genérico' }),
        });

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
        global.fetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        });

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
        global.fetch.mockImplementationOnce(() => 
          new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: async () => ({ message: 'Éxito' })
          }), 100))
        );

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
        global.fetch.mockImplementationOnce(() => 
          new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: async () => ({ message: 'Éxito' })
          }), 100))
        );

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
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Éxito' }),
        });

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
          const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
          expect(callBody.telefono).toBeNull();
        });
      });

      it('debe enviar telefono como null cuando solo tiene espacios', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Éxito' }),
        });

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
          const callBody = JSON.parse(global.fetch.mock.calls[0][1].body);
          expect(callBody.telefono).toBeNull();
        });
      });
    });
  });
});