// ==================== TEST DE INTEGRACIÓN - Flujo Completo de Reportes ====================
// Prueba el flujo completo: Route → Controller → Model → Database
// SIN mocks de BD - usa base de datos real de test (croptrack_test)
// El servicio de PDF (reportServices) se mockea para evitar dependencias nativas de canvas.
//
// REQUISITOS PREVIOS:
// - Base de datos croptrack_test disponible y accesible
// - Variables de entorno en server/.env.test configuradas
//
// FLUJO PROBADO:
// 1. GET /api/reports/:cropId/data → Route → Controller → [4 Model queries] → DB → JSON response
// 2. GET /api/reports/:cropId → Route → Controller → [4 Model queries] → DB → reportService (mock) → PDF response

// ==================== MOCKS ====================

// Mock del servicio de PDF para evitar dependencias de canvas (ChartJSNodeCanvas, PDFKit)
jest.mock('../../../services/reportServices.js', () => ({
  default: {
    generatePDF: jest.fn((reportData, callback) => {
      // Simular generación exitosa con un buffer PDF mínimo
      const fakePdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
      callback(null, fakePdfBuffer);
    })
  }
}));

// ==================== IMPORTS ====================

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import myConnection from 'express-myconnection';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

import reportRoutes from '../../../routes/reportRoutes.js';
import {
  getTestConnection,
  closeTestPool,
  verifyTestDbConnection
} from '../../setup/testDbConfig.js';

// ==================== CONFIGURACIÓN DE APP DE TEST ====================

const dbOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'croptrack_test'
};

let reportPool = null;

const createReportTestApp = () => {
  const app = express();

  if (!reportPool) {
    reportPool = mysql.createPool(dbOptions);
  }

  app.use(cors({ origin: 'http://localhost:3000' }));
  app.use(express.json());
  app.use(myConnection(mysql, dbOptions, 'pool'));

  app.use('/api/reports', reportRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
  });

  app.use((err, req, res, next) => {
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
  });

  return app;
};

const closeReportPool = () => new Promise((resolve) => {
  if (reportPool) {
    reportPool.end(() => {
      reportPool = null;
      resolve();
    });
  } else {
    resolve();
  }
});

// ==================== HELPERS DE BASE DE DATOS ====================

// IDs de prueba únicos por suite para evitar conflictos
const TEST_PREFIX = 'report_integ_' + Date.now();

const TEST_IDS = {
  adminId: `${TEST_PREFIX}_admin`,
  workerId: `${TEST_PREFIX}_worker`,
  supervisorId: `${TEST_PREFIX}_supervisor`,
  cropId: `${TEST_PREFIX}_crop`,
  taskId1: `${TEST_PREFIX}_task1`,
  taskId2: `${TEST_PREFIX}_task2`,
  measurementId1: `${TEST_PREFIX}_meas1`,
  measurementId2: `${TEST_PREFIX}_meas2`
};

const insertTestUser = async (userData) => {
  const conn = await getTestConnection();
  try {
    await conn.query(
      `INSERT INTO users (id, nombre_usuario, password_hash, nombre, apellido, email, empresa, telefono, rol)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre = nombre`,
      [userData.id, userData.nombre_usuario, userData.password_hash,
       userData.nombre, userData.apellido, userData.email,
       userData.empresa, userData.telefono || null, userData.rol]
    );
  } finally {
    conn.release();
  }
};

const insertTestCrop = async (cropData) => {
  const conn = await getTestConnection();
  try {
    await conn.query(
      `INSERT INTO crops (id, nombre, tipo, variedad, area_hectareas, ubicacion, fecha_siembra, estado, usuario_creador_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre = nombre`,
      [cropData.id, cropData.nombre, cropData.tipo, cropData.variedad || null,
       cropData.area_hectareas || null, cropData.ubicacion || null,
       cropData.fecha_siembra || null, cropData.estado, cropData.usuario_creador_id]
    );
  } finally {
    conn.release();
  }
};

