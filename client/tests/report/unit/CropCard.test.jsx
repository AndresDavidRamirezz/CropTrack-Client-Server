// ==================== TESTS UNITARIOS - CropCard.jsx ====================
// Prueba las funciones utilitarias exportadas de CropCard:
// - ESTADO_COLORS: colores por estado del cultivo
// - ESTADO_LABELS: etiquetas por estado del cultivo
// - formatDate: formateo de fechas
// - getFullImageUrl: construcción de URL de imagen
// - Componente CropCard: renderizado correcto

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CropCard, {
  ESTADO_COLORS,
  ESTADO_LABELS,
  formatDate,
  getFullImageUrl
} from '../../../src/components/Crop/Card/CropCard';

// ==================== MOCKS ====================

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ==================== SUITE DE TESTS ====================

describe('CropCard - Tests Unitarios', () => {

  // ==================== ESTADO_COLORS ====================

  describe('ESTADO_COLORS', () => {
    it('debe ser un objeto definido', () => {
      expect(ESTADO_COLORS).toBeDefined();
      expect(typeof ESTADO_COLORS).toBe('object');
    });

    it('debe tener el estado "planificado"', () => {
      expect(ESTADO_COLORS).toHaveProperty('planificado');
    });

    it('debe tener el estado "sembrado"', () => {
      expect(ESTADO_COLORS).toHaveProperty('sembrado');
    });

    it('debe tener el estado "en_crecimiento"', () => {
      expect(ESTADO_COLORS).toHaveProperty('en_crecimiento');
    });

    it('debe tener el estado "maduro"', () => {
      expect(ESTADO_COLORS).toHaveProperty('maduro');
    });

    it('debe tener el estado "cosechado"', () => {
      expect(ESTADO_COLORS).toHaveProperty('cosechado');
    });

    it('debe tener el estado "cancelado"', () => {
      expect(ESTADO_COLORS).toHaveProperty('cancelado');
    });

    it('todos los valores deben ser colores hexadecimales válidos', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      Object.values(ESTADO_COLORS).forEach(color => {
        expect(color).toMatch(hexColorRegex);
      });
    });

    it('planificado debe ser gris', () => {
      expect(ESTADO_COLORS.planificado).toBe('#6c757d');
    });

    it('en_crecimiento debe ser verde', () => {
      expect(ESTADO_COLORS.en_crecimiento).toBe('#198754');
    });

    it('cancelado debe ser rojo', () => {
      expect(ESTADO_COLORS.cancelado).toBe('#dc3545');
    });
  });

  // ==================== ESTADO_LABELS ====================

  describe('ESTADO_LABELS', () => {
    it('debe ser un objeto definido', () => {
      expect(ESTADO_LABELS).toBeDefined();
      expect(typeof ESTADO_LABELS).toBe('object');
    });

    it('debe tener la misma cantidad de estados que ESTADO_COLORS', () => {
      expect(Object.keys(ESTADO_LABELS).length).toBe(Object.keys(ESTADO_COLORS).length);
    });

    it('debe tener etiqueta para "planificado"', () => {
      expect(ESTADO_LABELS.planificado).toBe('Planificado');
    });

    it('debe tener etiqueta para "sembrado"', () => {
      expect(ESTADO_LABELS.sembrado).toBe('Sembrado');
    });

    it('debe tener etiqueta para "en_crecimiento"', () => {
      expect(ESTADO_LABELS.en_crecimiento).toBe('En Crecimiento');
    });

    it('debe tener etiqueta para "maduro"', () => {
      expect(ESTADO_LABELS.maduro).toBe('Maduro');
    });

    it('debe tener etiqueta para "cosechado"', () => {
      expect(ESTADO_LABELS.cosechado).toBe('Cosechado');
    });

    it('debe tener etiqueta para "cancelado"', () => {
      expect(ESTADO_LABELS.cancelado).toBe('Cancelado');
    });

    it('todos los valores deben ser strings no vacíos', () => {
      Object.values(ESTADO_LABELS).forEach(label => {
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });

    it('los mismos estados deben existir en ESTADO_COLORS y ESTADO_LABELS', () => {
      const colorKeys = Object.keys(ESTADO_COLORS).sort();
      const labelKeys = Object.keys(ESTADO_LABELS).sort();
      expect(colorKeys).toEqual(labelKeys);
    });
  });

  // ==================== formatDate ====================

  describe('formatDate', () => {
    it('debe retornar null cuando dateString es null', () => {
      expect(formatDate(null)).toBeNull();
    });

    it('debe retornar null cuando dateString es undefined', () => {
      expect(formatDate(undefined)).toBeNull();
    });

    it('debe retornar null cuando dateString es string vacío', () => {
      expect(formatDate('')).toBeNull();
    });

    it('debe formatear una fecha válida en formato español (dd/mm/yyyy)', () => {
      const result = formatDate('2026-01-15');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // El formato es: día/mes/año
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('debe incluir el año correcto en el formateo', () => {
      const result = formatDate('2026-03-20');
      expect(result).toContain('2026');
    });

    it('debe formatear fecha en formato es-ES (dd/mm/yyyy)', () => {
      const result = formatDate('2026-01-05');
      // Día 05 del mes 01 del año 2026
      expect(result).toBe('05/01/2026');
    });

    it('debe manejar fechas con hora (ISO string)', () => {
      const result = formatDate('2026-06-15T00:00:00.000Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('debe funcionar con fecha de diciembre', () => {
      const result = formatDate('2026-12-31');
      expect(result).toContain('2026');
    });
  });

  // ==================== getFullImageUrl ====================

  describe('getFullImageUrl', () => {
    it('debe retornar null cuando url es null', () => {
      expect(getFullImageUrl(null)).toBeNull();
    });

    it('debe retornar null cuando url es undefined', () => {
      expect(getFullImageUrl(undefined)).toBeNull();
    });

    it('debe retornar null cuando url es string vacío', () => {
      expect(getFullImageUrl('')).toBeNull();
    });

    it('debe retornar la URL completa si ya empieza con http', () => {
      const httpUrl = 'http://cloudinary.com/image.jpg';
      expect(getFullImageUrl(httpUrl)).toBe(httpUrl);
    });

    it('debe retornar la URL completa si ya empieza con https', () => {
      const httpsUrl = 'https://res.cloudinary.com/test/image/upload/v1/crops/img.jpg';
      expect(getFullImageUrl(httpsUrl)).toBe(httpsUrl);
    });

    it('debe agregar baseURL a URLs relativas', () => {
      const relativeUrl = '/uploads/crops/imagen.jpg';
      const result = getFullImageUrl(relativeUrl);
      expect(result).toContain(relativeUrl);
      expect(result).toMatch(/^http/);
    });

    it('debe usar localhost:4000 como baseURL por defecto para URLs relativas', () => {
      const relativeUrl = '/uploads/test.jpg';
      const result = getFullImageUrl(relativeUrl);
      expect(result).toBe(`http://localhost:4000${relativeUrl}`);
    });

    it('no debe duplicar el dominio en URLs absolutas', () => {
      const absoluteUrl = 'https://example.com/image.png';
      const result = getFullImageUrl(absoluteUrl);
      expect(result).toBe(absoluteUrl);
      expect(result.match(/https/g).length).toBe(1);
    });
  });

  // ==================== COMPONENTE CropCard ====================

  describe('Componente CropCard', () => {
    const mockCrop = {
      id: 'crop-001',
      nombre: 'Tomates Cherry',
      tipo: 'Hortaliza',
      variedad: 'Cherry',
      ubicacion: 'Parcela A',
      fecha_cosecha_estimada: '2026-06-15',
      estado: 'en_crecimiento',
      imagen_url: null
    };

    const mockOnSelect = jest.fn();

    beforeEach(() => {
      mockOnSelect.mockClear();
    });

    it('debe renderizar el nombre del cultivo', () => {
      render(<CropCard crop={mockCrop} onSelect={mockOnSelect} />);
      expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
    });

    it('debe renderizar la ubicación del cultivo', () => {
      render(<CropCard crop={mockCrop} onSelect={mockOnSelect} />);
      expect(screen.getByText('Parcela A')).toBeInTheDocument();
    });

    it('debe renderizar la fecha de cosecha estimada formateada', () => {
      render(<CropCard crop={mockCrop} onSelect={mockOnSelect} />);
      const dateText = screen.getByText(/Cosecha:/);
      expect(dateText).toBeInTheDocument();
    });

    it('debe renderizar el badge de estado con la etiqueta correcta', () => {
      render(<CropCard crop={mockCrop} onSelect={mockOnSelect} />);
      expect(screen.getByText('En Crecimiento')).toBeInTheDocument();
    });

    it('debe aplicar el color correcto al badge de estado', () => {
      render(<CropCard crop={mockCrop} onSelect={mockOnSelect} />);
      const badge = screen.getByText('En Crecimiento');
      expect(badge).toHaveStyle({ backgroundColor: ESTADO_COLORS.en_crecimiento });
    });

    it('debe mostrar el ícono de planta cuando no hay imagen', () => {
      render(<CropCard crop={mockCrop} onSelect={mockOnSelect} />);
      expect(screen.getByText('🌱')).toBeInTheDocument();
    });

    it('debe mostrar una imagen cuando hay imagen_url', () => {
      const cropConImagen = { ...mockCrop, imagen_url: 'https://example.com/img.jpg' };
      render(<CropCard crop={cropConImagen} onSelect={mockOnSelect} />);
      const img = screen.getByAltText('Tomates Cherry');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
    });

    it('debe llamar a onSelect con el crop al hacer click', () => {
      render(<CropCard crop={mockCrop} onSelect={mockOnSelect} />);
      const card = document.querySelector('.crop-card');
      fireEvent.click(card);
      expect(mockOnSelect).toHaveBeenCalledWith(mockCrop);
    });

    it('debe llamar a onSelect exactamente una vez al hacer click', () => {
      render(<CropCard crop={mockCrop} onSelect={mockOnSelect} />);
      const card = document.querySelector('.crop-card');
      fireEvent.click(card);
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('no debe renderizar ubicación si no existe', () => {
      const cropSinUbicacion = { ...mockCrop, ubicacion: undefined };
      render(<CropCard crop={cropSinUbicacion} onSelect={mockOnSelect} />);
      expect(screen.queryByText('Parcela A')).not.toBeInTheDocument();
    });

    it('no debe renderizar fecha si no existe', () => {
      const cropSinFecha = { ...mockCrop, fecha_cosecha_estimada: null };
      render(<CropCard crop={cropSinFecha} onSelect={mockOnSelect} />);
      expect(screen.queryByText(/Cosecha:/)).not.toBeInTheDocument();
    });

    it('debe usar el estado raw si no existe etiqueta en ESTADO_LABELS', () => {
      const cropEstadoDesconocido = { ...mockCrop, estado: 'estado_inexistente' };
      render(<CropCard crop={cropEstadoDesconocido} onSelect={mockOnSelect} />);
      expect(screen.getByText('estado_inexistente')).toBeInTheDocument();
    });

    it('debe aplicar clase crop-card al contenedor principal', () => {
      render(<CropCard crop={mockCrop} onSelect={mockOnSelect} />);
      expect(document.querySelector('.crop-card')).toBeInTheDocument();
    });
  });
});
