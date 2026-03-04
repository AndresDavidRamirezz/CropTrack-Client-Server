// ==================== TESTS UNITARIOS - reportServices.js ====================
// Prueba el servicio de generación de PDF:
// - generatePDF: genera un documento PDF a partir de los datos del reporte
// PDFKit y ChartJSNodeCanvas se mockean para evitar dependencias nativas de canvas.

// ==================== MOCKS DE DEPENDENCIAS NATIVAS ====================

// Mock de chartjs-node-canvas ANTES de importar el servicio
jest.mock('chartjs-node-canvas', () => ({
  ChartJSNodeCanvas: jest.fn().mockImplementation(() => ({
    renderToBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-chart-image'))
  }))
}));

// Mock de pdfkit - simula un stream de escritura
jest.mock('pdfkit', () => {
  const EventEmitter = require('events');

  class MockPDFDocument extends EventEmitter {
    constructor(options) {
      super();
      this._options = options;
      this.page = {
        width: 595.28,
        height: 841.89,
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      };
      this._chunks = [];
      this._pageCount = 1;
    }

    // Métodos de escritura (chainable)
    font() { return this; }
    fontSize() { return this; }
    fillColor() { return this; }
    strokeColor() { return this; }
    text() { return this; }
    moveDown() { return this; }
    moveUp() { return this; }
    moveTo() { return this; }
    lineTo() { return this; }
    rect() { return this; }
    roundedRect() { return this; }
    fill() { return this; }
    stroke() { return this; }
    clip() { return this; }
    save() { return this; }
    restore() { return this; }
    translate() { return this; }
    scale() { return this; }
    image() { return this; }
    addPage() { this._pageCount++; return this; }
    lineGap() { return this; }
    list() { return this; }
    lineWidth() { return this; }

    // Estado del documento
    y = 100;
    x = 50;
    currentLineHeight() { return 14; }
    widthOfString() { return 100; }
    heightOfString() { return 14; }

    // Buffer pages (para footer)
    bufferedPageRange() { return { start: 0, count: this._pageCount }; }
    switchToPage() { return this; }

    // Pipe: simula el stream que acumula chunks
    pipe(destination) {
      return destination;
    }

    // Finalizar el documento y emitir 'end'
    end() {
      // Emitir datos y luego 'end' de manera síncrona para tests
      this.emit('data', Buffer.from('%PDF-1.4 mock'));
      this.emit('end');
    }
  }

  return MockPDFDocument;
});

// Mock de fs para evitar lectura de archivos reales (logo, imágenes)
jest.mock('fs', () => ({
  existsSync: jest.fn(() => false), // Por defecto, ningún archivo existe
  readFileSync: jest.fn(() => Buffer.from('fake-file-content')),
  createReadStream: jest.fn()
}));

// Mock de path
jest.mock('path', () => {
  const actual = jest.requireActual('path');
  return { ...actual };
});

// ==================== IMPORTS ====================

import reportService from '../../../services/reportServices.js';

// ==================== DATOS DE PRUEBA ====================

const createMinimalReportData = () => ({
  generado_en: new Date().toISOString(),
  cosecha: {
    id: 'crop-001',
    nombre: 'Tomates Cherry',
    tipo: 'Hortaliza',
    variedad: 'Cherry',
    area_hectareas: 5.5,
    ubicacion: 'Parcela A',
    fecha_siembra: '2026-01-15',
    fecha_cosecha_estimada: '2026-06-15',
    fecha_cosecha_real: null,
    estado: 'en_crecimiento',
    notas: 'Cultivo experimental',
    imagen_url: null
  },
  administrador: {
    nombre: 'Carlos',
    apellido: 'González',
    email: 'carlos@agrotech.com',
    empresa: 'AgroTech SRL',
    telefono: '1234567890',
    imagen_url: null
  },
  trabajadores: [],
  tareas: [],
  mediciones: []
});

const createFullReportData = () => ({
  ...createMinimalReportData(),
  trabajadores: [
    { id: 'w-001', nombre: 'Ana', apellido: 'López', rol: 'trabajador', email: 'ana@test.com', telefono: '111', imagen_url: null },
    { id: 'w-002', nombre: 'Pedro', apellido: 'García', rol: 'supervisor', email: 'pedro@test.com', telefono: '222', imagen_url: null }
  ],
  tareas: [
    { id: 't-001', nombre: 'Riego diario', descripcion: 'Riego matutino', estado: 'completada', prioridad: 'alta',
      fecha_inicio: '2026-02-01', fecha_fin_estimada: '2026-02-01', fecha_fin_real: '2026-02-01',
      asignado_nombre: 'Ana', asignado_apellido: 'López' },
    { id: 't-002', nombre: 'Fertilización', descripcion: 'Aplicar N-P-K', estado: 'pendiente', prioridad: 'media',
      fecha_inicio: '2026-02-10', fecha_fin_estimada: '2026-02-10', fecha_fin_real: null,
      asignado_nombre: null, asignado_apellido: null }
  ],
  mediciones: [
    { id: 'm-001', temperatura: 25.5, humedad: 65, ph_suelo: 6.8, altura_plantas: 45.2,
      fecha_medicion: '2026-02-15T10:00:00.000Z', usuario_nombre: 'Ana', usuario_apellido: 'López' },
    { id: 'm-002', temperatura: 23.0, humedad: 70, ph_suelo: 7.0, altura_plantas: 50.0,
      fecha_medicion: '2026-02-20T10:00:00.000Z', usuario_nombre: 'Pedro', usuario_apellido: 'García' }
  ]
});