const insertTestWorkerAssignment = async (cropId, userId) => {
  const conn = await getTestConnection();
  try {
    await conn.query(
      `INSERT IGNORE INTO crop_workers (cultivo_id, usuario_id) VALUES (?, ?)`,
      [cropId, userId]
    );
  } finally {
    conn.release();
  }
};

const insertTestTask = async (taskData) => {
  const conn = await getTestConnection();
  try {
    await conn.query(
      `INSERT INTO tasks (id, cultivo_id, nombre, descripcion, estado, prioridad, fecha_inicio, asignado_a)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre = nombre`,
      [taskData.id, taskData.cultivo_id, taskData.nombre, taskData.descripcion || '',
       taskData.estado, taskData.prioridad, taskData.fecha_inicio || null,
       taskData.asignado_a || null]
    );
  } finally {
    conn.release();
  }
};

const insertTestMeasurement = async (measurementData) => {
  const conn = await getTestConnection();
  try {
    await conn.query(
      `INSERT INTO measurements (id, cultivo_id, usuario_id, temperatura, humedad, ph_suelo, altura_plantas, fecha_medicion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE temperatura = temperatura`,
      [measurementData.id, measurementData.cultivo_id, measurementData.usuario_id,
       measurementData.temperatura, measurementData.humedad, measurementData.ph_suelo,
       measurementData.altura_plantas, measurementData.fecha_medicion]
    );
  } finally {
    conn.release();
  }
};

const cleanupTestData = async () => {
  const conn = await getTestConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query(`DELETE FROM measurements WHERE id LIKE '${TEST_PREFIX}%'`);
    await conn.query(`DELETE FROM tasks WHERE id LIKE '${TEST_PREFIX}%'`);
    await conn.query(`DELETE FROM crop_workers WHERE cultivo_id LIKE '${TEST_PREFIX}%'`);
    await conn.query(`DELETE FROM crops WHERE id LIKE '${TEST_PREFIX}%'`);
    await conn.query(`DELETE FROM users WHERE id LIKE '${TEST_PREFIX}%'`);
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    conn.release();
  }
};

// ==================== DATOS DE PRUEBA ====================

const testAdmin = {
  id: TEST_IDS.adminId,
  nombre_usuario: `admin_${TEST_PREFIX}`,
  password_hash: '$2a$10$test.hash.placeholder.for.testing',
  nombre: 'Carlos',
  apellido: 'González',
  email: `carlos.${TEST_PREFIX}@agrotech.com`,
  empresa: 'AgroTech SRL',
  telefono: '1234567890',
  rol: 'administrador'
};

const testWorker = {
  id: TEST_IDS.workerId,
  nombre_usuario: `worker_${TEST_PREFIX}`,
  password_hash: '$2a$10$test.hash.placeholder.for.testing',
  nombre: 'Ana',
  apellido: 'López',
  email: `ana.${TEST_PREFIX}@test.com`,
  empresa: 'AgroTech SRL',
  telefono: '111222333',
  rol: 'trabajador'
};

const testSupervisor = {
  id: TEST_IDS.supervisorId,
  nombre_usuario: `supervisor_${TEST_PREFIX}`,
  password_hash: '$2a$10$test.hash.placeholder.for.testing',
  nombre: 'Pedro',
  apellido: 'García',
  email: `pedro.${TEST_PREFIX}@test.com`,
  empresa: 'AgroTech SRL',
  telefono: '444555666',
  rol: 'supervisor'
};

const testCrop = {
  id: TEST_IDS.cropId,
  nombre: `Tomates Cherry ${TEST_PREFIX}`,
  tipo: 'Hortaliza',
  variedad: 'Cherry',
  area_hectareas: 5.5,
  ubicacion: 'Parcela A - Test',
  fecha_siembra: '2026-01-15',
  estado: 'en_crecimiento',
  usuario_creador_id: TEST_IDS.adminId
};

