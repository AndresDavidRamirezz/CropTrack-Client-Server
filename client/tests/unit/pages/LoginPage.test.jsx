import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../../src/pages/Login/LoginPage';

// ==================== MOCKS ====================

// Mock de react-router-dom
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

// Mock del componente AuthModal
jest.mock('../../../src/components/AuthModal/AuthModal', () => {
  return function MockAuthModal({ role, setRole }) {
    return (
      <div data-testid="auth-modal">
        <button onClick={() => setRole('administrador')}>Administrador</button>
        <button onClick={() => setRole('trabajador')}>Trabajador</button>
        <button onClick={() => setRole('supervisor')}>Supervisor</button>
        <span data-testid="current-role">{role}</span>
      </div>
    );
  };
});

describe('LoginPage - Tests Unitarios', () => {
  // ==================== SETUP Y TEARDOWN ====================

  beforeEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();

    // Mock de localStorage
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.clear = jest.fn();

    // Reset api.post mock
    api.post.mockReset();

    // Mock de console para evitar ruido en tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==================== RENDERIZADO ====================

  describe('Renderizado', () => {
    it('debe renderizar el componente AuthModal', () => {
      render(<LoginPage />);
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    });

    it('debe renderizar el campo de usuario', () => {
      render(<LoginPage />);
      expect(screen.getByPlaceholderText('Ingresa tu usuario')).toBeInTheDocument();
    });

    it('debe renderizar el campo de contraseña', () => {
      render(<LoginPage />);
      expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toBeInTheDocument();
    });

    it('debe renderizar las labels correctamente', () => {
      render(<LoginPage />);
      expect(screen.getByText('Usuario')).toBeInTheDocument();
      expect(screen.getByText('Contraseña')).toBeInTheDocument();
    });

    it('debe renderizar el botón de iniciar sesión', () => {
      render(<LoginPage />);
      expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
    });

    it('debe renderizar el botón de registrar administrador', () => {
      render(<LoginPage />);
      expect(screen.getByRole('button', { name: 'Registrar Administrador' })).toBeInTheDocument();
    });

    it('debe tener los inputs vacíos inicialmente', () => {
      render(<LoginPage />);
      expect(screen.getByPlaceholderText('Ingresa tu usuario')).toHaveValue('');
      expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toHaveValue('');
    });

    it('no debe mostrar mensaje de error inicialmente', () => {
      render(<LoginPage />);
      expect(screen.queryByText(/⚠️/)).not.toBeInTheDocument();
    });
  });

  // ==================== INTERACCIONES CON INPUTS ====================

  describe('Interacciones con inputs', () => {
    it('debe actualizar el valor del campo usuario al escribir', async () => {
      render(<LoginPage />);
      const usuarioInput = screen.getByPlaceholderText('Ingresa tu usuario');

      await userEvent.type(usuarioInput, 'testuser');

      expect(usuarioInput).toHaveValue('testuser');
    });

    it('debe actualizar el valor del campo contraseña al escribir', async () => {
      render(<LoginPage />);
      const contrasenaInput = screen.getByPlaceholderText('Ingresa tu contraseña');

      await userEvent.type(contrasenaInput, 'password123');

      expect(contrasenaInput).toHaveValue('password123');
    });

		it('debe limpiar el error al escribir en cualquier campo', async () => {
			render(<LoginPage />);

			// Llenar campos para pasar validación HTML nativa
			await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'ab'); // 2 caracteres (fallará validación personalizada)
			await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), '12345'); // 5 caracteres (fallará validación personalizada)

			// Provocar un error de validación personalizada
			fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
			
			await waitFor(() => {
				expect(screen.getByText(/El usuario debe tener al menos 3 caracteres/)).toBeInTheDocument();
			});

			// Escribir para limpiar el error
			await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'c');

			expect(screen.queryByText(/El usuario debe tener al menos 3 caracteres/)).not.toBeInTheDocument();
		});

  // ==================== CAMBIO DE ROL ====================

  describe('Cambio de rol', () => {
    it('debe tener "administrador" como rol por defecto', () => {
      render(<LoginPage />);
      expect(screen.getByTestId('current-role')).toHaveTextContent('administrador');
    });

    it('debe poder cambiar a rol trabajador', () => {
      render(<LoginPage />);
      fireEvent.click(screen.getByText('Trabajador'));
      expect(screen.getByTestId('current-role')).toHaveTextContent('trabajador');
    });

    it('debe poder cambiar a rol supervisor', () => {
      render(<LoginPage />);
      fireEvent.click(screen.getByText('Supervisor'));
      expect(screen.getByTestId('current-role')).toHaveTextContent('supervisor');
    });
  });

  // ==================== VALIDACIONES ====================

  describe('Validaciones del formulario', () => {
		it('debe mostrar error cuando los campos están vacíos', async () => {
		render(<LoginPage />);

		const form = screen.getByRole('button', { name: 'Iniciar sesión' }).closest('form');
		
		// Disparar submit del formulario directamente para evitar validación HTML nativa
		fireEvent.submit(form);

		await waitFor(() => {
			expect(screen.getByText(/Todos los campos son obligatorios/)).toBeInTheDocument();
		});
	});

    it('debe mostrar error cuando solo hay espacios en blanco', async () => {
      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), '   ');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), '   ');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      expect(screen.getByText(/Todos los campos son obligatorios/)).toBeInTheDocument();
    });

    it('debe mostrar error cuando el usuario tiene menos de 3 caracteres', async () => {
      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'ab');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      expect(screen.getByText(/El usuario debe tener al menos 3 caracteres/)).toBeInTheDocument();
    });

    it('debe mostrar error cuando la contraseña tiene menos de 6 caracteres', async () => {
      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), '12345');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      expect(screen.getByText(/La contraseña debe tener al menos 6 caracteres/)).toBeInTheDocument();
    });

    it('debe pasar validación con datos correctos', async () => {
      api.post.mockResolvedValueOnce({ data: { token: 'fake-token', user: { id: 1 } } });

      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
      });
    });
  });

  // ==================== PROCESO DE LOGIN ====================

  describe('Proceso de login', () => {
    it('debe llamar a fetch con los datos correctos', async () => {
      api.post.mockResolvedValueOnce({ data: { token: 'fake-token', user: { id: 1 } } });

      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/api/auth/login',
          {
            usuario: 'testuser',
            contrasena: 'password123',
            rol: 'administrador',
          }
        );
      });
    });

    it('debe guardar datos en localStorage cuando login es exitoso', async () => {
      const mockUser = { id: 1, nombre: 'Test User' };
      api.post.mockResolvedValueOnce({ data: { token: 'fake-token', user: mockUser } });

      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
        expect(localStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockUser));
        expect(localStorage.setItem).toHaveBeenCalledWith('usuario', 'testuser');
      });
    });

    it('debe navegar a /main cuando login es exitoso', async () => {
      api.post.mockResolvedValueOnce({ data: { token: 'fake-token', user: { id: 1 } } });

      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/main');
      });
    });

    it('debe mostrar error cuando el servidor responde con error', async () => {
      api.post.mockRejectedValueOnce(Object.assign(new Error('fail'), { response: { data: { message: 'Credenciales inválidas' } } }));

      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(screen.getByText(/Credenciales inválidas/)).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje por defecto cuando servidor no envía message', async () => {
      api.post.mockRejectedValueOnce(new Error('Server error'));

      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(screen.getByText(/Credenciales incorrectas/)).toBeInTheDocument();
      });
    });

    it('debe mostrar error de conexión cuando fetch falla', async () => {
      api.post.mockRejectedValueOnce(new Error('Network error'));

      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(screen.getByText(/Credenciales incorrectas/)).toBeInTheDocument();
      });
    });
  });

  // ==================== ESTADO DE LOADING ====================

  describe('Estado de loading', () => {
    it('debe mostrar "Iniciando sesión..." durante el loading', async () => {
      api.post.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Iniciando sesión...' })).toBeInTheDocument();
      });
    });

    it('debe deshabilitar inputs durante el loading', async () => {
      api.post.mockImplementation(() => new Promise(() => {}));

      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Ingresa tu usuario')).toBeDisabled();
        expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toBeDisabled();
      });
    });

    it('debe deshabilitar botones durante el loading', async () => {
      api.post.mockImplementation(() => new Promise(() => {}));

      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Iniciando sesión...' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Registrar Administrador' })).toBeDisabled();
      });
    });

    it('debe restaurar estado normal después de completar login', async () => {
      api.post.mockRejectedValueOnce(new Error('Test error'));

      render(<LoginPage />);

      await userEvent.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'testuser');
      await userEvent.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');

      fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Iniciar sesión' })).not.toBeDisabled();
      });
    });
  });

  // ==================== NAVEGACIÓN ====================

  describe('Navegación', () => {
    it('debe navegar a /register al hacer click en Registrar Administrador', () => {
      render(<LoginPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Registrar Administrador' }));

      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  // ==================== ACCESIBILIDAD ====================

  describe('Accesibilidad', () => {
    it('los inputs deben tener el atributo required', () => {
      render(<LoginPage />);

      expect(screen.getByPlaceholderText('Ingresa tu usuario')).toHaveAttribute('required');
      expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toHaveAttribute('required');
    });

    it('el campo contraseña debe ser de tipo password', () => {
      render(<LoginPage />);

      expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toHaveAttribute('type', 'password');
    });

    it('el campo usuario debe ser de tipo text', () => {
      render(<LoginPage />);

      expect(screen.getByPlaceholderText('Ingresa tu usuario')).toHaveAttribute('type', 'text');
    });

    it('los botones deben ser accesibles por rol', () => {
      render(<LoginPage />);

      const buttons = screen.getAllByRole('button');
      // 3 del AuthModal mock + 2 del LoginPage (Iniciar sesión + Registrar)
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ==================== CLASES CSS ====================

  describe('Clases CSS', () => {
    it('debe aplicar clase login-container al contenedor principal', () => {
      const { container } = render(<LoginPage />);
      expect(container.querySelector('.login-container')).toBeInTheDocument();
    });

    it('debe aplicar clase form-input a los inputs', () => {
      render(<LoginPage />);

      expect(screen.getByPlaceholderText('Ingresa tu usuario')).toHaveClass('form-input');
      expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toHaveClass('form-input');
    });

    it('debe aplicar clase btn-login al botón de login', () => {
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toHaveClass('btn-login');
    });

    it('debe aplicar clase btn-register al botón de registro', () => {
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: 'Registrar Administrador' })).toHaveClass('btn-register');
    });

			it('debe aplicar clase error-message al mensaje de error', async () => {
		render(<LoginPage />);

		const form = screen.getByRole('button', { name: 'Iniciar sesión' }).closest('form');
		
		// Disparar submit del formulario
		fireEvent.submit(form);

		await waitFor(() => {
			const errorMessage = screen.getByText(/Todos los campos son obligatorios/).closest('div');
			expect(errorMessage).toHaveClass('error-message');
		});
	});
	});
	});	
});