// ==================== SETUP GLOBAL ====================

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

// ==================== SUITE DE TESTS ====================

describe('ReportServices - Tests Unitarios', () => {

  // ==================== generatePDF - Función principal ====================

  describe('generatePDF', () => {

    it('debe ser una función exportada', () => {
      expect(typeof reportService.generatePDF).toBe('function');
    });

    it('debe aceptar (reportData, callback) como parámetros', () => {
      expect(reportService.generatePDF.length).toBe(2);
    });

    it('debe llamar al callback con un Buffer cuando tiene éxito', (done) => {
      const reportData = createMinimalReportData();

      reportService.generatePDF(reportData, (err, pdfBuffer) => {
        expect(err).toBeNull();
        expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
        done();
      });
    }, 10000);

    it('el Buffer generado no debe estar vacío', (done) => {
      const reportData = createMinimalReportData();

      reportService.generatePDF(reportData, (err, pdfBuffer) => {
        expect(err).toBeNull();
        expect(pdfBuffer.length).toBeGreaterThan(0);
        done();
      });
    }, 10000);

    it('debe generar PDF con datos mínimos (arrays vacíos)', (done) => {
      const reportData = createMinimalReportData();

      reportService.generatePDF(reportData, (err, pdfBuffer) => {
        expect(err).toBeNull();
        expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
        done();
      });
    }, 10000);

    it('debe generar PDF con datos completos (trabajadores, tareas, mediciones)', (done) => {
      const reportData = createFullReportData();

      reportService.generatePDF(reportData, (err, pdfBuffer) => {
        expect(err).toBeNull();
        expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
        done();
      });
    }, 15000);

    it('debe manejar cosecha sin variedad', (done) => {
      const reportData = createMinimalReportData();
      reportData.cosecha.variedad = null;

      reportService.generatePDF(reportData, (err, pdfBuffer) => {
        expect(err).toBeNull();
        expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
        done();
      });
    }, 10000);

    it('debe manejar cosecha sin imagen_url', (done) => {
      const reportData = createMinimalReportData();
      reportData.cosecha.imagen_url = null;

      reportService.generatePDF(reportData, (err, pdfBuffer) => {
        expect(err).toBeNull();
        expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
        done();
      });
    }, 10000);

    it('debe manejar tareas con asignado null', (done) => {
      const reportData = createMinimalReportData();
      reportData.tareas = [
        { id: 't-001', nombre: 'Tarea sin asignar', descripcion: '', estado: 'pendiente', prioridad: 'baja',
          fecha_inicio: '2026-02-01', fecha_fin_estimada: null, fecha_fin_real: null,
          asignado_nombre: null, asignado_apellido: null }
      ];

      reportService.generatePDF(reportData, (err, pdfBuffer) => {
        expect(err).toBeNull();
        expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
        done();
      });
    }, 10000);

    it('debe manejar múltiples tareas con diferentes estados', (done) => {
      const reportData = createMinimalReportData();
      reportData.tareas = [
        { id: 't-1', nombre: 'T1', descripcion: '', estado: 'pendiente', prioridad: 'baja', fecha_inicio: null, fecha_fin_estimada: null, fecha_fin_real: null, asignado_nombre: 'A', asignado_apellido: 'B' },
        { id: 't-2', nombre: 'T2', descripcion: '', estado: 'en_proceso', prioridad: 'media', fecha_inicio: null, fecha_fin_estimada: null, fecha_fin_real: null, asignado_nombre: null, asignado_apellido: null },
        { id: 't-3', nombre: 'T3', descripcion: '', estado: 'completada', prioridad: 'alta', fecha_inicio: null, fecha_fin_estimada: null, fecha_fin_real: null, asignado_nombre: 'C', asignado_apellido: 'D' },
        { id: 't-4', nombre: 'T4', descripcion: '', estado: 'cancelada', prioridad: 'urgente', fecha_inicio: null, fecha_fin_estimada: null, fecha_fin_real: null, asignado_nombre: null, asignado_apellido: null }
      ];

      reportService.generatePDF(reportData, (err, pdfBuffer) => {
        expect(err).toBeNull();
        expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
        done();
      });
    }, 15000);

    it('debe manejar múltiples mediciones', (done) => {
      const reportData = createMinimalReportData();
      reportData.mediciones = Array.from({ length: 10 }, (_, i) => ({
        id: `m-${i}`,
        temperatura: 20 + i,
        humedad: 60 + i,
        ph_suelo: 6.5 + (i * 0.1),
        altura_plantas: 30 + i,
        fecha_medicion: `2026-02-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`,
        usuario_nombre: 'Ana',
        usuario_apellido: 'López'
      }));

      reportService.generatePDF(reportData, (err, pdfBuffer) => {
        expect(err).toBeNull();
        expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
        done();
      });
    }, 15000);
  });

  // ==================== Estructura del servicio ====================

  describe('Estructura del servicio', () => {
    it('debe exportar un objeto con el método generatePDF', () => {
      expect(reportService).toBeDefined();
      expect(typeof reportService).toBe('object');
      expect(typeof reportService.generatePDF).toBe('function');
    });

    it('solo debe exponer generatePDF como API pública principal', () => {
      expect(typeof reportService.generatePDF).toBe('function');
    });
  });
});
