// tests/unit/controllers/registerController.test.js
import { createAdmin } from '../../../controllers/registerController.js';
import UserModel from '../../../models/userModel.js';
import bcrypt from 'bcryptjs';

// ==================== MOCKS ====================
jest.mock('../../../models/userModel.js');
jest.mock('bcryptjs');

describe('RegisterController - Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockConn;

  beforeEach(() => {
    // Mock request
    mockReq = {
      body: {
        id: 'admin-123',
        usuario: 'adminuser',
        contrasena: 'Admin123!',
        nombre: 'Admin',
        apellido: 'User',
        email: 'admin@example.com',
        nombre_empresa: 'Test Company',
        telefono: '1234567890',
        rol: 'administrador'
      },
      getConnection: jest.fn()
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock connection
    mockConn = {
      query: jest.fn()
    };

    // Limpiar mocks
    jest.clearAllMocks();
  });

  // ==================== VALIDACIÓN DE CAMPOS OBLIGATORIOS ====================
  describe('Validación de campos obligatorios', () => {
    it('debería retornar 400 si falta el nombre', async () => {
      delete mockReq.body.nombre;

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Todos los campos obligatorios deben estar completos'
      });
    });

    it('debería retornar 400 si falta el apellido', async () => {
      delete mockReq.body.apellido;

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Todos los campos obligatorios deben estar completos'
      });
    });

    it('debería retornar 400 si falta el usuario', async () => {
      delete mockReq.body.usuario;

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Todos los campos obligatorios deben estar completos'
      });
    });

    it('debería retornar 400 si falta el email', async () => {
      delete mockReq.body.email;

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Todos los campos obligatorios deben estar completos'
      });
    });

    it('debería retornar 400 si falta la contraseña', async () => {
      delete mockReq.body.contrasena;

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Todos los campos obligatorios deben estar completos'
      });
    });

    it('debería retornar 400 si falta el rol', async () => {
      delete mockReq.body.rol;

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Todos los campos obligatorios deben estar completos'
      });
    });

    it('debería retornar 400 si falta nombre_empresa', async () => {
      delete mockReq.body.nombre_empresa;

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Todos los campos obligatorios deben estar completos'
      });
    });

    it('debería permitir registro sin teléfono', async () => {
      delete mockReq.body.telefono;

      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, []); // Usuario no existe
      });

      UserModel.findByEmail.mockImplementation((conn, email, callback) => {
        callback(null, []); // Email no existe
      });

      bcrypt.hash.mockResolvedValue('$2a$10$hashedpassword');

      UserModel.createAdmin.mockImplementation((conn, data, callback) => {
        callback(null, { insertId: 1 });
      });

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  // ==================== ERRORES DE CONEXIÓN ====================
  describe('Errores de conexión a BD', () => {
    it('debería retornar 500 si hay error de conexión a BD', async () => {
      const dbError = new Error('Connection failed');
      mockReq.getConnection.mockImplementation((callback) => {
        callback(dbError, null);
      });

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error al conectar con la base de datos',
        error: dbError.message
      });
    });
  });

  // ==================== VERIFICACIÓN DE USUARIO EXISTENTE ====================
  describe('Verificación de usuario existente', () => {
    beforeEach(() => {
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });
    });

    it('debería retornar 500 si hay error al verificar usuario', async () => {
      const searchError = new Error('Search failed');
      
      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(searchError, null);
      });

      await createAdmin(mockReq, mockRes);

      expect(UserModel.findByUsername).toHaveBeenCalledWith(
        mockConn,
        'adminuser',
        expect.any(Function)
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error al verificar usuario existente',
        error: searchError.message
      });
    });

    it('debería retornar 400 si el usuario ya existe', async () => {
      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, [{ id: 'existing-user' }]); // Usuario existe
      });

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'El nombre de usuario ya está en uso'
      });
    });
  });

  // ==================== VERIFICACIÓN DE EMAIL EXISTENTE ====================
  describe('Verificación de email existente', () => {
    beforeEach(() => {
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, []); // Usuario no existe
      });
    });

    it('debería retornar 500 si hay error al verificar email', async () => {
      const emailError = new Error('Email search failed');
      
      UserModel.findByEmail.mockImplementation((conn, email, callback) => {
        callback(emailError, null);
      });

      await createAdmin(mockReq, mockRes);

      expect(UserModel.findByEmail).toHaveBeenCalledWith(
        mockConn,
        'admin@example.com',
        expect.any(Function)
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error al verificar email existente',
        error: emailError.message
      });
    });

    it('debería retornar 400 si el email ya existe', async () => {
      UserModel.findByEmail.mockImplementation((conn, email, callback) => {
        callback(null, [{ id: 'existing-email' }]); // Email existe
      });

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'El email ya está registrado'
      });
    });
  });

  // ==================== ENCRIPTACIÓN DE CONTRASEÑA ====================
  describe('Encriptación de contraseña', () => {
    beforeEach(() => {
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, []); // Usuario no existe
      });

      UserModel.findByEmail.mockImplementation((conn, email, callback) => {
        callback(null, []); // Email no existe
      });
    });

    it('debería retornar 500 si bcrypt.hash falla', async () => {
      const hashError = new Error('Hash failed');
      bcrypt.hash.mockRejectedValue(hashError);

      await createAdmin(mockReq, mockRes);

      expect(bcrypt.hash).toHaveBeenCalledWith('Admin123!', 10);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error interno del servidor al procesar la contraseña',
        error: hashError.message
      });
    });

    it('debería usar saltRounds = 10 para encriptar', async () => {
      bcrypt.hash.mockResolvedValue('$2a$10$hashedpassword');
      
      UserModel.createAdmin.mockImplementation((conn, data, callback) => {
        callback(null, { insertId: 1 });
      });

      await createAdmin(mockReq, mockRes);

      expect(bcrypt.hash).toHaveBeenCalledWith('Admin123!', 10);
    });
  });

  // ==================== CREACIÓN DE ADMINISTRADOR ====================
  describe('Creación de administrador', () => {
    beforeEach(() => {
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, []);
      });

      UserModel.findByEmail.mockImplementation((conn, email, callback) => {
        callback(null, []);
      });

      bcrypt.hash.mockResolvedValue('$2a$10$hashedpassword');
    });

    it('debería retornar 500 si hay error al insertar en BD', async () => {
      const insertError = new Error('Insert failed');
      
      UserModel.createAdmin.mockImplementation((conn, data, callback) => {
        callback(insertError, null);
      });

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error al crear el administrador',
        error: insertError.message
      });
    });

    it('debería crear administrador con datos correctos mapeados', async () => {
      UserModel.createAdmin.mockImplementation((conn, data, callback) => {
        callback(null, { insertId: 1 });
      });

      await createAdmin(mockReq, mockRes);

      expect(UserModel.createAdmin).toHaveBeenCalledWith(
        mockConn,
        {
          id: 'admin-123',
          nombre_usuario: 'adminuser',
          password_hash: '$2a$10$hashedpassword',
          nombre: 'Admin',
          apellido: 'User',
          email: 'admin@example.com',
          empresa: 'Test Company',
          telefono: '1234567890',
          rol: 'administrador'
        },
        expect.any(Function)
      );
    });

    it('debería convertir email a minúsculas', async () => {
      mockReq.body.email = 'ADMIN@EXAMPLE.COM';

      UserModel.createAdmin.mockImplementation((conn, data, callback) => {
        callback(null, { insertId: 1 });
      });

      await createAdmin(mockReq, mockRes);

      expect(UserModel.createAdmin).toHaveBeenCalledWith(
        mockConn,
        expect.objectContaining({
          email: 'admin@example.com'
        }),
        expect.any(Function)
      );
    });

    it('debería retornar 201 con userId y usuario en respuesta exitosa', async () => {
      UserModel.createAdmin.mockImplementation((conn, data, callback) => {
        callback(null, { insertId: 1 });
      });

      await createAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Administrador registrado correctamente',
        userId: 'admin-123',
        usuario: 'adminuser'
      });
    });

    it('debería usar telefono null si no se proporciona', async () => {
      delete mockReq.body.telefono;

      UserModel.createAdmin.mockImplementation((conn, data, callback) => {
        callback(null, { insertId: 1 });
      });

      await createAdmin(mockReq, mockRes);

      expect(UserModel.createAdmin).toHaveBeenCalledWith(
        mockConn,
        expect.objectContaining({
          telefono: null
        }),
        expect.any(Function)
      );
    });

    it('debería usar rol por defecto "administrador" si no se proporciona', async () => {
      mockReq.body.rol = undefined;

      // Agregar rol para pasar validación inicial
      mockReq.body.rol = 'administrador';

      UserModel.createAdmin.mockImplementation((conn, data, callback) => {
        callback(null, { insertId: 1 });
      });

      await createAdmin(mockReq, mockRes);

      expect(UserModel.createAdmin).toHaveBeenCalledWith(
        mockConn,
        expect.objectContaining({
          rol: 'administrador'
        }),
        expect.any(Function)
      );
    });
  });

  // ==================== MAPEO DE CAMPOS ====================
  describe('Mapeo de campos API a BD', () => {
    beforeEach(() => {
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, []);
      });

      UserModel.findByEmail.mockImplementation((conn, email, callback) => {
        callback(null, []);
      });

      bcrypt.hash.mockResolvedValue('$2a$10$hashedpassword');

      UserModel.createAdmin.mockImplementation((conn, data, callback) => {
        callback(null, { insertId: 1 });
      });
    });

    it('debería mapear "usuario" a "nombre_usuario"', async () => {
      await createAdmin(mockReq, mockRes);

      expect(UserModel.createAdmin).toHaveBeenCalledWith(
        mockConn,
        expect.objectContaining({
          nombre_usuario: 'adminuser'
        }),
        expect.any(Function)
      );
    });

    it('debería mapear "nombre_empresa" a "empresa"', async () => {
      await createAdmin(mockReq, mockRes);

      expect(UserModel.createAdmin).toHaveBeenCalledWith(
        mockConn,
        expect.objectContaining({
          empresa: 'Test Company'
        }),
        expect.any(Function)
      );
    });

    it('debería mapear "contrasena" a "password_hash" encriptado', async () => {
      await createAdmin(mockReq, mockRes);

      expect(UserModel.createAdmin).toHaveBeenCalledWith(
        mockConn,
        expect.objectContaining({
          password_hash: '$2a$10$hashedpassword'
        }),
        expect.any(Function)
      );
    });
  });

  // ==================== CASOS EDGE ====================
  describe('Casos edge', () => {
    beforeEach(() => {
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, []);
      });

      UserModel.findByEmail.mockImplementation((conn, email, callback) => {
        callback(null, []);
      });

      bcrypt.hash.mockResolvedValue('$2a$10$hashedpassword');

      UserModel.createAdmin.mockImplementation((conn, data, callback) => {
        callback(null, { insertId: 1 });
      });
    });

    it('debería manejar email con espacios convirtiéndolo a minúsculas', async () => {
      mockReq.body.email = '  ADMIN@EXAMPLE.COM  ';

      await createAdmin(mockReq, mockRes);

      expect(UserModel.createAdmin).toHaveBeenCalledWith(
        mockConn,
        expect.objectContaining({
          email: '  admin@example.com  '
        }),
        expect.any(Function)
      );
    });

    it('debería manejar caracteres especiales en nombre_empresa', async () => {
      mockReq.body.nombre_empresa = 'Empresa & Cía S.A.';

      await createAdmin(mockReq, mockRes);

      expect(UserModel.createAdmin).toHaveBeenCalledWith(
        mockConn,
        expect.objectContaining({
          empresa: 'Empresa & Cía S.A.'
        }),
        expect.any(Function)
      );
    });

    it('debería manejar teléfono vacío como null', async () => {
      mockReq.body.telefono = '';

      await createAdmin(mockReq, mockRes);

      expect(UserModel.createAdmin).toHaveBeenCalledWith(
        mockConn,
        expect.objectContaining({
          telefono: null  // '' || null = null
        }),
        expect.any(Function)
      );
    });
  });
});