// ==================== TESTS UNITARIOS - ReportPage.jsx ====================
// Prueba el componente ReportPage en aislamiento:
// - Renderizado: header, estados de carga, vacío, error, grid de cosechas
// - getUserData: extracción de datos de localStorage
// - fetchCrops: llamada a la API y manejo de estados
// - handleGenerateReport: generación del PDF y apertura del preview
// - handleDownload: descarga del PDF desde el blob URL
// - handleClosePreview: cierre del modal y revocación del blob URL

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportPage from '../../../src/pages/Report/ReportPage';

// ==================== MOCKS ====================

// Mock de react-router-dom (ReportPage no usa useNavigate pero lo precaución)
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock de axiosConfig
jest.mock('../../../src/api/axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock de las utilidades de CropCard para aislar el componente
jest.mock('../../../src/components/Crop/Card/CropCard', () => ({
  __esModule: true,
  ESTADO_COLORS: {
    planificado: '#6c757d',
    sembrado: '#0d6efd',
    en_crecimiento: '#198754',
    maduro: '#ffc107',
    cosechado: '#20c997',
    cancelado: '#dc3545'
  },
  ESTADO_LABELS: {
    planificado: 'Planificado',
    sembrado: 'Sembrado',
    en_crecimiento: 'En Crecimiento',
    maduro: 'Maduro',
    cosechado: 'Cosechado',
    cancelado: 'Cancelado'
  },
  formatDate: jest.fn((date) => date ? '01/01/2026' : null),
  getFullImageUrl: jest.fn((url) => url),
  default: jest.fn(() => null),
}));

import api from '../../../src/api/axiosConfig';

// ==================== DATOS DE PRUEBA ====================

const mockCrops = [
  {
    id: 'crop-001',
    nombre: 'Tomates Cherry',
    tipo: 'Hortaliza',
    variedad: 'Cherry',
    ubicacion: 'Parcela A',
    fecha_siembra: '2026-01-15',
    estado: 'en_crecimiento',
    imagen_url: null
  },
  {
    id: 'crop-002',
    nombre: 'Maíz Dulce',
    tipo: 'Cereal',
    variedad: 'Dulce',
    ubicacion: 'Parcela B',
    fecha_siembra: '2026-02-01',
    estado: 'sembrado',
    imagen_url: 'https://example.com/maiz.jpg'
  }
];

const mockUserData = {
  id: 'user-123',
  nombre: 'Juan',
  apellido: 'Pérez',
  empresa: 'AgroTest S.A.'
};

// ==================== SETUP GLOBAL ====================

beforeEach(() => {
  // resetAllMocks limpia también la cola de mockResolvedValueOnce, evitando
  // que valores sin consumir de un test roto contaminen el siguiente test
  jest.resetAllMocks();

  // Mock de localStorage
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'userData') return JSON.stringify(mockUserData);
    if (key === 'token') return 'fake-jwt-token';
    return null;
  });
  Storage.prototype.setItem = jest.fn();
  Storage.prototype.removeItem = jest.fn();
  Storage.prototype.clear = jest.fn();

  // Mock de window.URL
  window.URL.createObjectURL = jest.fn(() => 'blob:mock-url-123');
  window.URL.revokeObjectURL = jest.fn();

  // Silenciar consola
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ==================== SUITE DE TESTS ====================

