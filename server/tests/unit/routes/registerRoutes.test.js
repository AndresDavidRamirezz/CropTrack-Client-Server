import request from 'supertest';
import express from 'express';
import registerRoutes from '../../../routes/registerRoutes.js';
import * as registerController from '../../../controllers/registerController.js';
import * as validateModule from '../../../middleware/validate.js';
import * as generateIdModule from '../../../middleware/generateId.js';

// Mocks
jest.mock('../../../controllers/registerController.js');
jest.mock('../../../middleware/validate.js', () => ({
  validate: jest.fn((req, res, next) => next())
}));
jest.mock('../../../middleware/generateId.js', () => ({
  generateId: jest.fn((req, res, next) => {
    req.body.id = 'test-uuid-1234';
    next();
  })
}));

describe('Register Routes - Unit Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    app.use('/api/auth', registerRoutes);
    
    // Mock por defecto del controlador
    registerController.createAdmin.mockImplementation((req, res) => {
      res.status(201).json({ 
        message: 'Administrador creado exitosamente',
        id: req.body.id
      });
    });
  });

  describe('POST /api/auth/register-admin', () => {
    const validAdminData = {
      usuario: 'admin123',
      contrasena: 'password123',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      nombre_empresa: 'Mi Empresa',
      telefono: '+123456789'
    };

    it('debería tener la ruta POST /register-admin configurada', async () => {
      const response = await request(app)
        .post('/api/auth/register-admin')
        .send(validAdminData);

      expect(response.status).toBe(201);
      expect(validateModule.validate).toHaveBeenCalled();
      expect(generateIdModule.generateId).toHaveBeenCalled();
      expect(registerController.createAdmin).toHaveBeenCalled();
    });

    it('debería llamar a los middlewares en el orden correcto: validate -> generateId -> createAdmin', async () => {
      const callOrder = [];

      validateModule.validate.mockImplementationOnce((req, res, next) => {
        callOrder.push('validate');
        next();
      });

      generateIdModule.generateId.mockImplementationOnce((req, res, next) => {
        callOrder.push('generateId');
        req.body.id = 'test-uuid-1234';
        next();
      });

      registerController.createAdmin.mockImplementationOnce((req, res) => {
        callOrder.push('createAdmin');
        res.status(201).json({ message: 'OK' });
      });

      await request(app)
        .post('/api/auth/register-admin')
        .send(validAdminData);

      expect(callOrder).toEqual(['validate', 'generateId', 'createAdmin']);
    });

    it('debería pasar los datos del body al controlador con el ID generado', async () => {
      registerController.createAdmin.mockImplementationOnce((req, res) => {
        expect(req.body).toHaveProperty('id');
        expect(req.body.usuario).toBe(validAdminData.usuario);
        expect(req.body.email).toBe(validAdminData.email);
        res.status(201).json({ message: 'OK' });
      });

      await request(app)
        .post('/api/auth/register-admin')
        .send(validAdminData);

      expect(registerController.createAdmin).toHaveBeenCalled();
    });

    it('debería rechazar métodos HTTP no permitidos (GET)', async () => {
      const response = await request(app)
        .get('/api/auth/register-admin');

      expect(response.status).toBe(404);
    });

    it('debería rechazar métodos HTTP no permitidos (PUT)', async () => {
      const response = await request(app)
        .put('/api/auth/register-admin');

      expect(response.status).toBe(404);
    });

    it('debería rechazar métodos HTTP no permitidos (DELETE)', async () => {
      const response = await request(app)
        .delete('/api/auth/register-admin');

      expect(response.status).toBe(404);
    });

    it('debería manejar errores del middleware de validación', async () => {
      validateModule.validate.mockImplementationOnce((req, res, next) => {
        res.status(400).json({
          message: 'Error de validación',
          errors: [{ field: 'usuario', message: 'Usuario requerido' }]
        });
      });

      const response = await request(app)
        .post('/api/auth/register-admin')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Error de validación');
    });

    it('debería procesar correctamente Content-Type application/json', async () => {
      const response = await request(app)
        .post('/api/auth/register-admin')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(validAdminData));

      expect(response.status).toBe(201);
    });

    it('debería generar un UUID antes de llamar al controlador', async () => {
      generateIdModule.generateId.mockImplementationOnce((req, res, next) => {
        req.body.id = 'mock-uuid-5678';
        next();
      });

      registerController.createAdmin.mockImplementationOnce((req, res) => {
        expect(req.body.id).toBe('mock-uuid-5678');
        res.status(201).json({ id: req.body.id });
      });

      const response = await request(app)
        .post('/api/auth/register-admin')
        .send(validAdminData);

      expect(response.body.id).toBe('mock-uuid-5678');
    });
  });

  describe('Rutas no definidas', () => {
    it('debería retornar 404 para rutas no existentes', async () => {
      const response = await request(app)
        .post('/api/auth/invalid-route');

      expect(response.status).toBe(404);
    });
  });
});