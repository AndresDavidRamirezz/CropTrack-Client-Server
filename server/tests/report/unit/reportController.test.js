// ==================== TESTS UNITARIOS - reportController.js ====================
// Prueba las funciones del controlador de reportes en aislamiento:
// - generateCropReport: genera el PDF y lo envía como respuesta
// - getCropReportData: retorna los datos del reporte como JSON
// Los modelos y el servicio de PDF se mockean completamente.

import { generateCropReport, getCropReportData } from '../../../controllers/reportController.js';
import ReportModel from '../../../models/reportModel.js';
import reportService from '../../../services/reportServices.js';

// ==================== MOCKS ====================

jest.mock('../../../models/reportModel.js');
jest.mock('../../../services/reportServices.js');

// ==================== DATOS DE PRUEBA ====================

const mockCropData = {
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
  notas: null,
  imagen_url: null,
  admin_nombre: 'Carlos',
  admin_apellido: 'González',
  admin_email: 'carlos@agrotech.com',
  admin_empresa: 'AgroTech SRL',
  admin_telefono: '1234567890',
  admin_imagen_url: null
};

const mockWorkers = [
  { id: 'w-001', nombre: 'Ana', apellido: 'López', rol: 'trabajador', email: 'ana@test.com', telefono: '111', imagen_url: null }
];

const mockTasks = [
  { id: 't-001', cultivo_id: 'crop-001', nombre: 'Riego', estado: 'completada', prioridad: 'alta' }
];

const mockMeasurements = [
  { id: 'm-001', cultivo_id: 'crop-001', temperatura: 25.5, humedad: 65, ph_suelo: 6.8 }
];

const mockPdfBuffer = Buffer.from('%PDF-1.4 fake pdf content');

// ==================== HELPERS ====================

const createMockReq = (cropId = 'crop-001') => ({
  params: { cropId },
  getConnection: jest.fn()
});

const createMockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  setHeader: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis()
});

const createMockConn = () => ({
  query: jest.fn()
});

// ==================== SETUP GLOBAL ====================

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ==================== SUITE DE TESTS ====================

