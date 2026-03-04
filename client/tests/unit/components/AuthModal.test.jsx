import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthModal from '../../../src/components/AuthModal/AuthModal';

describe('AuthModal - Tests Unitarios', () => {
  let mockSetRole;

  beforeEach(() => {
    mockSetRole = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== RENDERIZADO ====================

  describe('Renderizado', () => {
    it('debe renderizar los tres botones de roles', () => {
      render(<AuthModal role="administrador" setRole={mockSetRole} />);
      
      expect(screen.getByText('Administrador')).toBeInTheDocument();
      expect(screen.getByText('Trabajador')).toBeInTheDocument();
      expect(screen.getByText('Supervisor')).toBeInTheDocument();
    });

    it('debe tener administrador seleccionado por defecto', () => {
      render(<AuthModal role="administrador" setRole={mockSetRole} />);
      
      const adminButton = screen.getByText('Administrador');
      expect(adminButton).toHaveClass('active');
    });

    it('debe mostrar trabajador seleccionado cuando role="trabajador"', () => {
      render(<AuthModal role="trabajador" setRole={mockSetRole} />);
      
      const workerButton = screen.getByText('Trabajador');
      expect(workerButton).toHaveClass('active');
      
      const adminButton = screen.getByText('Administrador');
      expect(adminButton).not.toHaveClass('active');
    });

    it('debe mostrar supervisor seleccionado cuando role="supervisor"', () => {
      render(<AuthModal role="supervisor" setRole={mockSetRole} />);
      
      const supervisorButton = screen.getByText('Supervisor');
      expect(supervisorButton).toHaveClass('active');
    });

    it('debe aplicar la clase role-button a todos los botones', () => {
      render(<AuthModal role="administrador" setRole={mockSetRole} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('role-button');
      });
    });
  });

  // ==================== INTERACCIONES ====================

  describe('Interacciones', () => {
    it('debe llamar a setRole con "administrador" al hacer click', () => {
      render(<AuthModal role="trabajador" setRole={mockSetRole} />);
      
      fireEvent.click(screen.getByText('Administrador'));
      
      expect(mockSetRole).toHaveBeenCalledTimes(1);
      expect(mockSetRole).toHaveBeenCalledWith('administrador');
    });

    it('debe llamar a setRole con "trabajador" al hacer click', () => {
      render(<AuthModal role="administrador" setRole={mockSetRole} />);
      
      fireEvent.click(screen.getByText('Trabajador'));
      
      expect(mockSetRole).toHaveBeenCalledWith('trabajador');
    });

    it('debe llamar a setRole con "supervisor" al hacer click', () => {
      render(<AuthModal role="administrador" setRole={mockSetRole} />);
      
      fireEvent.click(screen.getByText('Supervisor'));
      
      expect(mockSetRole).toHaveBeenCalledWith('supervisor');
    });

    it('debe permitir cambiar de rol múltiples veces', () => {
      render(<AuthModal role="administrador" setRole={mockSetRole} />);
      
      fireEvent.click(screen.getByText('Trabajador'));
      fireEvent.click(screen.getByText('Supervisor'));
      fireEvent.click(screen.getByText('Administrador'));
      
      expect(mockSetRole).toHaveBeenCalledTimes(3);
      expect(mockSetRole).toHaveBeenNthCalledWith(1, 'trabajador');
      expect(mockSetRole).toHaveBeenNthCalledWith(2, 'supervisor');
      expect(mockSetRole).toHaveBeenNthCalledWith(3, 'administrador');
    });
  });

  // ==================== CLASES CSS ====================

  describe('Clases CSS condicionales', () => {
    it('debe aplicar clase "active" solo al rol seleccionado', () => {
      render(<AuthModal role="trabajador" setRole={mockSetRole} />);
      
      const adminButton = screen.getByText('Administrador');
      const workerButton = screen.getByText('Trabajador');
      const supervisorButton = screen.getByText('Supervisor');
      
      expect(adminButton).not.toHaveClass('active');
      expect(workerButton).toHaveClass('active');
      expect(supervisorButton).not.toHaveClass('active');
    });

    it('debe cambiar la clase "active" cuando cambia el rol', () => {
      const { rerender } = render(<AuthModal role="administrador" setRole={mockSetRole} />);
      
      expect(screen.getByText('Administrador')).toHaveClass('active');
      
      // Cambiar el rol
      rerender(<AuthModal role="supervisor" setRole={mockSetRole} />);
      
      expect(screen.getByText('Administrador')).not.toHaveClass('active');
      expect(screen.getByText('Supervisor')).toHaveClass('active');
    });
  });

  // ==================== ACCESIBILIDAD ====================

  describe('Accesibilidad', () => {
    it('todos los botones deben ser accesibles por rol', () => {
      render(<AuthModal role="administrador" setRole={mockSetRole} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('los botones deben tener texto visible', () => {
      render(<AuthModal role="administrador" setRole={mockSetRole} />);
      
      expect(screen.getByText('Administrador')).toBeVisible();
      expect(screen.getByText('Trabajador')).toBeVisible();
      expect(screen.getByText('Supervisor')).toBeVisible();
    });
  });
});