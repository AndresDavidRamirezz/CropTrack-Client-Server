// ==================== TESTS DE INTEGRACIÓN - ReportPage ====================
// Prueba la integración del componente ReportPage con sus dependencias reales:
// - CropCard utilities (ESTADO_COLORS, ESTADO_LABELS, formatDate, getFullImageUrl)
// - Ciclo completo: fetch → render → generate → preview → download → close
// La API (axiosConfig) se mockea para simular la conexión sin servidor real.

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ReportPage from '../../../src/pages/Report/ReportPage';

// ==================== MOCKS ====================

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mockear solo la API, usar las utilidades reales de CropCard
jest.mock('../../../src/api/axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from '../../../src/api/axiosConfig';

// ==================== DATOS DE PRUEBA REALISTAS ====================

const mockUserData = {
  id: 'admin-uuid-001',
  nombre: 'Carlos',
  apellido: 'González',
  empresa: 'AgroTech SRL',
  rol: 'administrador'
};

const mockCropsData = [
  {
    id: 'crop-uuid-001',
    nombre: 'Papa Andina',
    tipo: 'Tubérculo',
    variedad: 'Andina amarilla',
    ubicacion: 'Campo Norte - Lote 3',
    fecha_siembra: '2026-01-10',
    estado: 'en_crecimiento',
    imagen_url: null
  },
  {
    id: 'crop-uuid-002',
    nombre: 'Soja Premium',
    tipo: 'Legumbre',
    variedad: 'RR Max',
    ubicacion: 'Campo Sur - Lote 1',
    fecha_siembra: '2026-02-05',
    estado: 'sembrado',
    imagen_url: 'https://res.cloudinary.com/demo/soja.jpg'
  },
  {
    id: 'crop-uuid-003',
    nombre: 'Trigo Pan',
    tipo: 'Cereal',
    variedad: null,
    ubicacion: null,
    fecha_siembra: null,
    estado: 'planificado',
    imagen_url: null
  }
];

// ==================== HELPERS ====================

const renderReportPage = () => {
  return render(
    <BrowserRouter>
      <ReportPage />
    </BrowserRouter>
  );
};

// ==================== SETUP GLOBAL ====================

beforeEach(() => {
  jest.clearAllMocks();

  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'userData') return JSON.stringify(mockUserData);
    if (key === 'token') return 'eyJhbGciOiJIUzI1NiJ9.test.token';
    return null;
  });
  Storage.prototype.setItem = jest.fn();

  window.URL.createObjectURL = jest.fn(() => 'blob:http://localhost:3000/test-pdf-url');
  window.URL.revokeObjectURL = jest.fn();

  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// ==================== SUITE DE TESTS ====================

