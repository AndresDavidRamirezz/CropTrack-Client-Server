// tests/unit/models/userModel.test.js
import UserModel from '../../../models/userModel.js';

describe('UserModel - Unit Tests', () => {
  let mockConn;
  let mockCallback;

  beforeEach(() => {
    // Mock de la conexión
    mockConn = {
      query: jest.fn()
    };

    // Mock del callback
    mockCallback = jest.fn();

    // Limpiar mocks
    jest.clearAllMocks();
  });

  // ==================== MÉTODOS PARA ADMIN ====================

  describe('findByUsername', () => {
    it('debería buscar usuario por nombre_usuario exitosamente', () => {
      const mockResults = [{ id: '123', nombre_usuario: 'testuser' }];
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      UserModel.findByUsername(mockConn, 'testuser', mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE nombre_usuario = ?',
        ['testuser'],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResults);
    });

    it('debería manejar error en la búsqueda por username', () => {
      const mockError = new Error('Database error');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.findByUsername(mockConn, 'testuser', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });

    it('debería retornar array vacío si no encuentra usuario', () => {
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      UserModel.findByUsername(mockConn, 'nonexistent', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, []);
    });
  });

  describe('findByEmail', () => {
    it('debería buscar usuario por email exitosamente', () => {
      const mockResults = [{ id: '123', email: 'test@example.com' }];
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      UserModel.findByEmail(mockConn, 'test@example.com', mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@example.com'],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResults);
    });

    it('debería manejar error en la búsqueda por email', () => {
      const mockError = new Error('Database error');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.findByEmail(mockConn, 'test@example.com', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });

    it('debería retornar array vacío si no encuentra email', () => {
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      UserModel.findByEmail(mockConn, 'nonexistent@example.com', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, []);
    });
  });

  describe('createAdmin', () => {
    it('debería crear administrador exitosamente', () => {
      const userData = {
        id: 'admin-123',
        nombre_usuario: 'admin',
        password_hash: 'hashed',
        rol: 'administrador'
      };
      const mockResult = { insertId: 1, affectedRows: 1 };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      UserModel.createAdmin(mockConn, userData, mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'INSERT INTO users SET ?',
        [userData],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResult);
    });

    it('debería manejar error al crear administrador', () => {
      const userData = { nombre_usuario: 'admin' };
      const mockError = new Error('Duplicate entry');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.createAdmin(mockConn, userData, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });
  });

  describe('findById', () => {
    it('debería buscar usuario por ID exitosamente', () => {
      const mockResults = [{ id: 'user-123', nombre: 'Test' }];
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      UserModel.findById(mockConn, 'user-123', mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        ['user-123'],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResults);
    });

    it('debería manejar error en búsqueda por ID', () => {
      const mockError = new Error('Database error');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.findById(mockConn, 'user-123', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });

    it('debería retornar array vacío si no encuentra usuario por ID', () => {
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      UserModel.findById(mockConn, 'nonexistent-id', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, []);
    });
  });

  describe('updateLastAccess', () => {
    it('debería actualizar último acceso exitosamente', () => {
      const mockResult = { affectedRows: 1 };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      UserModel.updateLastAccess(mockConn, 'user-123', mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'UPDATE users SET ultimo_acceso = NOW() WHERE id = ?',
        ['user-123'],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResult);
    });

    it('debería manejar error al actualizar último acceso', () => {
      const mockError = new Error('Update failed');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.updateLastAccess(mockConn, 'user-123', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });
  });

  // ==================== MÉTODOS PARA WORKERS ====================

  describe('createWorker', () => {
    it('debería crear trabajador exitosamente', () => {
      const userData = {
        id: 'worker-123',
        nombre_usuario: 'worker',
        rol: 'trabajador'
      };
      const mockResult = { insertId: 1, affectedRows: 1 };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      UserModel.createWorker(mockConn, userData, mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'INSERT INTO users SET ?',
        [userData],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResult);
    });

    it('debería manejar error al crear trabajador', () => {
      const userData = { nombre_usuario: 'worker' };
      const mockError = new Error('Insert failed');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.createWorker(mockConn, userData, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });
  });

  describe('findWorkerByUsername', () => {
    it('debería buscar trabajador por username exitosamente', () => {
      const mockResults = [{ id: '123', nombre_usuario: 'worker1' }];
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      UserModel.findWorkerByUsername(mockConn, 'worker1', mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE nombre_usuario = ?',
        ['worker1'],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResults);
    });

    it('debería manejar error en búsqueda de trabajador por username', () => {
      const mockError = new Error('Search failed');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.findWorkerByUsername(mockConn, 'worker1', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });

    it('debería retornar array vacío si no encuentra trabajador', () => {
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      UserModel.findWorkerByUsername(mockConn, 'nonexistent', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, []);
    });
  });

  describe('findWorkerByEmail', () => {
    it('debería buscar trabajador por email exitosamente', () => {
      const mockResults = [{ id: '123', email: 'worker@example.com' }];
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      UserModel.findWorkerByEmail(mockConn, 'worker@example.com', mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['worker@example.com'],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResults);
    });

    it('debería manejar error en búsqueda de trabajador por email', () => {
      const mockError = new Error('Search failed');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.findWorkerByEmail(mockConn, 'worker@example.com', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });

    it('debería retornar array vacío si no encuentra email de trabajador', () => {
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      UserModel.findWorkerByEmail(mockConn, 'nonexistent@example.com', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, []);
    });
  });

  describe('findWorkerByEmpresa', () => {
    it('debería buscar trabajadores por empresa exitosamente', () => {
      const mockResults = [
        { id: '1', nombre_usuario: 'worker1', empresa: 'TestCorp' },
        { id: '2', nombre_usuario: 'worker2', empresa: 'TestCorp' }
      ];
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      UserModel.findWorkerByEmpresa(mockConn, 'TestCorp', mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE empresa = ? AND rol IN'),
        ['TestCorp'],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResults);
    });

    it('debería manejar error en búsqueda por empresa', () => {
      const mockError = new Error('Search failed');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.findWorkerByEmpresa(mockConn, 'TestCorp', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });

    it('debería retornar array vacío si no hay trabajadores en la empresa', () => {
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      UserModel.findWorkerByEmpresa(mockConn, 'EmptyCorp', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, []);
    });

    it('debería ordenar resultados por created_at DESC', () => {
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      UserModel.findWorkerByEmpresa(mockConn, 'TestCorp', mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        ['TestCorp'],
        expect.any(Function)
      );
    });
  });

  describe('findWorkerByIdSafe', () => {
    it('debería buscar trabajador por ID sin password', () => {
      const mockResults = [{ 
        id: 'worker-123', 
        nombre: 'Worker',
        apellido: 'Test',
        email: 'worker@example.com'
      }];
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      UserModel.findWorkerByIdSafe(mockConn, 'worker-123', mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, nombre_usuario, nombre, apellido'),
        ['worker-123'],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResults[0]);
    });

    it('debería manejar error en búsqueda segura por ID', () => {
      const mockError = new Error('Database error');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.findWorkerByIdSafe(mockConn, 'worker-123', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });

    it('debería retornar null si no encuentra usuario', () => {
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      UserModel.findWorkerByIdSafe(mockConn, 'nonexistent', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, null);
    });

    it('debería retornar primer resultado si hay múltiples', () => {
      const mockResults = [
        { id: '1', nombre: 'First' },
        { id: '2', nombre: 'Second' }
      ];
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      UserModel.findWorkerByIdSafe(mockConn, 'worker-123', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, mockResults[0]);
    });
  });

  describe('updateWorker', () => {
    it('debería actualizar trabajador exitosamente', () => {
      const updateData = {
        nombre: 'Updated',
        apellido: 'Name',
        email: 'updated@example.com'
      };
      const mockResult = { affectedRows: 1 };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      UserModel.updateWorker(mockConn, 'worker-123', updateData, mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'UPDATE users SET ? WHERE id = ?',
        [updateData, 'worker-123'],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResult);
    });

    it('debería manejar error al actualizar trabajador', () => {
      const updateData = { nombre: 'Updated' };
      const mockError = new Error('Update failed');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.updateWorker(mockConn, 'worker-123', updateData, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });

    it('debería eliminar campos no actualizables (id)', () => {
      const updateData = {
        id: 'should-be-removed',
        nombre: 'Updated'
      };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      UserModel.updateWorker(mockConn, 'worker-123', updateData, mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'UPDATE users SET ? WHERE id = ?',
        [expect.not.objectContaining({ id: expect.anything() }), 'worker-123'],
        expect.any(Function)
      );
    });

    it('debería eliminar campos no actualizables (nombre_usuario)', () => {
      const updateData = {
        nombre_usuario: 'should-be-removed',
        nombre: 'Updated'
      };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      UserModel.updateWorker(mockConn, 'worker-123', updateData, mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'UPDATE users SET ? WHERE id = ?',
        [expect.not.objectContaining({ nombre_usuario: expect.anything() }), 'worker-123'],
        expect.any(Function)
      );
    });

    it('debería eliminar campos no actualizables (empresa)', () => {
      const updateData = {
        empresa: 'should-be-removed',
        nombre: 'Updated'
      };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      UserModel.updateWorker(mockConn, 'worker-123', updateData, mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'UPDATE users SET ? WHERE id = ?',
        [expect.not.objectContaining({ empresa: expect.anything() }), 'worker-123'],
        expect.any(Function)
      );
    });

    it('debería eliminar campos no actualizables (rol)', () => {
      const updateData = {
        rol: 'should-be-removed',
        nombre: 'Updated'
      };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      UserModel.updateWorker(mockConn, 'worker-123', updateData, mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'UPDATE users SET ? WHERE id = ?',
        [expect.not.objectContaining({ rol: expect.anything() }), 'worker-123'],
        expect.any(Function)
      );
    });

    it('debería eliminar campos no actualizables (created_at)', () => {
      const updateData = {
        created_at: 'should-be-removed',
        nombre: 'Updated'
      };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      UserModel.updateWorker(mockConn, 'worker-123', updateData, mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'UPDATE users SET ? WHERE id = ?',
        [expect.not.objectContaining({ created_at: expect.anything() }), 'worker-123'],
        expect.any(Function)
      );
    });

    it('debería permitir actualizar password_hash', () => {
      const updateData = {
        password_hash: 'new-hashed-password',
        nombre: 'Updated'
      };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      UserModel.updateWorker(mockConn, 'worker-123', updateData, mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'UPDATE users SET ? WHERE id = ?',
        [expect.objectContaining({ password_hash: 'new-hashed-password' }), 'worker-123'],
        expect.any(Function)
      );
    });
  });

  describe('deleteWorker', () => {
    it('debería eliminar trabajador exitosamente', () => {
      const mockResult = { affectedRows: 1 };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      UserModel.deleteWorker(mockConn, 'worker-123', mockCallback);

      expect(mockConn.query).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = ?',
        ['worker-123'],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResult);
    });

    it('debería manejar error al eliminar trabajador', () => {
      const mockError = new Error('Delete failed');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.deleteWorker(mockConn, 'worker-123', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });

    it('debería retornar affectedRows 0 si no encuentra usuario', () => {
      const mockResult = { affectedRows: 0 };
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      UserModel.deleteWorker(mockConn, 'nonexistent', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null, mockResult);
    });
  });

  describe('findWorkerByEmailExcludingId', () => {
    it('debería buscar email excluyendo ID exitosamente', () => {
      const mockResults = [{ id: 'other-123', email: 'test@example.com' }];
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, mockResults);
      });

      UserModel.findWorkerByEmailExcludingId(
        mockConn, 
        'test@example.com', 
        'worker-123', 
        mockCallback
      );

      expect(mockConn.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ? AND id != ?',
        ['test@example.com', 'worker-123'],
        expect.any(Function)
      );
      expect(mockCallback).toHaveBeenCalledWith(null, mockResults);
    });

    it('debería manejar error en búsqueda excluyendo ID', () => {
      const mockError = new Error('Search failed');
      
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      UserModel.findWorkerByEmailExcludingId(
        mockConn, 
        'test@example.com', 
        'worker-123', 
        mockCallback
      );

      expect(mockCallback).toHaveBeenCalledWith(mockError, null);
    });

    it('debería retornar array vacío si no encuentra otros usuarios con ese email', () => {
      mockConn.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      UserModel.findWorkerByEmailExcludingId(
        mockConn, 
        'unique@example.com', 
        'worker-123', 
        mockCallback
      );

      expect(mockCallback).toHaveBeenCalledWith(null, []);
    });
  });
});