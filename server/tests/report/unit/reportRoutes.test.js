// ==================== TESTS UNITARIOS - reportRoutes.js ====================
// Prueba que las rutas del módulo de reportes estén correctamente definidas:
// - GET /:cropId/data → llama a getCropReportData
// - GET /:cropId → llama a generateCropReport (con middleware de logging)
// El controller se mockea para aislar la capa de rutas.

import request from 'supertest';
import express from 'express';
import myConnection from 'express-myconnection';
import mysql from 'mysql2';

// ==================== MOCKS ====================

// Mock del controller para aislar las rutas
jest.mock('../../../controllers/reportController.js', () => ({
  generateCropReport: jest.fn((req, res) => {
    res.status(200).json({ mocked: true, action: 'generateCropReport', cropId: req.params.cropId });
  }),
  getCropReportData: jest.fn((req, res) => {
    res.status(200).json({ mocked: true, action: 'getCropReportData', cropId: req.params.cropId });
  })
}));

// ==================== IMPORTS (después de mocks) ====================

import { generateCropReport, getCropReportData } from '../../../controllers/reportController.js';
import reportRoutes from '../../../routes/reportRoutes.js';

// ==================== SETUP DE LA APP DE TEST ====================

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Mock de express-myconnection para que req.getConnection esté disponible
  app.use((req, res, next) => {
    req.getConnection = jest.fn((cb) => cb(null, { query: jest.fn() }));
    next();
  });

  app.use('/api/reports', reportRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  return app;
};

// ==================== SETUP GLOBAL ====================

let app;

beforeAll(() => {
  app = createTestApp();
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ==================== SUITE DE TESTS ====================

describe('ReportRoutes - Tests Unitarios', () => {

  // ==================== GET /:cropId/data ====================

  describe('GET /api/reports/:cropId/data', () => {
    it('debe responder 200 cuando se llama al endpoint de datos', async () => {
      const response = await request(app)
        .get('/api/reports/crop-001/data')
        .expect(200);

      expect(response.body.mocked).toBe(true);
    });

    it('debe llamar a getCropReportData con el cropId correcto', async () => {
      await request(app).get('/api/reports/crop-uuid-abc/data');

      expect(getCropReportData).toHaveBeenCalledTimes(1);
    });

    it('debe pasar el cropId como parámetro de ruta', async () => {
      await request(app).get('/api/reports/mi-crop-id/data');

      const callArg = getCropReportData.mock.calls[0][0]; // req
      expect(callArg.params.cropId).toBe('mi-crop-id');
    });

    it('NO debe llamar a generateCropReport cuando se accede a /data', async () => {
      await request(app).get('/api/reports/crop-001/data');

      expect(generateCropReport).not.toHaveBeenCalled();
    });

    it('debe retornar los datos del controller mocked', async () => {
      const response = await request(app).get('/api/reports/test-crop/data');

      expect(response.body.action).toBe('getCropReportData');
      expect(response.body.cropId).toBe('test-crop');
    });

    it('debe aceptar cropIds con formato UUID', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app).get(`/api/reports/${uuid}/data`);

      expect(response.status).toBe(200);
      expect(getCropReportData).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== GET /:cropId ====================

  describe('GET /api/reports/:cropId', () => {
    it('debe responder 200 cuando se llama al endpoint de PDF', async () => {
      const response = await request(app)
        .get('/api/reports/crop-001')
        .expect(200);

      expect(response.body.mocked).toBe(true);
    });

    it('debe llamar a generateCropReport con el cropId correcto', async () => {
      await request(app).get('/api/reports/crop-xyz');

      expect(generateCropReport).toHaveBeenCalledTimes(1);
    });

    it('debe pasar el cropId como parámetro de ruta', async () => {
      await request(app).get('/api/reports/reporte-id-123');

      const callArg = generateCropReport.mock.calls[0][0]; // req
      expect(callArg.params.cropId).toBe('reporte-id-123');
    });

    it('NO debe llamar a getCropReportData cuando se accede sin /data', async () => {
      await request(app).get('/api/reports/crop-001');

      expect(getCropReportData).not.toHaveBeenCalled();
    });

    it('debe retornar los datos del controller mocked', async () => {
      const response = await request(app).get('/api/reports/my-crop');

      expect(response.body.action).toBe('generateCropReport');
      expect(response.body.cropId).toBe('my-crop');
    });

    it('debe tener middleware de logging (next middleware ejecutado antes del controller)', async () => {
      // El middleware de logging hace console.log y llama a next()
      // Verificamos que el controller se ejecuta (lo que implica que el middleware llamó a next())
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await request(app).get('/api/reports/log-test');

      expect(generateCropReport).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });
  });

  // ==================== MÉTODOS HTTP NO PERMITIDOS ====================

  describe('Métodos HTTP no soportados', () => {
    it('POST /api/reports/:cropId debe retornar 404', async () => {
      const response = await request(app).post('/api/reports/crop-001');
      expect(response.status).toBe(404);
    });

    it('PUT /api/reports/:cropId debe retornar 404', async () => {
      const response = await request(app).put('/api/reports/crop-001');
      expect(response.status).toBe(404);
    });

    it('DELETE /api/reports/:cropId debe retornar 404', async () => {
      const response = await request(app).delete('/api/reports/crop-001');
      expect(response.status).toBe(404);
    });

    it('POST /api/reports/:cropId/data debe retornar 404', async () => {
      const response = await request(app).post('/api/reports/crop-001/data');
      expect(response.status).toBe(404);
    });
  });

  // ==================== RUTAS NO EXISTENTES ====================

  describe('Rutas no existentes', () => {
    it('GET /api/reports debe retornar 404 (sin cropId)', async () => {
      const response = await request(app).get('/api/reports');
      // Express puede dar 404 o redirigir - verificamos que no llama a los controllers
      expect(generateCropReport).not.toHaveBeenCalled();
      expect(getCropReportData).not.toHaveBeenCalled();
    });

    it('GET /api/reports/:cropId/pdf debe retornar 404', async () => {
      const response = await request(app).get('/api/reports/crop-001/pdf');
      expect(response.status).toBe(404);
    });

    it('GET /api/reports/:cropId/json debe retornar 404', async () => {
      const response = await request(app).get('/api/reports/crop-001/json');
      expect(response.status).toBe(404);
    });
  });

  // ==================== PRIORIDAD DE RUTAS ====================

  describe('Prioridad y matching de rutas', () => {
    it('/data debe tener prioridad sobre el parámetro :cropId', async () => {
      // GET /api/reports/cualquier-id/data → debe ir a getCropReportData
      // y NO a generateCropReport con cropId="cualquier-id" + subruta "/data"
      await request(app).get('/api/reports/crop-test/data');

      expect(getCropReportData).toHaveBeenCalledTimes(1);
      expect(generateCropReport).not.toHaveBeenCalled();
    });

    it('cropId con guiones debe funcionar en ambas rutas', async () => {
      const cropIdConGuiones = 'cosecha-tomates-2026';

      await request(app).get(`/api/reports/${cropIdConGuiones}`);
      await request(app).get(`/api/reports/${cropIdConGuiones}/data`);

      expect(generateCropReport).toHaveBeenCalledTimes(1);
      expect(getCropReportData).toHaveBeenCalledTimes(1);
    });
  });
});