describe('Integration: ReportPage + utilidades CropCard', () => {

  // ==================== CARGA INICIAL E INTEGRACIÓN ====================

  describe('Carga inicial y renderizado integrado', () => {
    test('carga y muestra todas las cosechas retornadas por la API', async () => {
      api.get.mockResolvedValueOnce({ data: mockCropsData });
      renderReportPage();

      await waitFor(() => {
        expect(screen.getByText('Papa Andina')).toBeInTheDocument();
        expect(screen.getByText('Soja Premium')).toBeInTheDocument();
        expect(screen.getByText('Trigo Pan')).toBeInTheDocument();
      });
    });

    test('muestra el estado loading durante la petición', () => {
      api.get.mockImplementation(() => new Promise(() => {}));
      renderReportPage();
      expect(screen.getByText('Cargando cosechas...')).toBeInTheDocument();
    });

    test('muestra estado vacío cuando no hay cosechas', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      renderReportPage();

      await waitFor(() => {
        expect(screen.getByText('No tienes cosechas registradas')).toBeInTheDocument();
      });
    });

    test('usa ESTADO_LABELS real para mostrar etiquetas de estado', async () => {
      api.get.mockResolvedValueOnce({ data: mockCropsData });
      renderReportPage();

      await waitFor(() => {
        // Las etiquetas son las de CropCard.jsx real
        expect(screen.getByText('En Crecimiento')).toBeInTheDocument();
        expect(screen.getByText('Sembrado')).toBeInTheDocument();
        expect(screen.getByText('Planificado')).toBeInTheDocument();
      });
    });

    test('usa ESTADO_COLORS real para el estilo del badge de estado', async () => {
      api.get.mockResolvedValueOnce({ data: mockCropsData });
      renderReportPage();

      await waitFor(() => {
        const enCrecimientoBadge = screen.getByText('En Crecimiento');
        // Verde de en_crecimiento: #198754
        expect(enCrecimientoBadge).toHaveStyle({ backgroundColor: '#198754' });
      });
    });

    test('usa formatDate real para mostrar la fecha de siembra', async () => {
      api.get.mockResolvedValueOnce({ data: mockCropsData });
      renderReportPage();

      await waitFor(() => {
        // La fecha '2026-01-10' debe aparecer formateada en es-ES
        const dateEl = screen.getByText(/Siembra:/);
        expect(dateEl).toBeInTheDocument();
        expect(dateEl.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      });
    });
  });

  // ==================== INTEGRACIÓN CON API ====================

  describe('Integración con la API (axiosConfig)', () => {
    test('llama a la API con la ruta correcta según usuario en localStorage', async () => {
      api.get.mockResolvedValueOnce({ data: mockCropsData });
      renderReportPage();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/crops/user/admin-uuid-001');
      });
    });

    test('muestra error cuando la API responde con 500', async () => {
      api.get.mockRejectedValueOnce(
        Object.assign(new Error('Internal Server Error'), {
          response: { data: { error: 'Error interno del servidor' } }
        })
      );
      renderReportPage();

      await waitFor(() => {
        expect(screen.getByText('Error interno del servidor')).toBeInTheDocument();
      });
    });

    test('muestra error cuando hay problema de red (sin response)', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'));
      renderReportPage();

      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument();
      });
    });
  });

  // ==================== FLUJO COMPLETO: FETCH → GENERATE → PREVIEW ====================

  describe('Flujo completo: carga → generación → preview → descarga → cierre', () => {
    test('flujo completo de generación de reporte', async () => {
      const user = userEvent.setup();
      const mockPdfBlob = new Blob(['%PDF-1.4 fake content'], { type: 'application/pdf' });

      api.get
        .mockResolvedValueOnce({ data: mockCropsData })      // fetchCrops
        .mockResolvedValueOnce({ data: mockPdfBlob });        // generateReport

      renderReportPage();

      // 1. Esperar que se carguen las cosechas
      await waitFor(() => {
        expect(screen.getByText('Papa Andina')).toBeInTheDocument();
      });

      // 2. Click en una cosecha para generar el reporte
      const firstCard = document.querySelector('.report-crop-card');
      fireEvent.click(firstCard);

      // 3. Verificar que se abrió el preview modal
      await waitFor(() => {
        expect(screen.getByText('Reporte: Papa Andina')).toBeInTheDocument();
      });

      // 4. Verificar que el iframe tiene la URL del blob
      const iframe = document.querySelector('.report-preview-iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('blob:http://localhost:3000/test-pdf-url');

      // 5. Verificar botones del modal
      expect(screen.getByRole('button', { name: /📥 Descargar PDF/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();

      // 6. Cerrar el preview
      fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

      // 7. Verificar que el modal se cerró y el blob URL fue revocado
      expect(screen.queryByText('Reporte: Papa Andina')).not.toBeInTheDocument();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost:3000/test-pdf-url');
    });

    test('el API de reporte se llama con responseType blob', async () => {
      const mockPdfBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      api.get
        .mockResolvedValueOnce({ data: mockCropsData })
        .mockResolvedValueOnce({ data: mockPdfBlob });

      renderReportPage();

      await waitFor(() => {
        expect(screen.getByText('Papa Andina')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          '/api/reports/crop-uuid-001',
          { responseType: 'blob' }
        );
      });
    });

    test('error durante generación muestra banner pero NO abre modal', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockCropsData })
        .mockRejectedValueOnce(Object.assign(new Error('fail'), {
          response: { data: { error: 'Cosecha no encontrada' } }
        }));

      renderReportPage();

      await waitFor(() => {
        expect(screen.getByText('Papa Andina')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        expect(screen.getByText('Cosecha no encontrada')).toBeInTheDocument();
      });

      // El modal NO debe haberse abierto
      expect(screen.queryByText(/Reporte:/)).not.toBeInTheDocument();
    });
  });

  // ==================== INTEGRACIÓN CON getFullImageUrl ====================

  describe('Integración con getFullImageUrl para imágenes de cosechas', () => {
    test('muestra ícono 🌱 para cosechas sin imagen', async () => {
      api.get.mockResolvedValueOnce({ data: [mockCropsData[0]] }); // Papa Andina sin imagen
      renderReportPage();

      await waitFor(() => {
        expect(screen.getByText('🌱')).toBeInTheDocument();
      });
    });

    test('muestra img tag con URL correcta para cosechas con imagen', async () => {
      api.get.mockResolvedValueOnce({ data: [mockCropsData[1]] }); // Soja con imagen
      renderReportPage();

      await waitFor(() => {
        const img = screen.getByAltText('Soja Premium');
        expect(img).toBeInTheDocument();
        // La URL ya es https://, debe pasarse sin modificar
        expect(img.src).toBe('https://res.cloudinary.com/demo/soja.jpg');
      });
    });
  });

  // ==================== MÚLTIPLES COSECHAS ====================

  describe('Interacción con múltiples cosechas', () => {
    test('solo muestra overlay de generating en la cosecha clickeada', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockCropsData })
        .mockImplementationOnce(() => new Promise(() => {})); // Nunca resuelve

      renderReportPage();

      await waitFor(() => {
        expect(screen.getByText('Soja Premium')).toBeInTheDocument();
      });

      const cards = document.querySelectorAll('.report-crop-card');
      fireEvent.click(cards[1]); // Click en Soja Premium

      await waitFor(() => {
        expect(screen.getByText('Generando reporte...')).toBeInTheDocument();
      });

      // Verificar que solo la segunda card tiene clase 'generating'
      expect(cards[0]).not.toHaveClass('generating');
      expect(cards[1]).toHaveClass('generating');
    });

    test('puede generar reportes de diferentes cosechas secuencialmente', async () => {
      const mockPdfBlob = new Blob(['%PDF'], { type: 'application/pdf' });

      // Primera generación: Papa Andina
      api.get
        .mockResolvedValueOnce({ data: mockCropsData })
        .mockResolvedValueOnce({ data: mockPdfBlob });

      renderReportPage();

      await waitFor(() => {
        expect(screen.getByText('Papa Andina')).toBeInTheDocument();
      });

      const cards = document.querySelectorAll('.report-crop-card');

      // Generar primer reporte
      fireEvent.click(cards[0]);
      await waitFor(() => {
        expect(screen.getByText('Reporte: Papa Andina')).toBeInTheDocument();
      });

      // Cerrar primer preview
      fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
      expect(screen.queryByText('Reporte: Papa Andina')).not.toBeInTheDocument();

      // Generar segundo reporte
      api.get.mockResolvedValueOnce({ data: mockPdfBlob });
      fireEvent.click(cards[1]);

      await waitFor(() => {
        expect(screen.getByText('Reporte: Soja Premium')).toBeInTheDocument();
      });
    });
  });

  // ==================== LIMPIEZA DE RECURSOS ====================

  describe('Limpieza de recursos al desmontar', () => {
    test('revoca el blob URL al desmontar el componente con preview activo', async () => {
      const mockPdfBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      api.get
        .mockResolvedValueOnce({ data: mockCropsData })
        .mockResolvedValueOnce({ data: mockPdfBlob });

      const { unmount } = renderReportPage();

      await waitFor(() => {
        expect(screen.getByText('Papa Andina')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        expect(screen.getByText(/Reporte:/)).toBeInTheDocument();
      });

      // Desmontar con preview activo
      unmount();

      // Debe haber revocado el blob URL
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});
