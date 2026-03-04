import { validateLogin } from '../../../middleware/validateLogin.js';

describe('Middleware validateLogin - Unit Tests', () => {
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
    for (const validation of validateLogin.slice(0, -1)) {
      await validation.run(req);
    }
    
    // Ejecutar el middleware final
    await validateLogin[validateLogin.length - 1](req, res, next);
  };

  describe('Validación completa exitosa', () => {
    it('debería pasar validación con todos los campos correctos', async () => {
      const validData = {
        usuario: 'testuser',
        contrasena: 'password123',
        rol: 'administrador'
      };

      await executeValidations(validData);

      expect(res.status).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('debería pasar validación sin rol (campo opcional)', async () => {
      const validData = {
        usuario: 'testuser',
        contrasena: 'password123'
      };

      await executeValidations(validData);

      expect(res.status).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    // ✅ REEMPLAZAR ESTE TEST
    it('debería aceptar todos los roles válidos en minúsculas', async () => {
      const roles = ['administrador', 'supervisor', 'trabajador'];
      
      for (const rol of roles) {
        jest.clearAllMocks();
        
        const validData = {
          usuario: 'testuser',
          contrasena: 'password123',
          rol: rol
        };

        await executeValidations(validData);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      }
    });

    it('debería aceptar rol "supervisor"', async () => {
      const validData = {
        usuario: 'testuser',
        contrasena: 'password123',
        rol: 'supervisor'
      };

      await executeValidations(validData);

      expect(next).toHaveBeenCalled();
    });

    it('debería aceptar rol "trabajador"', async () => {
      const validData = {
        usuario: 'testuser',
        contrasena: 'password123',
        rol: 'trabajador'
      };

      await executeValidations(validData);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Validación de campo "usuario"', () => {
    it('debería fallar si usuario está vacío', async () => {
      await executeValidations({
        usuario: '',
        contrasena: 'password123',
        rol: 'administrador'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('debería fallar si usuario no se proporciona', async () => {
      await executeValidations({
        contrasena: 'password123',
        rol: 'administrador'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const errors = res.json.mock.calls[0][0].errors;
      expect(errors.some(e => e.field === 'usuario')).toBe(true);
    });

    it('debería fallar si usuario tiene menos de 3 caracteres', async () => {
      await executeValidations({
        usuario: 'ab',
        contrasena: 'password123',
        rol: 'administrador'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const errors = res.json.mock.calls[0][0].errors;
      expect(errors.some(e => e.field === 'usuario')).toBe(true);
    });

    it('debería fallar si usuario tiene más de 50 caracteres', async () => {
      await executeValidations({
        usuario: 'a'.repeat(51),
        contrasena: 'password123',
        rol: 'administrador'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería eliminar espacios en blanco del usuario (trim)', async () => {
      const validData = {
        usuario: '  testuser  ',
        contrasena: 'password123',
        rol: 'administrador'
      };

      await executeValidations(validData);

      expect(next).toHaveBeenCalled();
      expect(req.body.usuario).toBe('testuser');
    });
  });

  describe('Validación de campo "contrasena"', () => {
    it('debería fallar si contraseña está vacía', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: '',
        rol: 'administrador'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const errors = res.json.mock.calls[0][0].errors;
      expect(errors.some(e => e.field === 'contrasena')).toBe(true);
    });

    it('debería fallar si contraseña no se proporciona', async () => {
      await executeValidations({
        usuario: 'testuser',
        rol: 'administrador'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const errors = res.json.mock.calls[0][0].errors;
      expect(errors.some(e => e.field === 'contrasena')).toBe(true);
    });

    it('debería fallar si contraseña tiene menos de 6 caracteres', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: '12345',
        rol: 'administrador'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const errors = res.json.mock.calls[0][0].errors;
      expect(errors.some(e => e.field === 'contrasena')).toBe(true);
    });

    it('debería pasar con contraseña de exactamente 6 caracteres', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: '123456',
        rol: 'administrador'
      });

      expect(next).toHaveBeenCalled();
    });

    it('debería pasar con contraseña larga', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'ThisIsAVeryLongPasswordWith123Numbers!',
        rol: 'administrador'
      });

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Validación de campo "rol" (opcional)', () => {
    it('debería fallar si rol no es válido', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        rol: 'invalid_role'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const errors = res.json.mock.calls[0][0].errors;
      expect(errors.some(e => e.field === 'rol')).toBe(true);
    });

    it('debería fallar con rol en mayúsculas (no está en la lista válida)', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        rol: 'ADMINISTRADOR'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const errors = res.json.mock.calls[0][0].errors;
      expect(errors.some(e => e.field === 'rol')).toBe(true);
    });

    it('debería fallar con rol que no existe', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123',
        rol: 'GERENTE'
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debería pasar si rol no se proporciona (es opcional)', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'password123'
      });

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Validación de múltiples errores', () => {
    it('debería retornar todos los errores cuando múltiples campos son inválidos', async () => {
      await executeValidations({
        usuario: 'ab',
        contrasena: '123',
        rol: 'invalid'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.errors.length).toBeGreaterThanOrEqual(3);
    });

    it('debería retornar errores si todos los campos están vacíos', async () => {
      await executeValidations({});

      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.errors.length).toBeGreaterThan(0);
    });

    it('debería retornar errores si usuario y contraseña están vacíos', async () => {
      await executeValidations({
        usuario: '',
        contrasena: '123'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validación de estructura de respuesta de error', () => {
    it('debería retornar la estructura correcta de error', async () => {
      await executeValidations({
        usuario: '',
        contrasena: '123'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('errors');
      expect(Array.isArray(response.errors)).toBe(true);
      expect(response.errors[0]).toHaveProperty('field');
      expect(response.errors[0]).toHaveProperty('message');
      expect(response.errors[0]).toHaveProperty('value');
    });

    it('debería tener el mensaje "Error de validación"', async () => {
      await executeValidations({
        usuario: 'ab'
      });

      expect(res.status).toHaveBeenCalledWith(400);
      const response = res.json.mock.calls[0][0];
      expect(response.message).toBe('Error de validación');
    });
  });

  describe('Casos edge', () => {
    it('debería manejar espacios en blanco en todos los campos de texto', async () => {
      await executeValidations({
        usuario: '   validuser   ',
        contrasena: 'password123',
        rol: 'administrador'
      });

      expect(next).toHaveBeenCalled();
      expect(req.body.usuario).toBe('validuser');
    });

    it('debería aceptar combinación de letras, números y caracteres especiales en contraseña', async () => {
      await executeValidations({
        usuario: 'testuser',
        contrasena: 'P@ssw0rd!123',
        rol: 'trabajador'
      });

      expect(next).toHaveBeenCalled();
    });
  });
});