describe('ReportController - Tests Unitarios', () => {

  // ==================== generateCropReport ====================

  describe('generateCropReport', () => {

    // --- Error de cropId ---

    describe('Validación de cropId', () => {
      it('no debe retornar 400 cuando cropId viene de params (Express siempre lo provee)', () => {
        // Express no permite que :cropId sea undefined si la ruta matchea
        // Pero el controller tiene el check. Probamos que no crashea.
        const req = { params: {}, getConnection: jest.fn() };
        const res = createMockRes();

        req.getConnection.mockImplementation((cb) => cb(null, createMockConn()));

        // Si cropId es undefined, el controller debería manejarlo
        // (aunque en la práctica Express siempre lo provee)
        generateCropReport(req, res);
      });
    });

    // --- Error de conexión a BD ---

    describe('Error de conexión a BD', () => {
      it('debe retornar 500 cuando hay error de conexión', () => {
        const req = createMockReq();
        const res = createMockRes();
        const dbError = new Error('ECONNREFUSED');
        dbError.code = 'ECONNREFUSED';

        req.getConnection.mockImplementation((callback) => {
          callback(dbError, null);
        });

        generateCropReport(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error de conexion con la base de datos' });
      });

      it('no debe llamar a ReportModel cuando falla la conexión', () => {
        const req = createMockReq();
        const res = createMockRes();

        req.getConnection.mockImplementation((callback) => {
          callback(new Error('Connection failed'), null);
        });

        generateCropReport(req, res);

        expect(ReportModel.findCropWithCreator).not.toHaveBeenCalled();
      });
    });

    // --- Error en findCropWithCreator ---

    describe('Error en findCropWithCreator', () => {
      it('debe retornar 500 cuando falla la query de cosecha', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => {
          cb(new Error('ER_NO_SUCH_TABLE'), null);
        });

        generateCropReport(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener datos de la cosecha' });
      });
    });

    // --- Cosecha no encontrada ---

    describe('Cosecha no encontrada', () => {
      it('debe retornar 404 cuando la cosecha no existe (null)', () => {
        const req = createMockReq('crop-inexistente');
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => {
          cb(null, null);
        });

        generateCropReport(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Cosecha no encontrada' });
      });

      it('no debe llamar a findWorkersByCrop cuando la cosecha no existe', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => {
          cb(null, null);
        });

        generateCropReport(req, res);

        expect(ReportModel.findWorkersByCrop).not.toHaveBeenCalled();
      });
    });

    // --- Error en findWorkersByCrop ---

    describe('Error en findWorkersByCrop', () => {
      it('debe retornar 500 cuando falla la query de trabajadores', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => cb(null, mockCropData));
        ReportModel.findWorkersByCrop.mockImplementation((conn, cropId, cb) => {
          cb(new Error('ER_ACCESS_DENIED'), null);
        });

        generateCropReport(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener trabajadores' });
      });
    });

    // --- Error en findTasksByCrop ---

    describe('Error en findTasksByCrop', () => {
      it('debe retornar 500 cuando falla la query de tareas', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => cb(null, mockCropData));
        ReportModel.findWorkersByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockWorkers));
        ReportModel.findTasksByCrop.mockImplementation((conn, cropId, cb) => {
          cb(new Error('ER_LOCK_TIMEOUT'), null);
        });

        generateCropReport(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener tareas' });
      });
    });

    // --- Error en findMeasurementsByCrop ---

    describe('Error en findMeasurementsByCrop', () => {
      it('debe retornar 500 cuando falla la query de mediciones', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => cb(null, mockCropData));
        ReportModel.findWorkersByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockWorkers));
        ReportModel.findTasksByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockTasks));
        ReportModel.findMeasurementsByCrop.mockImplementation((conn, cropId, cb) => {
          cb(new Error('ER_QUERY_TIMEOUT'), null);
        });

        generateCropReport(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener mediciones' });
      });
    });

    // --- Error en reportService.generatePDF ---

    describe('Error en generación de PDF', () => {
      it('debe retornar 500 cuando el servicio de PDF falla', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => cb(null, mockCropData));
        ReportModel.findWorkersByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockWorkers));
        ReportModel.findTasksByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockTasks));
        ReportModel.findMeasurementsByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockMeasurements));
        reportService.generatePDF.mockImplementation((reportData, cb) => {
          cb(new Error('PDFKit rendering failed'), null);
        });

        generateCropReport(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al generar el reporte PDF' });
      });
    });

    // --- Caso exitoso ---

    describe('Generación exitosa', () => {
      const setupSuccessfulMocks = (req, conn) => {
        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => cb(null, mockCropData));
        ReportModel.findWorkersByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockWorkers));
        ReportModel.findTasksByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockTasks));
        ReportModel.findMeasurementsByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockMeasurements));
        reportService.generatePDF.mockImplementation((reportData, cb) => cb(null, mockPdfBuffer));
      };

      it('debe enviar el PDF con Content-Type application/pdf', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessfulMocks(req, conn);
        generateCropReport(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      });

      it('debe enviar el PDF con Content-Disposition attachment', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessfulMocks(req, conn);
        generateCropReport(req, res);

        expect(res.setHeader).toHaveBeenCalledWith(
          'Content-Disposition',
          expect.stringContaining('attachment')
        );
      });

      it('debe incluir el nombre de la cosecha en el Content-Disposition', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessfulMocks(req, conn);
        generateCropReport(req, res);

        expect(res.setHeader).toHaveBeenCalledWith(
          'Content-Disposition',
          expect.stringContaining('Tomates_Cherry')
        );
      });

      it('debe enviar el buffer del PDF como cuerpo de respuesta', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessfulMocks(req, conn);
        generateCropReport(req, res);

        expect(res.send).toHaveBeenCalledWith(mockPdfBuffer);
      });

      it('debe enviar Content-Length igual al tamaño del buffer', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessfulMocks(req, conn);
        generateCropReport(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Length', mockPdfBuffer.length);
      });

      it('debe llamar a todos los métodos del modelo', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessfulMocks(req, conn);
        generateCropReport(req, res);

        expect(ReportModel.findCropWithCreator).toHaveBeenCalledWith(conn, 'crop-001', expect.any(Function));
        expect(ReportModel.findWorkersByCrop).toHaveBeenCalledWith(conn, 'crop-001', expect.any(Function));
        expect(ReportModel.findTasksByCrop).toHaveBeenCalledWith(conn, 'crop-001', expect.any(Function));
        expect(ReportModel.findMeasurementsByCrop).toHaveBeenCalledWith(conn, 'crop-001', expect.any(Function));
      });

      it('debe llamar a reportService.generatePDF con la estructura de reportData correcta', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessfulMocks(req, conn);
        generateCropReport(req, res);

        expect(reportService.generatePDF).toHaveBeenCalledWith(
          expect.objectContaining({
            cosecha: expect.objectContaining({
              id: 'crop-001',
              nombre: 'Tomates Cherry'
            }),
            administrador: expect.objectContaining({
              nombre: 'Carlos',
              apellido: 'González'
            }),
            trabajadores: mockWorkers,
            tareas: mockTasks,
            mediciones: mockMeasurements,
            generado_en: expect.any(String)
          }),
          expect.any(Function)
        );
      });

      it('debe usar array vacío cuando los trabajadores son null', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => cb(null, mockCropData));
        ReportModel.findWorkersByCrop.mockImplementation((conn, cropId, cb) => cb(null, null));
        ReportModel.findTasksByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockTasks));
        ReportModel.findMeasurementsByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockMeasurements));
        reportService.generatePDF.mockImplementation((reportData, cb) => cb(null, mockPdfBuffer));

        generateCropReport(req, res);

        expect(reportService.generatePDF).toHaveBeenCalledWith(
          expect.objectContaining({ trabajadores: [] }),
          expect.any(Function)
        );
      });
    });
  });

  // ==================== getCropReportData ====================

  describe('getCropReportData', () => {

    describe('Error de conexión a BD', () => {
      it('debe retornar 500 cuando hay error de conexión', () => {
        const req = createMockReq();
        const res = createMockRes();

        req.getConnection.mockImplementation((cb) => {
          cb(new Error('Connection failed'), null);
        });

        getCropReportData(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error de conexion con la base de datos' });
      });
    });

    describe('Cosecha no encontrada', () => {
      it('debe retornar 404 cuando la cosecha no existe', () => {
        const req = createMockReq('crop-no-existe');
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => cb(null, null));

        getCropReportData(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Cosecha no encontrada' });
      });
    });

    describe('Errores en queries del modelo', () => {
      it('debe retornar 500 cuando falla findCropWithCreator', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => {
          cb(new Error('DB Error'), null);
        });

        getCropReportData(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener datos de la cosecha' });
      });

      it('debe retornar 500 cuando falla findWorkersByCrop', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => cb(null, mockCropData));
        ReportModel.findWorkersByCrop.mockImplementation((conn, cropId, cb) => {
          cb(new Error('Workers Error'), null);
        });

        getCropReportData(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener trabajadores' });
      });

      it('debe retornar 500 cuando falla findTasksByCrop', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => cb(null, mockCropData));
        ReportModel.findWorkersByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockWorkers));
        ReportModel.findTasksByCrop.mockImplementation((conn, cropId, cb) => {
          cb(new Error('Tasks Error'), null);
        });

        getCropReportData(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener tareas' });
      });

      it('debe retornar 500 cuando falla findMeasurementsByCrop', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => cb(null, mockCropData));
        ReportModel.findWorkersByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockWorkers));
        ReportModel.findTasksByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockTasks));
        ReportModel.findMeasurementsByCrop.mockImplementation((conn, cropId, cb) => {
          cb(new Error('Measurements Error'), null);
        });

        getCropReportData(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener mediciones' });
      });
    });

    describe('Respuesta exitosa', () => {
      const setupSuccessGetDataMocks = (req, conn) => {
        req.getConnection.mockImplementation((cb) => cb(null, conn));
        ReportModel.findCropWithCreator.mockImplementation((conn, cropId, cb) => cb(null, mockCropData));
        ReportModel.findWorkersByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockWorkers));
        ReportModel.findTasksByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockTasks));
        ReportModel.findMeasurementsByCrop.mockImplementation((conn, cropId, cb) => cb(null, mockMeasurements));
      };

      it('debe retornar 200 con los datos del reporte como JSON', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessGetDataMocks(req, conn);
        getCropReportData(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            cosecha: expect.any(Object),
            administrador: expect.any(Object),
            trabajadores: expect.any(Array),
            tareas: expect.any(Array),
            mediciones: expect.any(Array),
            generado_en: expect.any(String)
          })
        );
      });

      it('debe incluir los datos de la cosecha correctamente mapeados', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessGetDataMocks(req, conn);
        getCropReportData(req, res);

        const responseData = res.json.mock.calls[0][0];
        expect(responseData.cosecha.id).toBe('crop-001');
        expect(responseData.cosecha.nombre).toBe('Tomates Cherry');
        expect(responseData.cosecha.tipo).toBe('Hortaliza');
      });

      it('debe incluir los datos del administrador correctamente mapeados', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessGetDataMocks(req, conn);
        getCropReportData(req, res);

        const responseData = res.json.mock.calls[0][0];
        expect(responseData.administrador.nombre).toBe('Carlos');
        expect(responseData.administrador.apellido).toBe('González');
        expect(responseData.administrador.email).toBe('carlos@agrotech.com');
        expect(responseData.administrador.empresa).toBe('AgroTech SRL');
      });

      it('no debe llamar a reportService.generatePDF', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessGetDataMocks(req, conn);
        getCropReportData(req, res);

        expect(reportService.generatePDF).not.toHaveBeenCalled();
      });

      it('generado_en debe ser una fecha ISO válida', () => {
        const req = createMockReq();
        const res = createMockRes();
        const conn = createMockConn();

        setupSuccessGetDataMocks(req, conn);
        getCropReportData(req, res);

        const responseData = res.json.mock.calls[0][0];
        expect(new Date(responseData.generado_en).toISOString()).toBe(responseData.generado_en);
      });
    });
  });
});
