import { validate } from '../../../middleware/validate.js';
import { validationResult } from 'express-validator';

describe('Middleware validate (Register) - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function para ejecutar todas las validaciones
  const executeValidations = async (data) => {
    req.body = data;
    
    // Ejecutar todos los validadores (son un array)
    for (const validation of validate.slice(0, -1)) {
      await validation.run(req);
    }
    
    // Ejecutar el middleware final
    await validate[validate.length - 1](req, res, next);
  };

  describe('Validación completa exitosa', () => {
    it('debería pasar validación con todos los campos correctos', async () => {
      const validData = {
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa',
        telefono: '+123456789'
      };

      await executeValidations(validData);

      expect(res.status).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('debería pasar validación sin teléfono (campo opcional)', async () => {
      const validData = {
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      };

      await executeValidations(validData);

      expect(res.status).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Validación de campo "usuario"', () => {
    it('debería fallar si usuario está vacío', async () => {
      await executeValidations({
        usuario: '',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('debería fallar si usuario tiene menos de 3 caracteres', async () => {
      await executeValidations({
        usuario: 'ab',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const errors = res.json.mock.calls[0][0].errors;
      expect(errors.some(e => e.field === 'usuario')).toBe(true);
    });

    it('debería fallar si usuario tiene más de 50 caracteres', async () => {
      await executeValidations({
        usuario: 'a'.repeat(51),
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería fallar si usuario contiene caracteres especiales', async () => {
      await executeValidations({
        usuario: 'test@user!',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería pasar con usuario válido (letras, números y guion bajo)', async () => {
      await executeValidations({
        usuario: 'test_user_123',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Validación de campo "contrasena"', () => {
    it('debería fallar si contraseña está vacía', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: '',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería fallar si contraseña tiene menos de 6 caracteres', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: '12345',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería fallar si contraseña tiene más de 100 caracteres', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'a'.repeat(101),
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería pasar con contraseña válida', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'ValidPassword123!',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Validación de campo "nombre"', () => {
    it('debería fallar si nombre está vacío', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: '',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería fallar si nombre tiene menos de 2 caracteres', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'J',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería fallar si nombre contiene números', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan123',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería pasar con nombre válido (letras con acentos y espacios)', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'José María',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Validación de campo "apellido"', () => {
    it('debería fallar si apellido está vacío', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: '',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería pasar con apellido válido', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'García López',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Validación de campo "email"', () => {
    it('debería fallar si email está vacío', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: '',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería fallar si email no tiene formato válido', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'invalid-email',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería fallar si email tiene más de 100 caracteres', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'a'.repeat(91) + '@test.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Validación de campo "nombre_empresa"', () => {
    it('debería fallar si nombre_empresa está vacío', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: ''
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería fallar si nombre_empresa tiene menos de 2 caracteres', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'A'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Validación de campo "telefono" (opcional)', () => {
    it('debería pasar si teléfono es válido', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa',
        telefono: '+54 381 123-4567'
      });

      expect(next).toHaveBeenCalled();
    });

    it('debería pasar si teléfono está vacío', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa',
        telefono: ''
      });

      expect(next).toHaveBeenCalled();
    });

    it('debería fallar si teléfono contiene caracteres inválidos', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa',
        telefono: '123abc456'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería fallar si teléfono tiene más de 20 caracteres', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa',
        telefono: '1'.repeat(21)
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Validación de múltiples errores', () => {
    it('debería retornar todos los errores cuando múltiples campos son inválidos', async () => {
      await executeValidations({
        usuario: 'ab',
        contrasena: '123',
        nombre: 'J',
        apellido: '',
        email: 'invalid',
        nombre_empresa: 'A'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Validación de estructura de respuesta de error', () => {
    it('debería retornar la estructura correcta de error', async () => {
      await executeValidations({
        usuario: '',
        contrasena: '123',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        nombre_empresa: 'Mi Empresa'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('errors');
      expect(Array.isArray(response.errors)).toBe(true);
      expect(response.errors[0]).toHaveProperty('field');
      expect(response.errors[0]).toHaveProperty('message');
    });
  });
});