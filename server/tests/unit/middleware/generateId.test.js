import { generateId } from '../../../middleware/generateId.js';

// Mock manual de uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234-5678-90ab')
}));

// Importar después del mock
import { v4 as uuidv4 } from 'uuid';

describe('Middleware generateId - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {};
    next = jest.fn();
    
    // Resetear el mock
    uuidv4.mockClear();
    uuidv4.mockReturnValue('test-uuid-1234-5678-90ab');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Generación de UUID', () => {
    it('debería generar un UUID y agregarlo a req.body.id', () => {
      generateId(req, res, next);

      expect(req.body.id).toBeDefined();
      expect(req.body.id).toBe('test-uuid-1234-5678-90ab');
    });

    it('debería llamar a next() después de generar el UUID', () => {
      generateId(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('debería llamar a uuidv4() una vez', () => {
      generateId(req, res, next);

      expect(uuidv4).toHaveBeenCalled();
      expect(uuidv4).toHaveBeenCalledTimes(1);
    });

    it('debería mantener otros campos del req.body intactos', () => {
      req.body = {
        usuario: 'testuser',
        email: 'test@example.com'
      };

      generateId(req, res, next);

      expect(req.body.usuario).toBe('testuser');
      expect(req.body.email).toBe('test@example.com');
      expect(req.body.id).toBe('test-uuid-1234-5678-90ab');
    });

    it('debería sobrescribir el id si ya existe en req.body', () => {
      req.body.id = 'old-id';

      generateId(req, res, next);

      expect(req.body.id).toBe('test-uuid-1234-5678-90ab');
      expect(req.body.id).not.toBe('old-id');
    });

    it('debería generar diferentes UUIDs en llamadas sucesivas', () => {
      uuidv4
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2')
        .mockReturnValueOnce('uuid-3');

      const req1 = { body: {} };
      const req2 = { body: {} };
      const req3 = { body: {} };

      generateId(req1, res, next);
      generateId(req2, res, next);
      generateId(req3, res, next);

      expect(req1.body.id).toBe('uuid-1');
      expect(req2.body.id).toBe('uuid-2');
      expect(req3.body.id).toBe('uuid-3');
    });
  });

  describe('Formato del UUID', () => {
    it('debería generar un UUID con formato válido (simulado)', () => {
      uuidv4.mockReturnValue('550e8400-e29b-41d4-a716-446655440000');

      generateId(req, res, next);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(req.body.id).toMatch(uuidRegex);
    });
  });

  describe('Casos edge', () => {
    it('debería funcionar incluso si req.body está inicialmente vacío', () => {
      req.body = {};

      generateId(req, res, next);

      expect(req.body).toHaveProperty('id');
      expect(typeof req.body.id).toBe('string');
    });

    it('debería funcionar si req.body tiene muchos campos', () => {
      req.body = {
        campo1: 'valor1',
        campo2: 'valor2',
        campo3: 'valor3',
        campo4: 'valor4',
        campo5: 'valor5'
      };

      generateId(req, res, next);

      expect(Object.keys(req.body).length).toBe(6);
      expect(req.body.id).toBeDefined();
    });
  });
});