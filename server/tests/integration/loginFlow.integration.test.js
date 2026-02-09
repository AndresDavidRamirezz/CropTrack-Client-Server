// ==================== TEST DE INTEGRACIÓN - FLUJO DE LOGIN ====================
// Prueba el flujo completo: Route → Middleware (validateLogin) → Controller → Model → Database
// SIN mocks - usa base de datos real de test (croptrack_test)

import request from 'supertest';
import bcrypt from 'bcryptjs';
import createTestApp, { closeExpressPool } from '../setup/testApp.js';
import { clearUsersTable, closeTestPool, getTestConnection, verifyTestDbConnection } from '../setup/testDbConfig.js';

// App de Express para tests
let app;

describe('Integration: Flujo completo de Login', () => {

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

  // ==================== HELPER: Crear usuario en DB ====================

  const createTestUser = async (userData) => {
    const connection = await getTestConnection();
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10);

    const userToInsert = {
      id: userData.id || 'test-uuid-' + Date.now(),
      nombre_usuario: userData.usuario,
      password_hash: hashedPassword,
      nombre: userData.nombre || 'Test',
      apellido: userData.apellido || 'User',
      email: userData.email || `${userData.usuario}@test.com`,
      empresa: userData.empresa || 'Test Company',
      telefono: userData.telefono || null,
      rol: userData.rol || 'administrador'
    };

    const sql = `INSERT INTO users (id, nombre_usuario, password_hash, nombre, apellido, email, empresa, telefono, rol)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await connection.query(sql, [
      userToInsert.id,
      userToInsert.nombre_usuario,
      userToInsert.password_hash,
      userToInsert.nombre,
      userToInsert.apellido,
      userToInsert.email,
      userToInsert.empresa,
      userToInsert.telefono,
      userToInsert.rol
    ]);

    connection.release();

    return userToInsert;
  };

  // ==================== DATOS DE PRUEBA ====================

  const validLoginData = {
    usuario: 'admin_test',
    contrasena: 'Password123!',
    rol: 'administrador'
  };

  const testUserData = {
    usuario: 'admin_test',
    contrasena: 'Password123!',
    nombre: 'Juan',
    apellido: 'Perez',
    email: 'juan.perez@test.com',
    empresa: 'Mi Empresa Test',
    rol: 'administrador'
  };

  // ==================== TESTS DE LOGIN EXITOSO ====================

  describe('Login exitoso', () => {

    test('POST /api/auth/login - Login de administrador correctamente', async () => {
      // Crear usuario primero
      await createTestUser(testUserData);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect('Content-Type', /json/)
        .expect(200);

      // Verificar respuesta
      expect(response.body).toHaveProperty('message', 'Login exitoso');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');

      // Verificar datos del usuario
      expect(response.body.user).toMatchObject({
        usuario: 'admin_test',
        nombre: 'Juan',
        apellido: 'Perez',
        email: 'juan.perez@test.com',
        empresa: 'Mi Empresa Test',
        rol: 'administrador'
      });
    });

    test('El token JWT se genera correctamente', async () => {
      await createTestUser(testUserData);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(200);

      // Verificar que el token es un JWT válido (formato: xxx.yyy.zzz)
      expect(response.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    test('Login sin especificar rol funciona correctamente', async () => {
      await createTestUser(testUserData);

      const loginWithoutRole = {
        usuario: 'admin_test',
        contrasena: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginWithoutRole)
        .expect(200);

      expect(response.body.message).toBe('Login exitoso');
      expect(response.body.user.rol).toBe('administrador');
    });

    test('Login de supervisor funciona correctamente', async () => {
      const supervisorData = {
        ...testUserData,
        usuario: 'supervisor_test',
        email: 'supervisor@test.com',
        rol: 'supervisor'
      };
      await createTestUser(supervisorData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'supervisor_test',
          contrasena: 'Password123!',
          rol: 'supervisor'
        })
        .expect(200);

      expect(response.body.user.rol).toBe('supervisor');
    });

    test('Login de trabajador funciona correctamente', async () => {
      const trabajadorData = {
        ...testUserData,
        usuario: 'trabajador_test',
        email: 'trabajador@test.com',
        rol: 'trabajador'
      };
      await createTestUser(trabajadorData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'trabajador_test',
          contrasena: 'Password123!',
          rol: 'trabajador'
        })
        .expect(200);

      expect(response.body.user.rol).toBe('trabajador');
    });
  });

  // ==================== TESTS DE CREDENCIALES INCORRECTAS ====================

  describe('Credenciales incorrectas', () => {

    test('Rechaza contraseña incorrecta', async () => {
      await createTestUser(testUserData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'admin_test',
          contrasena: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Usuario o contraseña incorrectos');
    });

    test('Rechaza usuario inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'usuario_no_existe',
          contrasena: 'Password123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Usuario o contraseña incorrectos');
    });

    test('Rechaza login con rol incorrecto', async () => {
      await createTestUser(testUserData); // Usuario es administrador

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'admin_test',
          contrasena: 'Password123!',
          rol: 'trabajador' // Pero intenta como trabajador
        })
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Este usuario no tiene permisos de trabajador');
    });
  });

  // ==================== TESTS DE VALIDACIÓN (Middleware validateLogin) ====================

  describe('Validación de datos (middleware validateLogin)', () => {

    test('Rechaza usuario vacío', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: '',
          contrasena: 'Password123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Error de validación');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'usuario' })
        ])
      );
    });

    test('Rechaza usuario con menos de 3 caracteres', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'ab',
          contrasena: 'Password123!'
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'usuario' })
        ])
      );
    });

    test('Rechaza contraseña vacía', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'admin_test',
          contrasena: ''
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'contrasena' })
        ])
      );
    });

    test('Rechaza contraseña con menos de 6 caracteres', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'admin_test',
          contrasena: '12345'
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'contrasena' })
        ])
      );
    });

    test('Rechaza rol inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'admin_test',
          contrasena: 'Password123!',
          rol: 'rol_invalido'
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'rol' })
        ])
      );
    });

    test('Acepta login sin campo rol (opcional)', async () => {
      await createTestUser(testUserData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'admin_test',
          contrasena: 'Password123!'
        })
        .expect(200);

      expect(response.body.message).toBe('Login exitoso');
    });
  });

  // ==================== TESTS DE FLUJO COMPLETO ====================

  describe('Flujo completo de integración', () => {

    test('El flujo Route → ValidateLogin → Controller → Model funciona correctamente', async () => {
      // Crear usuario
      const createdUser = await createTestUser(testUserData);

      // Login
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(200);

      // Verificar respuesta completa
      expect(response.body).toMatchObject({
        message: 'Login exitoso'
      });

      // Verificar que el token existe y es válido
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');

      // Verificar datos del usuario
      expect(response.body.user.id).toBe(createdUser.id);
      expect(response.body.user.usuario).toBe(createdUser.nombre_usuario);
    });

    test('Múltiples usuarios pueden hacer login', async () => {
      // Crear varios usuarios
      const users = [
        { ...testUserData },
        { ...testUserData, usuario: 'admin_2', email: 'admin2@test.com' },
        { ...testUserData, usuario: 'admin_3', email: 'admin3@test.com' }
      ];

      for (const user of users) {
        await createTestUser(user);
      }

      // Todos pueden hacer login
      const responses = await Promise.all(
        users.map(user =>
          request(app)
            .post('/api/auth/login')
            .send({
              usuario: user.usuario,
              contrasena: user.contrasena
            })
        )
      );

      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.user.usuario).toBe(users[index].usuario);
      });
    });

    test('El último acceso se actualiza después del login', async () => {
      await createTestUser(testUserData);

      // Primer login
      await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(200);

      // Pequeña espera para que el update asíncrono se complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verificar en la base de datos que ultimo_acceso fue actualizado
      const connection = await getTestConnection();
      const [rows] = await connection.query(
        'SELECT ultimo_acceso FROM users WHERE nombre_usuario = ?',
        ['admin_test']
      );
      connection.release();

      expect(rows[0].ultimo_acceso).not.toBeNull();
    });
  });

  // ==================== TESTS DE ENDPOINT ====================

  describe('Manejo de errores de endpoint', () => {

    test('Retorna 404 para endpoint no existente', async () => {
      const response = await request(app)
        .post('/api/auth/ruta-inexistente')
        .send(validLoginData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });

    test('Retorna 404 para método incorrecto (GET en lugar de POST)', async () => {
      const response = await request(app)
        .get('/api/auth/login')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });
  });
});
