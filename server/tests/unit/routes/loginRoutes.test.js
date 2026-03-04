import request from 'supertest';
import express from 'express';
import loginRoutes from '../../../routes/loginRoutes.js';
import * as loginController from '../../../controllers/loginController.js';
import * as validateLoginModule from '../../../middleware/validateLogin.js';

// Mock del controlador
jest.mock('../../../controllers/loginController.js');

// Mock del middleware de validación
jest.mock('../../../middleware/validateLogin.js', () => ({
  validateLogin: jest.fn((req, res, next) => next())
}));

describe('Login Routes - Unit Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    app.use('/api/auth', loginRoutes);
    
    // Configurar el mock del controlador
    loginController.login.mockImplementation((req, res) => {
      res.status(200).json({ message: 'Login exitoso' });
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería tener la ruta POST /login configurada', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'testuser',
          contrasena: 'password123',
          rol: 'administrador'
        });

      expect(response.status).toBe(200);
      expect(validateLoginModule.validateLogin).toHaveBeenCalled();
      expect(loginController.login).toHaveBeenCalled();
    });

    it('debería llamar al middleware validateLogin antes del controlador', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'testuser',
          contrasena: 'password123',
          rol: 'administrador'
        });

      expect(validateLoginModule.validateLogin).toHaveBeenCalled();
      expect(loginController.login).toHaveBeenCalled();
    });

    it('debería pasar los datos del body al controlador', async () => {
      const testData = {
        usuario: 'testuser',
        contrasena: 'password123',
        rol: 'administrador'
      };

      loginController.login.mockImplementation((req, res) => {
        expect(req.body).toEqual(testData);
        res.status(200).json({ message: 'OK' });
      });

      await request(app)
        .post('/api/auth/login')
        .send(testData);

      expect(loginController.login).toHaveBeenCalled();
    });

    it('debería rechazar métodos HTTP no permitidos (GET)', async () => {
      const response = await request(app)
        .get('/api/auth/login');

      expect(response.status).toBe(404);
    });

    it('debería rechazar métodos HTTP no permitidos (PUT)', async () => {
      const response = await request(app)
        .put('/api/auth/login');

      expect(response.status).toBe(404);
    });

    it('debería rechazar métodos HTTP no permitidos (DELETE)', async () => {
      const response = await request(app)
        .delete('/api/auth/login');

      expect(response.status).toBe(404);
    });

    it('debería manejar errores del middleware de validación', async () => {
      validateLoginModule.validateLogin.mockImplementationOnce((req, res, next) => {
        res.status(400).json({
          message: 'Error de validación',
          errors: [{ field: 'usuario', message: 'Usuario requerido' }]
        });
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ contrasena: '123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Error de validación');
    });

    it('debería procesar correctamente Content-Type application/json', async () => {
      loginController.login.mockImplementation((req, res) => {
        res.status(200).json({ message: 'OK' });
      });

      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          usuario: 'testuser',
          contrasena: 'password123'
        }));

      expect(response.status).toBe(200);
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