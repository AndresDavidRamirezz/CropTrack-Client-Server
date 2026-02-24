// tests/unit/controllers/loginController.test.js
import { login } from '../../../controllers/loginController.js';
import UserModel from '../../../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ==================== MOCKS ====================
jest.mock('../../../models/userModel.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('LoginController - Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockConn;

  beforeEach(() => {
    // Mock request
    mockReq = {
      body: {
        usuario: 'testuser',
        contrasena: 'Test123!',
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

  // ==================== CASOS DE ERROR DE CONEXIÓN ====================
  describe('Errores de conexión a BD', () => {
    it('debería retornar 500 si hay error de conexión a BD', async () => {
      const dbError = new Error('Connection failed');
      mockReq.getConnection.mockImplementation((callback) => {
        callback(dbError, null);
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error al conectar con la base de datos',
        error: dbError.message
      });
    });
  });

  // ==================== CASOS DE BÚSQUEDA DE USUARIO ====================
  describe('Búsqueda de usuario', () => {
    it('debería retornar 500 si hay error al buscar usuario', async () => {
      const searchError = new Error('Search failed');
      
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(searchError, null);
      });

      await login(mockReq, mockRes);

      expect(UserModel.findByUsername).toHaveBeenCalledWith(
        mockConn,
        'testuser',
        expect.any(Function)
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error al verificar credenciales',
        error: searchError.message
      });
    });

    it('debería retornar 401 si el usuario no existe', async () => {
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, []); // Usuario no encontrado
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Usuario o contraseña incorrectos'
      });
    });

    it('debería retornar 401 si results es null', async () => {
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, null); // Results es null
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Usuario o contraseña incorrectos'
      });
    });
  });

  // ==================== VALIDACIÓN DE ROL ====================
  describe('Validación de rol', () => {
    const mockUser = {
      id: 'user-123',
      nombre_usuario: 'testuser',
      password_hash: '$2a$10$hashedpassword',
      rol: 'supervisor',
      email: 'test@example.com',
      nombre: 'Test',
      apellido: 'User',
      empresa: 'Test Company',
      telefono: '1234567890',
      ultimo_acceso: '2024-01-01',
      created_at: '2024-01-01'
    };

    it('debería retornar 403 si el rol no coincide', async () => {
      mockReq.body.rol = 'administrador'; // Usuario solicita rol admin
      
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, [mockUser]); // Usuario tiene rol supervisor
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Este usuario no tiene permisos de administrador'
      });
    });

    it('debería continuar si no se especifica rol', async () => {
      mockReq.body.rol = null;
      
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, [mockUser]);
      });

      bcrypt.compare.mockResolvedValue(false); // Forzar fallo de contraseña

      await login(mockReq, mockRes);

      // Debería llegar a la verificación de contraseña
      expect(bcrypt.compare).toHaveBeenCalled();
    });
  });

  // ==================== VALIDACIÓN DE CONTRASEÑA ====================
  describe('Validación de contraseña', () => {
    const mockUser = {
      id: 'user-123',
      nombre_usuario: 'testuser',
      password_hash: '$2a$10$hashedpassword',
      rol: 'administrador',
      email: 'test@example.com',
      nombre: 'Test',
      apellido: 'User',
      empresa: 'Test Company',
      telefono: '1234567890',
      ultimo_acceso: '2024-01-01',
      created_at: '2024-01-01'
    };

    beforeEach(() => {
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, [mockUser]);
      });
    });

    it('debería retornar 401 si la contraseña es incorrecta', async () => {
      bcrypt.compare.mockResolvedValue(false);

      await login(mockReq, mockRes);

      expect(bcrypt.compare).toHaveBeenCalledWith('Test123!', mockUser.password_hash);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Usuario o contraseña incorrectos'
      });
    });

    it('debería retornar 500 si bcrypt.compare lanza error', async () => {
      const bcryptError = new Error('Bcrypt error');
      bcrypt.compare.mockRejectedValue(bcryptError);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error interno del servidor',
        error: bcryptError.message
      });
    });
  });

  // ==================== LOGIN EXITOSO ====================
  describe('Login exitoso', () => {
    const mockUser = {
      id: 'user-123',
      nombre_usuario: 'testuser',
      password_hash: '$2a$10$hashedpassword',
      rol: 'administrador',
      email: 'test@example.com',
      nombre: 'Test',
      apellido: 'User',
      empresa: 'Test Company',
      telefono: '1234567890',
      ultimo_acceso: '2024-01-01',
      created_at: '2024-01-01'
    };

    const mockToken = 'jwt.token.here';

    beforeEach(() => {
      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, [mockUser]);
      });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(mockToken);
    });

    it('debería actualizar último acceso exitosamente', async () => {
      UserModel.updateLastAccess.mockImplementation((conn, userId, callback) => {
        callback(null);
      });

      await login(mockReq, mockRes);

      expect(UserModel.updateLastAccess).toHaveBeenCalledWith(
        mockConn,
        mockUser.id,
        expect.any(Function)
      );
    });

    it('debería continuar si falla actualización de último acceso', async () => {
      const updateError = new Error('Update failed');
      UserModel.updateLastAccess.mockImplementation((conn, userId, callback) => {
        callback(updateError);
      });

      await login(mockReq, mockRes);

      // No debería retornar error, debe continuar
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('debería generar token JWT con datos correctos', async () => {
      UserModel.updateLastAccess.mockImplementation((conn, userId, callback) => {
        callback(null);
      });

      await login(mockReq, mockRes);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          usuario: mockUser.nombre_usuario,
          rol: mockUser.rol,
          email: mockUser.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
    });

    it('debería retornar 200 con token y datos de usuario', async () => {
      UserModel.updateLastAccess.mockImplementation((conn, userId, callback) => {
        callback(null);
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Login exitoso',
        token: mockToken,
        user: {
          id: mockUser.id,
          usuario: mockUser.nombre_usuario,
          nombre: mockUser.nombre,
          apellido: mockUser.apellido,
          email: mockUser.email,
          empresa: mockUser.empresa,
          telefono: mockUser.telefono,
          imagen_url: null,
          rol: mockUser.rol,
          ultimo_acceso: mockUser.ultimo_acceso,
          created_at: mockUser.created_at
        }
      });
    });

    it('debería usar JWT_EXPIRES_IN por defecto si no está en .env', async () => {
      const originalExpires = process.env.JWT_EXPIRES_IN;
      delete process.env.JWT_EXPIRES_IN;

      UserModel.updateLastAccess.mockImplementation((conn, userId, callback) => {
        callback(null);
      });

      await login(mockReq, mockRes);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        { expiresIn: '7d' }
      );

      process.env.JWT_EXPIRES_IN = originalExpires;
    });
  });

  // ==================== CASOS EDGE ====================
  describe('Casos edge', () => {
    it('debería manejar usuario sin rol especificado en request', async () => {
      delete mockReq.body.rol;

      const mockUser = {
        id: 'user-123',
        nombre_usuario: 'testuser',
        password_hash: '$2a$10$hashedpassword',
        rol: 'trabajador',
        email: 'test@example.com',
        nombre: 'Test',
        apellido: 'User',
        empresa: 'Test Company',
        telefono: '1234567890',
        ultimo_acceso: '2024-01-01',
        created_at: '2024-01-01'
      };

      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, [mockUser]);
      });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');
      UserModel.updateLastAccess.mockImplementation((conn, userId, callback) => {
        callback(null);
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('debería manejar usuario sin teléfono', async () => {
      const mockUser = {
        id: 'user-123',
        nombre_usuario: 'testuser',
        password_hash: '$2a$10$hashedpassword',
        rol: 'administrador',
        email: 'test@example.com',
        nombre: 'Test',
        apellido: 'User',
        empresa: 'Test Company',
        telefono: null, // Sin teléfono
        ultimo_acceso: '2024-01-01',
        created_at: '2024-01-01'
      };

      mockReq.getConnection.mockImplementation((callback) => {
        callback(null, mockConn);
      });

      UserModel.findByUsername.mockImplementation((conn, username, callback) => {
        callback(null, [mockUser]);
      });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');
      UserModel.updateLastAccess.mockImplementation((conn, userId, callback) => {
        callback(null);
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            telefono: null
          })
        })
      );
    });
  });
});