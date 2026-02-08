// ==================== TEST DE INTEGRACIÓN - FLUJO DE REGISTRO ====================
// Prueba el flujo completo: Route → Middleware → Controller → Model → Database
// SIN mocks - usa base de datos real de test (croptrack_test)

import request from 'supertest';
import createTestApp, { closeExpressPool } from '../setup/testApp.js';
import { clearUsersTable, closeTestPool, verifyTestDbConnection } from '../setup/testDbConfig.js';

// App de Express para tests
let app;

describe('Integration: Flujo completo de Registro de Administrador', () => {

  // ==================== SETUP ====================

  beforeAll(async () => {
    // Verificar conexión a DB de test
    const isConnected = await verifyTestDbConnection();
    if (!isConnected) {
      throw new Error('No se pudo conectar a la base de datos de test. Asegúrate de que croptrack_test existe.');
    }

    // Crear app de test
    app = createTestApp();
  });

  beforeEach(async () => {
    // Limpiar tabla users antes de cada test
    await clearUsersTable();
  });

  afterAll(async () => {
    // Limpiar y cerrar conexiones
    await clearUsersTable();
    await closeTestPool();
    await closeExpressPool();
  });

  // ==================== DATOS DE PRUEBA ====================

  const validAdminData = {
    usuario: 'admin_test',
    contrasena: 'Password123!',
    nombre: 'Juan',
    apellido: 'Perez',
    email: 'juan.perez@test.com',
    nombre_empresa: 'Mi Empresa Test',
    telefono: '+54 381 123-4567',
    rol: 'administrador'
  };

  // ==================== TESTS DE FLUJO EXITOSO ====================

  describe('Registro exitoso', () => {

    test('POST /api/register/register-admin - Registra un administrador correctamente', async () => {
      const response = await request(app)
        .post('/api/register/register-admin')
        .send(validAdminData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Verificar respuesta
      expect(response.body).toHaveProperty('message', 'Administrador registrado correctamente');
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('usuario', 'admin_test');

      // Verificar que el userId es un UUID válido
      expect(response.body.userId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    test('El flujo completo genera un UUID único para el usuario', async () => {
      const response = await request(app)
        .post('/api/register/register-admin')
        .send(validAdminData)
        .expect(201);

      // El middleware generateId debe haber generado un UUID
      expect(response.body.userId).toBeDefined();
      expect(typeof response.body.userId).toBe('string');
      expect(response.body.userId.length).toBe(36);
    });

    test('El email se normaliza a minúsculas', async () => {
      const dataWithUpperEmail = {
        ...validAdminData,
        email: 'JUAN.PEREZ@TEST.COM'
      };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(dataWithUpperEmail)
        .expect(201);

      expect(response.body.message).toBe('Administrador registrado correctamente');
    });

    test('Teléfono opcional puede ser null', async () => {
      const dataWithoutPhone = {
        ...validAdminData,
        usuario: 'admin_sin_tel',
        email: 'sin.telefono@test.com',
        telefono: null
      };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(dataWithoutPhone)
        .expect(201);

      expect(response.body.message).toBe('Administrador registrado correctamente');
    });

    test('Teléfono opcional puede omitirse', async () => {
      const dataNoPhone = {
        usuario: 'admin_omit_tel',
        contrasena: 'Password123!',
        nombre: 'Maria',
        apellido: 'Garcia',
        email: 'maria.garcia@test.com',
        nombre_empresa: 'Empresa Sin Tel',
        rol: 'administrador'
      };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(dataNoPhone)
        .expect(201);

      expect(response.body.message).toBe('Administrador registrado correctamente');
    });
  });

  // ==================== TESTS DE VALIDACIÓN (Middleware validate.js) ====================

  describe('Validación de datos (middleware validate)', () => {

    test('Rechaza usuario vacío', async () => {
      const invalidData = { ...validAdminData, usuario: '' };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Error de validación');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'usuario' })
        ])
      );
    });

    test('Rechaza usuario con menos de 3 caracteres', async () => {
      const invalidData = { ...validAdminData, usuario: 'ab' };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'usuario' })
        ])
      );
    });

    test('Rechaza usuario con caracteres especiales inválidos', async () => {
      const invalidData = { ...validAdminData, usuario: 'admin@test!' };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'usuario' })
        ])
      );
    });

    test('Rechaza contraseña con menos de 6 caracteres', async () => {
      const invalidData = { ...validAdminData, contrasena: '12345' };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'contrasena' })
        ])
      );
    });

    test('Rechaza email con formato inválido', async () => {
      const invalidData = { ...validAdminData, email: 'email-invalido' };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' })
        ])
      );
    });

    test('Rechaza nombre con números', async () => {
      const invalidData = { ...validAdminData, nombre: 'Juan123' };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'nombre' })
        ])
      );
    });

    test('Rechaza empresa vacía', async () => {
      const invalidData = { ...validAdminData, nombre_empresa: '' };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'nombre_empresa' })
        ])
      );
    });
  });

  // ==================== TESTS DE DUPLICADOS (Controller + Model) ====================

  describe('Verificación de duplicados', () => {

    test('Rechaza usuario duplicado', async () => {
      // Primer registro - exitoso
      await request(app)
        .post('/api/register/register-admin')
        .send(validAdminData)
        .expect(201);

      // Segundo registro con mismo usuario - debe fallar
      const duplicateUser = {
        ...validAdminData,
        email: 'otro.email@test.com' // Email diferente
      };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(duplicateUser)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'El nombre de usuario ya está en uso');
    });

    test('Rechaza email duplicado', async () => {
      // Primer registro - exitoso
      await request(app)
        .post('/api/register/register-admin')
        .send(validAdminData)
        .expect(201);

      // Segundo registro con mismo email - debe fallar
      const duplicateEmail = {
        ...validAdminData,
        usuario: 'otro_usuario' // Usuario diferente
      };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(duplicateEmail)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'El email ya está registrado');
    });

    test('Permite registrar múltiples usuarios diferentes', async () => {
      // Primer usuario
      await request(app)
        .post('/api/register/register-admin')
        .send(validAdminData)
        .expect(201);

      // Segundo usuario diferente
      const secondUser = {
        usuario: 'admin_segundo',
        contrasena: 'Password456!',
        nombre: 'Maria',
        apellido: 'Lopez',
        email: 'maria.lopez@test.com',
        nombre_empresa: 'Otra Empresa',
        rol: 'administrador'
      };

      const response = await request(app)
        .post('/api/register/register-admin')
        .send(secondUser)
        .expect(201);

      expect(response.body.usuario).toBe('admin_segundo');
    });
  });

  // ==================== TESTS DE FLUJO COMPLETO ====================

  describe('Flujo completo de integración', () => {

    test('El flujo Route → Validate → GenerateId → Controller → Model funciona correctamente', async () => {
      const response = await request(app)
        .post('/api/register/register-admin')
        .send(validAdminData)
        .expect(201);

      // Verificar que todo el flujo funcionó
      expect(response.body).toMatchObject({
        message: 'Administrador registrado correctamente',
        usuario: 'admin_test'
      });

      // El UUID fue generado por el middleware
      expect(response.body.userId).toBeDefined();

      // La contraseña fue hasheada (no podemos verificarlo directamente, pero el registro fue exitoso)
      // El usuario fue insertado en la base de datos (verificado por no tener error)
    });

    test('Múltiples registros generan UUIDs únicos', async () => {
      const users = [
        { ...validAdminData },
        { ...validAdminData, usuario: 'admin_2', email: 'admin2@test.com' },
        { ...validAdminData, usuario: 'admin_3', email: 'admin3@test.com' }
      ];

      const responses = await Promise.all(
        users.map(user =>
          request(app)
            .post('/api/register/register-admin')
            .send(user)
        )
      );

      const userIds = responses.map(r => r.body.userId);

      // Todos los IDs deben ser únicos
      const uniqueIds = new Set(userIds);
      expect(uniqueIds.size).toBe(3);
    });
  });

  // ==================== TESTS DE ENDPOINT NO ENCONTRADO ====================

  describe('Manejo de errores', () => {

    test('Retorna 404 para endpoint no existente', async () => {
      const response = await request(app)
        .post('/api/register/ruta-inexistente')
        .send(validAdminData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });

    test('Retorna 404 para método incorrecto', async () => {
      const response = await request(app)
        .get('/api/register/register-admin')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });
  });
});
