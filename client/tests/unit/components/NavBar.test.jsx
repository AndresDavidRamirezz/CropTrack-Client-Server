import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../../../src/components/NavBar/NavBar';

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper para renderizar con Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NavBar - Tests Unitarios', () => {
  // ==================== SETUP Y TEARDOWN ====================

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==================== RENDERIZADO BÁSICO ====================

  describe('Renderizado básico', () => {
    it('debe renderizar el navbar', () => {
      const { container } = renderWithRouter(<NavBar />);
      expect(container.querySelector('.navbar')).toBeInTheDocument();
    });

    it('debe renderizar el logo', () => {
      renderWithRouter(<NavBar />);
      const logo = screen.getByAltText('Logo CropTrack');
      expect(logo).toBeInTheDocument();
    });

    it('debe renderizar el título CropTrack', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByText('CropTrack')).toBeInTheDocument();
    });

    it('debe aplicar las clases CSS correctas', () => {
      const { container } = renderWithRouter(<NavBar />);
      expect(container.querySelector('.navbar')).toHaveClass('navbar');
      expect(container.querySelector('.navbar-left')).toBeInTheDocument();
      expect(container.querySelector('.navbar-center')).toBeInTheDocument();
      expect(container.querySelector('.navbar-right')).toBeInTheDocument();
    });
  });

  // ==================== ESTADO SIN AUTENTICACIÓN ====================

  describe('Usuario NO autenticado', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('debe mostrar botones de Login y Registro', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Registrarse/i })).toBeInTheDocument();
    });

    it('NO debe mostrar el nombre del usuario', () => {
      renderWithRouter(<NavBar />);
      expect(screen.queryByText(/usuario/i)).not.toBeInTheDocument();
    });

    it('NO debe mostrar el botón de Cerrar Sesión', () => {
      renderWithRouter(<NavBar />);
      expect(screen.queryByRole('button', { name: /Cerrar Sesión/i })).not.toBeInTheDocument();
    });

    it('NO debe mostrar el badge de rol', () => {
      const { container } = renderWithRouter(<NavBar />);
      expect(container.querySelector('.user-role-badge')).not.toBeInTheDocument();
    });

    it('debe tener título del logo "Ir al Inicio"', () => {
      renderWithRouter(<NavBar />);
      const logo = screen.getByAltText('Logo CropTrack');
      expect(logo).toHaveAttribute('title', 'Ir al Inicio');
    });
  });

  // ==================== ESTADO CON AUTENTICACIÓN ====================

  describe('Usuario autenticado', () => {
    beforeEach(() => {
      localStorage.setItem('usuario', 'testuser');
      localStorage.setItem('role', 'administrador');
      localStorage.setItem('token', 'fake-token');
    });

    it('debe mostrar el nombre del usuario', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('debe mostrar el botón de Cerrar Sesión', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByRole('button', { name: /Cerrar Sesión/i })).toBeInTheDocument();
    });

    it('debe mostrar el badge de rol', () => {
      const { container } = renderWithRouter(<NavBar />);
      const roleBadge = container.querySelector('.user-role-badge');
      expect(roleBadge).toBeInTheDocument();
      expect(roleBadge).toHaveTextContent('administrador');
    });

    it('NO debe mostrar los botones de Login y Registro', () => {
      renderWithRouter(<NavBar />);
      expect(screen.queryByRole('button', { name: /Iniciar Sesión/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Registrarse/i })).not.toBeInTheDocument();
    });

    it('debe tener título del logo "Ir al Dashboard"', () => {
      renderWithRouter(<NavBar />);
      const logo = screen.getByAltText('Logo CropTrack');
      expect(logo).toHaveAttribute('title', 'Ir al Dashboard');
    });

    it('debe mostrar diferentes roles correctamente', () => {
      localStorage.setItem('role', 'supervisor');
      const { container } = renderWithRouter(<NavBar />);
      const roleBadge = container.querySelector('.user-role-badge');
      expect(roleBadge).toHaveTextContent('supervisor');
    });
  });

  // ==================== NAVEGACIÓN - USUARIO NO AUTENTICADO ====================

  describe('Navegación - Usuario NO autenticado', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('debe navegar a /login al hacer click en Iniciar Sesión', () => {
      renderWithRouter(<NavBar />);
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('debe navegar a /register/register-admin al hacer click en Registrarse', () => {
      renderWithRouter(<NavBar />);
      fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/register/register-admin');
    });

    it('debe navegar a / al hacer click en el logo', () => {
      renderWithRouter(<NavBar />);
      const logo = screen.getByAltText('Logo CropTrack');
      fireEvent.click(logo);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // ==================== NAVEGACIÓN - USUARIO AUTENTICADO ====================

  describe('Navegación - Usuario autenticado', () => {
    beforeEach(() => {
      localStorage.setItem('usuario', 'testuser');
      localStorage.setItem('role', 'administrador');
    });

    it('debe navegar a /main al hacer click en el logo', () => {
      renderWithRouter(<NavBar />);
      const logo = screen.getByAltText('Logo CropTrack');
      fireEvent.click(logo);
      expect(mockNavigate).toHaveBeenCalledWith('/main');
    });
  });

  // ==================== LOGOUT ====================

  describe('Logout', () => {
    beforeEach(() => {
      localStorage.setItem('usuario', 'testuser');
      localStorage.setItem('role', 'administrador');
      localStorage.setItem('token', 'fake-token');
    });

    it('debe limpiar localStorage al hacer logout', () => {
      renderWithRouter(<NavBar />);
      fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }));

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('usuario')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
    });

    it('debe navegar a / después del logout', () => {
      renderWithRouter(<NavBar />);
      fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('debe manejar errores durante el logout', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // 🔑 GUARDAR la función original
      const originalRemoveItem = Storage.prototype.removeItem;
      
      // Simular error en localStorage
      Storage.prototype.removeItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      renderWithRouter(<NavBar />);
      fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }));

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');

      // ⭐ CRÍTICO: Restaurar la función original
      Storage.prototype.removeItem = originalRemoveItem;
      consoleErrorSpy.mockRestore();
    });
  });

  // ==================== MANEJO DE ERRORES ====================

  describe('Manejo de errores', () => {
    it('debe manejar error al navegar desde el logo', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockNavigate.mockImplementationOnce(() => {
        throw new Error('Navigation error');
      });

      renderWithRouter(<NavBar />);
      const logo = screen.getByAltText('Logo CropTrack');
      fireEvent.click(logo);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('debe manejar error en carga del logo', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithRouter(<NavBar />);
      const logo = screen.getByAltText('Logo CropTrack');
      
      fireEvent.error(logo);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('debe manejar error al navegar a login', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockNavigate.mockImplementationOnce(() => {
        throw new Error('Navigation error');
      });

      renderWithRouter(<NavBar />);
      fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('debe manejar error al navegar a registro', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockNavigate.mockImplementationOnce(() => {
        throw new Error('Navigation error');
      });

      renderWithRouter(<NavBar />);
      fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // ==================== ACCESIBILIDAD ====================

  describe('Accesibilidad', () => {
    it('los botones deben tener aria-label apropiados cuando el usuario NO está logueado', () => {
      localStorage.clear();
      renderWithRouter(<NavBar />);

      const loginBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });
      const registerBtn = screen.getByRole('button', { name: /Registrarse/i });

      expect(loginBtn).toHaveAttribute('aria-label', 'Ir a iniciar sesión');
      expect(registerBtn).toHaveAttribute('aria-label', 'Ir a registrarse');
    });

    it('el botón de logout debe tener aria-label cuando el usuario está logueado', () => {
      localStorage.setItem('usuario', 'testuser');
      renderWithRouter(<NavBar />);

      const logoutBtn = screen.getByRole('button', { name: /Cerrar Sesión/i });
      expect(logoutBtn).toHaveAttribute('aria-label', 'Cerrar sesión');
    });

    it('el logo debe tener cursor pointer', () => {
      renderWithRouter(<NavBar />);
      const logo = screen.getByAltText('Logo CropTrack');
      expect(logo).toHaveStyle({ cursor: 'pointer' });
    });

    it('los botones deben tener títulos descriptivos', () => {
      localStorage.clear();
      renderWithRouter(<NavBar />);

      expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toHaveAttribute('title', 'Iniciar Sesión');
      expect(screen.getByRole('button', { name: /Registrarse/i })).toHaveAttribute('title', 'Registrarse como nuevo usuario');
    });

    it('el nombre de usuario debe tener título con tooltip', () => {
      localStorage.setItem('usuario', 'testuser');
      renderWithRouter(<NavBar />);

      const userName = screen.getByText('testuser');
      expect(userName).toHaveAttribute('title', 'Usuario: testuser');
    });

    it('el badge de rol debe tener título con tooltip', () => {
      localStorage.setItem('usuario', 'testuser');
      localStorage.setItem('role', 'administrador');
      
      const { container } = renderWithRouter(<NavBar />);
      const roleBadge = container.querySelector('.user-role-badge');
      
      expect(roleBadge).toHaveAttribute('title', 'Rol actual: administrador');
    });
  });

  // ==================== CASOS EDGE ====================

  describe('Casos edge', () => {
    it('debe manejar localStorage vacío correctamente', () => {
      localStorage.clear();
      renderWithRouter(<NavBar />);
      
      expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    });

    it('debe manejar solo usuario sin rol', () => {
      localStorage.setItem('usuario', 'testuser');
      localStorage.removeItem('role');
      
      const { container } = renderWithRouter(<NavBar />);
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(container.querySelector('.user-role-badge')).not.toBeInTheDocument();
    });

    it('debe manejar solo rol sin usuario', () => {
      localStorage.setItem('role', 'administrador');
      localStorage.removeItem('usuario');
      
      renderWithRouter(<NavBar />);
      expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    });

    it('debe manejar nombres de usuario largos', () => {
      localStorage.setItem('usuario', 'usuarioconunnombremuylargoquedeberiamostrarse');
      renderWithRouter(<NavBar />);
      
      expect(screen.getByText('usuarioconunnombremuylargoquedeberiamostrarse')).toBeInTheDocument();
    });
  });

  // ==================== SNAPSHOT ====================

  describe('Snapshot', () => {
    it('debe coincidir con snapshot - usuario NO autenticado', () => {
      localStorage.clear();
      const { container } = renderWithRouter(<NavBar />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('debe coincidir con snapshot - usuario autenticado', () => {
      localStorage.setItem('usuario', 'testuser');
      localStorage.setItem('role', 'administrador');
      const { container } = renderWithRouter(<NavBar />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});