describe('ReportPage - Tests Unitarios', () => {

  // ==================== RENDERIZADO INICIAL ====================

  describe('Renderizado inicial', () => {
    it('debe renderizar el header con el título correcto', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      render(<ReportPage />);
      expect(screen.getByText('Reportes de Cosechas')).toBeInTheDocument();
    });

    it('debe renderizar el subtítulo de instrucción', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      render(<ReportPage />);
      expect(screen.getByText(/Selecciona una cosecha para generar su reporte PDF/i)).toBeInTheDocument();
    });

    it('debe aplicar clase report-page al contenedor principal', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      const { container } = render(<ReportPage />);
      expect(container.querySelector('.report-page')).toBeInTheDocument();
    });

    it('debe mostrar estado de carga inmediatamente al montar', () => {
      api.get.mockImplementation(() => new Promise(() => {})); // Nunca resuelve
      render(<ReportPage />);
      expect(screen.getByText('Cargando cosechas...')).toBeInTheDocument();
    });

    it('debe mostrar el spinner de carga', () => {
      api.get.mockImplementation(() => new Promise(() => {}));
      const { container } = render(<ReportPage />);
      expect(container.querySelector('.report-spinner')).toBeInTheDocument();
    });
  });

  // ==================== ESTADO VACÍO ====================

  describe('Estado vacío (sin cosechas)', () => {
    it('debe mostrar mensaje de sin cosechas cuando la API retorna array vacío', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('No tienes cosechas registradas')).toBeInTheDocument();
      });
    });

    it('debe mostrar hint de crear cosecha en estado vacío', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText(/Crea una cosecha primero para poder generar reportes/)).toBeInTheDocument();
      });
    });

    it('debe mostrar ícono en estado vacío', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('📋')).toBeInTheDocument();
      });
    });
  });

  // ==================== GRID DE COSECHAS ====================

  describe('Grid de cosechas', () => {
    it('debe mostrar las cosechas cuando la API retorna datos', async () => {
      api.get.mockResolvedValueOnce({ data: mockCrops });
      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
        expect(screen.getByText('Maíz Dulce')).toBeInTheDocument();
      });
    });

    it('debe renderizar una card por cada cosecha', async () => {
      api.get.mockResolvedValueOnce({ data: mockCrops });
      const { container } = render(<ReportPage />);

      await waitFor(() => {
        const cards = container.querySelectorAll('.report-crop-card');
        expect(cards.length).toBe(2);
      });
    });

    it('debe mostrar el tipo de cosecha en la card', async () => {
      api.get.mockResolvedValueOnce({ data: mockCrops });
      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Hortaliza')).toBeInTheDocument();
      });
    });

    it('debe mostrar la variedad de cosecha si existe', async () => {
      api.get.mockResolvedValueOnce({ data: mockCrops });
      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Cherry')).toBeInTheDocument();
      });
    });

    it('debe mostrar la ubicación con ícono de pin', async () => {
      api.get.mockResolvedValueOnce({ data: mockCrops });
      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText(/📍.*Parcela A/)).toBeInTheDocument();
      });
    });

    it('debe mostrar el texto de click para generar reporte en cada card', async () => {
      api.get.mockResolvedValueOnce({ data: mockCrops });
      render(<ReportPage />);

      await waitFor(() => {
        const footers = screen.getAllByText(/Click para generar reporte/);
        expect(footers.length).toBe(2);
      });
    });

    it('debe mostrar ícono de planta para cosechas sin imagen', async () => {
      api.get.mockResolvedValueOnce({ data: mockCrops });
      render(<ReportPage />);

      await waitFor(() => {
        const plantIcons = screen.getAllByText('🌱');
        expect(plantIcons.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('debe mostrar imagen si la cosecha tiene imagen_url', async () => {
      api.get.mockResolvedValueOnce({ data: mockCrops });
      render(<ReportPage />);

      await waitFor(() => {
        const img = screen.getByAltText('Maíz Dulce');
        expect(img).toBeInTheDocument();
      });
    });
  });

  // ==================== MANEJO DE ERRORES ====================

  describe('Manejo de errores al cargar cosechas', () => {
    it('debe mostrar banner de error cuando la API falla', async () => {
      api.get.mockRejectedValueOnce(Object.assign(new Error('fail'), {
        response: { data: { error: 'Error de conexión' } }
      }));

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Error de conexión')).toBeInTheDocument();
      });
    });

    it('debe mostrar error genérico cuando no hay response.data.error', async () => {
      api.get.mockRejectedValueOnce(new Error('Network Error'));
      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument();
      });
    });

    it('debe mostrar ícono de error en el banner', async () => {
      api.get.mockRejectedValueOnce(new Error('Error'));
      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('!')).toBeInTheDocument();
      });
    });

    it('debe poder cerrar el banner de error al hacer click en X', async () => {
      api.get.mockRejectedValueOnce(new Error('Error de prueba'));
      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Error de prueba')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'x' }));

      expect(screen.queryByText('Error de prueba')).not.toBeInTheDocument();
    });

    it('debe mostrar error cuando no hay usuario_creador_id en localStorage', async () => {
      Storage.prototype.getItem = jest.fn(() => JSON.stringify({})); // Sin id
      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('No se pudo identificar al usuario')).toBeInTheDocument();
      });
    });

    it('debe manejar localStorage malformado sin crashear', async () => {
      Storage.prototype.getItem = jest.fn((key) => {
        if (key === 'userData') return 'json-invalido{{{';
        return null;
      });

      render(<ReportPage />);

      // No debe lanzar excepción, debe mostrar error de identificación
      await waitFor(() => {
        expect(screen.getByText('No se pudo identificar al usuario')).toBeInTheDocument();
      });
    });
  });

  // ==================== fetchCrops ====================

  describe('fetchCrops - Llamada a la API', () => {
    it('debe llamar a la API con el usuario_creador_id correcto', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      render(<ReportPage />);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/crops/user/user-123');
      });
    });

    it('debe llamar a la API exactamente una vez al montar', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      render(<ReportPage />);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(1);
      });
    });

    it('debe desactivar loading después de cargar', async () => {
      api.get.mockResolvedValueOnce({ data: mockCrops });
      const { container } = render(<ReportPage />);

      await waitFor(() => {
        expect(container.querySelector('.report-page-loading')).not.toBeInTheDocument();
      });
    });
  });

  // ==================== handleGenerateReport ====================

  describe('handleGenerateReport - Generación del PDF', () => {
    it('debe llamar a la API con el cropId correcto al hacer click en una card', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockResolvedValueOnce({ data: new Blob(['%PDF-1.4'], { type: 'application/pdf' }) });

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      const card = document.querySelector('.report-crop-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/reports/crop-001', { responseType: 'blob' });
      });
    });

    it('debe mostrar overlay "Generando reporte..." mientras se procesa', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockImplementationOnce(() => new Promise(() => {})); // Nunca resuelve

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      const card = document.querySelector('.report-crop-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(screen.getByText('Generando reporte...')).toBeInTheDocument();
      });
    });

    it('debe crear un blob URL después de recibir el PDF', async () => {
      const mockBlob = new Blob(['%PDF-content'], { type: 'application/pdf' });
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockResolvedValueOnce({ data: mockBlob });

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        expect(window.URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it('debe abrir el modal de preview después de generar el reporte', async () => {
      const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockResolvedValueOnce({ data: mockBlob });

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        expect(screen.getByText(/Reporte: Tomates Cherry/)).toBeInTheDocument();
      });
    });

    it('debe mostrar error en el banner si la generación del reporte falla', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockRejectedValueOnce(Object.assign(new Error('fail'), {
          response: { data: { error: 'Error al generar el reporte' } }
        }));

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        expect(screen.getByText('Error al generar el reporte')).toBeInTheDocument();
      });
    });

    it('no debe generar reporte si ya se está generando uno', async () => {
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockImplementationOnce(() => new Promise(() => {}));

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      const cards = document.querySelectorAll('.report-crop-card');
      fireEvent.click(cards[0]); // Genera el primero
      fireEvent.click(cards[1]); // Intenta generar el segundo

      // Solo debe haber llamado a generate una vez (la segunda se bloquea)
      expect(api.get).toHaveBeenCalledTimes(2); // 1 fetchCrops + 1 generate
    });
  });

  // ==================== handleClosePreview ====================

  describe('handleClosePreview - Cierre del preview', () => {
    const setupPreview = async () => {
      const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockResolvedValueOnce({ data: mockBlob });

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        expect(screen.getByText(/Reporte:/)).toBeInTheDocument();
      });
    };

    it('debe cerrar el preview al hacer click en el botón Cerrar', async () => {
      await setupPreview();

      const closeBtn = screen.getByRole('button', { name: 'Cerrar' });
      fireEvent.click(closeBtn);

      expect(screen.queryByText(/Reporte:/)).not.toBeInTheDocument();
    });

    it('debe revocar el blob URL al cerrar el preview', async () => {
      await setupPreview();

      fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url-123');
    });

    it('debe cerrar el preview al hacer click fuera del modal (overlay)', async () => {
      await setupPreview();

      const overlay = document.querySelector('.report-preview-overlay');
      fireEvent.click(overlay);

      expect(screen.queryByText(/Reporte:/)).not.toBeInTheDocument();
    });

    it('no debe cerrar el preview al hacer click dentro del modal', async () => {
      await setupPreview();

      const modal = document.querySelector('.report-preview-modal');
      fireEvent.click(modal);

      expect(screen.getByText(/Reporte:/)).toBeInTheDocument();
    });
  });

  // ==================== handleDownload ====================

  describe('handleDownload - Descarga del PDF', () => {
    it('debe crear un link con href del blob URL al hacer click en Descargar', async () => {
      // Crear un <a> real para que appendChild/removeChild funcionen sin mock.
      // Solo espiamos click() para evitar que dispare una descarga real en jsdom.
      const realLink = document.createElement('a');
      const mockClick = jest.spyOn(realLink, 'click').mockImplementation(() => {});

      const origCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return realLink;
        return origCreateElement(tag);
      });

      const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockResolvedValueOnce({ data: mockBlob });

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        expect(screen.getByText(/Reporte:/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Descargar PDF/i }));

      expect(mockClick).toHaveBeenCalled();
    });

    it('debe generar el nombre del archivo con el formato correcto', async () => {
      // Crear un <a> real para que appendChild/removeChild funcionen sin mock.
      // Solo espiamos click() para evitar que dispare una descarga real en jsdom.
      const realLink = document.createElement('a');
      jest.spyOn(realLink, 'click').mockImplementation(() => {});

      const origCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return realLink;
        return origCreateElement(tag);
      });

      const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockResolvedValueOnce({ data: mockBlob });

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        expect(screen.getByText(/Reporte:/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Descargar PDF/i }));

      expect(realLink.download).toMatch(/^reporte-Tomates_Cherry-crop-001\.pdf$/);
    });
  });

  // ==================== MODAL DE PREVIEW ====================

  describe('Modal de preview', () => {
    it('debe mostrar el nombre de la cosecha en el header del modal', async () => {
      const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockResolvedValueOnce({ data: mockBlob });

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        expect(screen.getByText('Reporte: Tomates Cherry')).toBeInTheDocument();
      });
    });

    it('debe tener botón de descarga en el modal', async () => {
      const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockResolvedValueOnce({ data: mockBlob });

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Descargar PDF/i })).toBeInTheDocument();
      });
    });

    it('debe tener iframe con el blob URL del PDF', async () => {
      const mockBlob = new Blob(['%PDF'], { type: 'application/pdf' });
      api.get
        .mockResolvedValueOnce({ data: mockCrops })
        .mockResolvedValueOnce({ data: mockBlob });

      render(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Tomates Cherry')).toBeInTheDocument();
      });

      fireEvent.click(document.querySelector('.report-crop-card'));

      await waitFor(() => {
        const iframe = document.querySelector('.report-preview-iframe');
        expect(iframe).toBeInTheDocument();
        expect(iframe.src).toBe('blob:mock-url-123');
      });
    });
  });

  // ==================== CLASES CSS ====================

  describe('Clases CSS', () => {
    it('debe aplicar clase report-page-header al header', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      const { container } = render(<ReportPage />);
      expect(container.querySelector('.report-page-header')).toBeInTheDocument();
    });

    it('debe aplicar clase report-page-grid cuando hay cosechas', async () => {
      api.get.mockResolvedValueOnce({ data: mockCrops });
      const { container } = render(<ReportPage />);

      await waitFor(() => {
        expect(container.querySelector('.report-page-grid')).toBeInTheDocument();
      });
    });

    it('debe aplicar clase report-page-empty cuando no hay cosechas', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      const { container } = render(<ReportPage />);

      await waitFor(() => {
        expect(container.querySelector('.report-page-empty')).toBeInTheDocument();
      });
    });

    it('debe aplicar clase report-error-banner cuando hay error', async () => {
      api.get.mockRejectedValueOnce(new Error('Error test'));
      const { container } = render(<ReportPage />);

      await waitFor(() => {
        expect(container.querySelector('.report-error-banner')).toBeInTheDocument();
      });
    });
  });
});