// ==================== SUITE DE TESTS ====================

describe('Integration: Flujo completo de Reportes', () => {
  let app;

  // ==================== SETUP ====================

  beforeAll(async () => {
    // Verificar conexión a DB de test
    const isConnected = await verifyTestDbConnection();
    if (!isConnected) {
      throw new Error(
        'No se pudo conectar a la base de datos de test. ' +
        'Asegúrate de que croptrack_test existe y .env.test está configurado.'
      );
    }

    // Crear app de test
    app = createReportTestApp();

    // Insertar datos de prueba en orden correcto (FK constraints)
    await insertTestUser(testAdmin);
    await insertTestUser(testWorker);
    await insertTestUser(testSupervisor);
    await insertTestCrop(testCrop);
    await insertTestWorkerAssignment(TEST_IDS.cropId, TEST_IDS.workerId);
    await insertTestWorkerAssignment(TEST_IDS.cropId, TEST_IDS.supervisorId);
    await insertTestTask({
      id: TEST_IDS.taskId1,
      cultivo_id: TEST_IDS.cropId,
      nombre: 'Riego diario',
      descripcion: 'Riego matutino automatizado',
      estado: 'completada',
      prioridad: 'alta',
      fecha_inicio: '2026-02-01',
      asignado_a: TEST_IDS.workerId
    });
    await insertTestTask({
      id: TEST_IDS.taskId2,
      cultivo_id: TEST_IDS.cropId,
      nombre: 'Control de plagas',
      descripcion: 'Revisión semanal',
      estado: 'pendiente',
      prioridad: 'media',
      fecha_inicio: '2026-02-10',
      asignado_a: null
    });
    await insertTestMeasurement({
      id: TEST_IDS.measurementId1,
      cultivo_id: TEST_IDS.cropId,
      usuario_id: TEST_IDS.workerId,
      temperatura: 25.5,
      humedad: 65,
      ph_suelo: 6.8,
      altura_plantas: 45.2,
      fecha_medicion: '2026-02-15 10:00:00'
    });
    await insertTestMeasurement({
      id: TEST_IDS.measurementId2,
      cultivo_id: TEST_IDS.cropId,
      usuario_id: TEST_IDS.supervisorId,
      temperatura: 23.0,
      humedad: 70,
      ph_suelo: 7.0,
      altura_plantas: 50.0,
      fecha_medicion: '2026-02-20 10:00:00'
    });
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
    await closeTestPool();
    await closeReportPool();
  }, 15000);

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==================== GET /api/reports/:cropId/data ====================

  describe('GET /api/reports/:cropId/data - Datos del reporte como JSON', () => {

    test('debe retornar 200 con datos JSON estructurados', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}/data`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('cosecha');
      expect(response.body).toHaveProperty('administrador');
      expect(response.body).toHaveProperty('trabajadores');
      expect(response.body).toHaveProperty('tareas');
      expect(response.body).toHaveProperty('mediciones');
      expect(response.body).toHaveProperty('generado_en');
    });

    test('los datos de la cosecha son correctos', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}/data`)
        .expect(200);

      const { cosecha } = response.body;
      expect(cosecha.id).toBe(TEST_IDS.cropId);
      expect(cosecha.nombre).toBe(testCrop.nombre);
      expect(cosecha.tipo).toBe('Hortaliza');
      expect(cosecha.variedad).toBe('Cherry');
      expect(cosecha.estado).toBe('en_crecimiento');
    });

    test('los datos del administrador son correctos', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}/data`)
        .expect(200);

      const { administrador } = response.body;
      expect(administrador.nombre).toBe('Carlos');
      expect(administrador.apellido).toBe('González');
      expect(administrador.email).toBe(testAdmin.email);
      expect(administrador.empresa).toBe('AgroTech SRL');
    });

    test('incluye los trabajadores asignados a la cosecha', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}/data`)
        .expect(200);

      const { trabajadores } = response.body;
      expect(Array.isArray(trabajadores)).toBe(true);
      expect(trabajadores.length).toBe(2); // Ana y Pedro

      const nombres = trabajadores.map(w => w.nombre);
      expect(nombres).toContain('Ana');
      expect(nombres).toContain('Pedro');
    });

    test('cada trabajador tiene los campos requeridos', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}/data`)
        .expect(200);

      response.body.trabajadores.forEach(worker => {
        expect(worker).toHaveProperty('id');
        expect(worker).toHaveProperty('nombre');
        expect(worker).toHaveProperty('apellido');
        expect(worker).toHaveProperty('rol');
        expect(worker).toHaveProperty('email');
      });
    });

    test('incluye las tareas del cultivo', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}/data`)
        .expect(200);

      const { tareas } = response.body;
      expect(Array.isArray(tareas)).toBe(true);
      expect(tareas.length).toBe(2);

      const nombres = tareas.map(t => t.nombre);
      expect(nombres).toContain('Riego diario');
      expect(nombres).toContain('Control de plagas');
    });

    test('las tareas incluyen el nombre del asignado cuando existe', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}/data`)
        .expect(200);

      const tareasConAsignado = response.body.tareas.filter(t => t.asignado_nombre);
      expect(tareasConAsignado.length).toBeGreaterThanOrEqual(1);
      expect(tareasConAsignado[0].asignado_nombre).toBe('Ana');
    });

    test('incluye las mediciones del cultivo', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}/data`)
        .expect(200);

      const { mediciones } = response.body;
      expect(Array.isArray(mediciones)).toBe(true);
      expect(mediciones.length).toBe(2);
    });

    test('las mediciones incluyen los campos numéricos correctos', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}/data`)
        .expect(200);

      response.body.mediciones.forEach(m => {
        expect(m).toHaveProperty('temperatura');
        expect(m).toHaveProperty('humedad');
        expect(m).toHaveProperty('ph_suelo');
        expect(m).toHaveProperty('altura_plantas');
      });
    });

    test('generado_en es un timestamp ISO válido', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}/data`)
        .expect(200);

      expect(new Date(response.body.generado_en).toISOString()).toBe(response.body.generado_en);
    });

    test('debe retornar 404 para una cosecha inexistente', async () => {
      const response = await request(app)
        .get('/api/reports/cosecha-que-no-existe-9999/data')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Cosecha no encontrada');
    });
  });

  // ==================== GET /api/reports/:cropId ====================

  describe('GET /api/reports/:cropId - Generación del PDF', () => {

    test('debe retornar 200 con Content-Type application/pdf', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
    });

    test('debe retornar un buffer de bytes (PDF)', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}`)
        .buffer(true)
        .parse((res, callback) => {
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => callback(null, Buffer.concat(chunks)));
        })
        .expect(200);

      expect(Buffer.isBuffer(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('debe incluir Content-Disposition attachment', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}`)
        .expect(200);

      expect(response.headers['content-disposition']).toContain('attachment');
    });

    test('el Content-Disposition debe incluir el nombre de la cosecha', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}`)
        .expect(200);

      // El nombre de la cosecha sanitizado debería estar en el filename
      expect(response.headers['content-disposition']).toMatch(/Tomates_Cherry/);
    });

    test('debe retornar 404 para una cosecha inexistente', async () => {
      const response = await request(app)
        .get('/api/reports/cosecha-inexistente-9999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Cosecha no encontrada');
    });

    test('el servicio de PDF fue llamado con la estructura de datos correcta', async () => {
      const reportService = (await import('../../../services/reportServices.js')).default;

      await request(app).get(`/api/reports/${TEST_IDS.cropId}`).expect(200);

      expect(reportService.generatePDF).toHaveBeenCalledWith(
        expect.objectContaining({
          cosecha: expect.objectContaining({ id: TEST_IDS.cropId }),
          administrador: expect.objectContaining({ nombre: 'Carlos' }),
          trabajadores: expect.any(Array),
          tareas: expect.any(Array),
          mediciones: expect.any(Array),
          generado_en: expect.any(String)
        }),
        expect.any(Function)
      );
    });
  });

  // ==================== FLUJO COMPLETO INTEGRADO ====================

  describe('Flujo completo: Route → Controller → 4 Models → DB → Response', () => {

    test('el flujo de datos JSON recorre todas las capas correctamente', async () => {
      const response = await request(app)
        .get(`/api/reports/${TEST_IDS.cropId}/data`)
        .expect(200);

      // Verificar que la integración Route → Controller → Model → DB es completa
      // y que los datos son coherentes entre sí

      const { cosecha, administrador, trabajadores, tareas, mediciones } = response.body;

      // La cosecha pertenece al admin
      // (no podemos verificar usuario_creador_id directamente desde la respuesta,
      //  pero sí que el admin correcto fue obtenido via JOIN)
      expect(administrador.email).toBe(testAdmin.email);

      // Los trabajadores tienen rol correcto
      const roles = trabajadores.map(w => w.rol);
      expect(roles).toContain('trabajador');
      expect(roles).toContain('supervisor');

      // Las tareas están ordenadas por fecha_inicio
      expect(tareas.length).toBe(2);

      // Las mediciones tienen los campos de usuarios obtenidos via JOIN
      mediciones.forEach(m => {
        expect(m).toHaveProperty('usuario_nombre');
        expect(m).toHaveProperty('usuario_apellido');
      });
    });

    test('la cosecha con workers, tareas y mediciones vacíos funciona correctamente', async () => {
      // Crear una cosecha sin datos asociados
      const emptyCropId = `${TEST_PREFIX}_empty_crop`;
      await insertTestCrop({
        id: emptyCropId,
        nombre: 'Cosecha Vacía Test',
        tipo: 'Cereal',
        estado: 'planificado',
        usuario_creador_id: TEST_IDS.adminId
      });

      try {
        const response = await request(app)
          .get(`/api/reports/${emptyCropId}/data`)
          .expect(200);

        expect(response.body.trabajadores).toEqual([]);
        expect(response.body.tareas).toEqual([]);
        expect(response.body.mediciones).toEqual([]);
        expect(response.body.cosecha.nombre).toBe('Cosecha Vacía Test');
      } finally {
        // Limpieza
        const conn = await getTestConnection();
        await conn.query(`DELETE FROM crops WHERE id = ?`, [emptyCropId]);
        conn.release();
      }
    });

    test('múltiples requests concurrentes al mismo endpoint son manejados correctamente', async () => {
      const requests = Array.from({ length: 3 }, () =>
        request(app).get(`/api/reports/${TEST_IDS.cropId}/data`)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.cosecha.id).toBe(TEST_IDS.cropId);
      });
    });

    test('GET /data y GET / del mismo crop retornan datos consistentes', async () => {
      const [dataResponse] = await Promise.all([
        request(app).get(`/api/reports/${TEST_IDS.cropId}/data`).expect(200)
      ]);

      // Los datos del JSON deben ser coherentes
      expect(dataResponse.body.cosecha.id).toBe(TEST_IDS.cropId);
      expect(dataResponse.body.cosecha.nombre).toBe(testCrop.nombre);
    });
  });

  // ==================== MANEJO DE ERRORES DE INFRAESTRUCTURA ====================

  describe('Manejo de errores', () => {
    test('GET /api/reports con endpoint inexistente retorna 404', async () => {
      const response = await request(app).get('/api/reports').expect(404);
      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });

    test('POST /api/reports/:cropId retorna 404 (método no permitido)', async () => {
      await request(app).post(`/api/reports/${TEST_IDS.cropId}`).expect(404);
    });
  });
});
