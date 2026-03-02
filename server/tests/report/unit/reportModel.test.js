// ==================== TESTS UNITARIOS - reportModel.js ====================
// Prueba los métodos estáticos del ReportModel en aislamiento:
// - findCropWithCreator: obtener cosecha con datos del admin
// - findWorkersByCrop: obtener trabajadores asignados
// - findTasksByCrop: obtener tareas del cultivo
// - findMeasurementsByCrop: obtener mediciones del cultivo

import ReportModel from '../../../models/reportModel.js';

// ==================== SETUP GLOBAL ====================

// Mock de consola para no contaminar el output de tests
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

// ==================== DATOS DE PRUEBA ====================

const mockCropId = 'crop-uuid-001';

const mockCropRow = {
  id: mockCropId,
  nombre: 'Tomates Cherry',
  tipo: 'Hortaliza',
  variedad: 'Cherry',
  area_hectareas: 5.5,
  ubicacion: 'Parcela A',
  fecha_siembra: '2026-01-15',
  fecha_cosecha_estimada: '2026-06-15',
  fecha_cosecha_real: null,
  estado: 'en_crecimiento',
  notas: 'Cultivo experimental',
  imagen_url: null,
  usuario_creador_id: 'admin-001',
  admin_nombre: 'Carlos',
  admin_apellido: 'González',
  admin_email: 'carlos@agrotech.com',
  admin_empresa: 'AgroTech SRL',
  admin_telefono: '1234567890',
  admin_imagen_url: null
};

const mockWorkers = [
  { id: 'w-001', nombre: 'Ana', apellido: 'López', rol: 'trabajador', email: 'ana@test.com', telefono: '111', imagen_url: null },
  { id: 'w-002', nombre: 'Pedro', apellido: 'García', rol: 'supervisor', email: 'pedro@test.com', telefono: '222', imagen_url: null }
];

const mockTasks = [
  {
    id: 't-001', cultivo_id: mockCropId, nombre: 'Riego', descripcion: 'Riego matutino',
    asignado_a: 'w-001', asignado_nombre: 'Ana', asignado_apellido: 'López',
    estado: 'completada', prioridad: 'alta', fecha_inicio: '2026-02-01', fecha_fin_estimada: '2026-02-01',
    fecha_fin_real: '2026-02-01', created_at: '2026-02-01T08:00:00.000Z'
  }
];

const mockMeasurements = [
  {
    id: 'm-001', cultivo_id: mockCropId, usuario_id: 'w-001',
    usuario_nombre: 'Ana', usuario_apellido: 'López',
    temperatura: 25.5, humedad: 65, ph_suelo: 6.8, altura_plantas: 45.2,
    fecha_medicion: '2026-02-15T10:00:00.000Z'
  }
];

// ==================== SUITE DE TESTS ====================

describe('ReportModel - Tests Unitarios', () => {

  // ==================== findCropWithCreator ====================

  describe('findCropWithCreator', () => {
    it('debe ejecutar una query con el cropId correcto', () => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, [mockCropRow]);
        })
      };

      ReportModel.findCropWithCreator(mockConn, mockCropId, () => {});

      expect(mockConn.query).toHaveBeenCalledTimes(1);
      expect(mockConn.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [mockCropId],
        expect.any(Function)
      );
    });

    it('debe retornar los datos de la cosecha cuando se encuentra', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, [mockCropRow]);
        })
      };

      ReportModel.findCropWithCreator(mockConn, mockCropId, (err, cropData) => {
        expect(err).toBeNull();
        expect(cropData).toBeDefined();
        expect(cropData.id).toBe(mockCropId);
        expect(cropData.nombre).toBe('Tomates Cherry');
        done();
      });
    });

    it('debe retornar datos del admin en los campos admin_*', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, [mockCropRow]);
        })
      };

      ReportModel.findCropWithCreator(mockConn, mockCropId, (err, cropData) => {
        expect(err).toBeNull();
        expect(cropData.admin_nombre).toBe('Carlos');
        expect(cropData.admin_apellido).toBe('González');
        expect(cropData.admin_email).toBe('carlos@agrotech.com');
        expect(cropData.admin_empresa).toBe('AgroTech SRL');
        done();
      });
    });

    it('debe retornar null cuando la cosecha no existe (results vacíos)', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []); // Array vacío = no encontrado
        })
      };

      ReportModel.findCropWithCreator(mockConn, 'crop-inexistente', (err, cropData) => {
        expect(err).toBeNull();
        expect(cropData).toBeNull();
        done();
      });
    });

    it('debe llamar al callback con error cuando la query falla', (done) => {
      const dbError = new Error('ER_TABLE_NOT_FOUND: crops');
      dbError.code = 'ER_TABLE_NOT_FOUND';
      dbError.sqlMessage = 'Table does not exist';

      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(dbError, null);
        })
      };

      ReportModel.findCropWithCreator(mockConn, mockCropId, (err, cropData) => {
        expect(err).toBe(dbError);
        expect(cropData).toBeNull();
        done();
      });
    });

    it('la query debe hacer INNER JOIN entre crops y users', () => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findCropWithCreator(mockConn, mockCropId, () => {});

      const [query] = mockConn.query.mock.calls[0];
      expect(query.toLowerCase()).toContain('inner join');
      expect(query.toLowerCase()).toContain('users');
      expect(query.toLowerCase()).toContain('crops');
    });

    it('la query debe filtrar por WHERE c.id = ?', () => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findCropWithCreator(mockConn, mockCropId, () => {});

      const [query] = mockConn.query.mock.calls[0];
      expect(query).toContain('WHERE c.id = ?');
    });
  });

  // ==================== findWorkersByCrop ====================

  describe('findWorkersByCrop', () => {
    it('debe retornar array de trabajadores cuando existen', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, mockWorkers);
        })
      };

      ReportModel.findWorkersByCrop(mockConn, mockCropId, (err, workers) => {
        expect(err).toBeNull();
        expect(Array.isArray(workers)).toBe(true);
        expect(workers.length).toBe(2);
        expect(workers[0].nombre).toBe('Ana');
        done();
      });
    });

    it('debe retornar array vacío cuando no hay trabajadores', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findWorkersByCrop(mockConn, mockCropId, (err, workers) => {
        expect(err).toBeNull();
        expect(workers).toEqual([]);
        done();
      });
    });

    it('debe llamar al callback con error cuando la query falla', (done) => {
      const dbError = new Error('ER_ACCESS_DENIED');
      dbError.code = 'ER_ACCESS_DENIED';

      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(dbError, null);
        })
      };

      ReportModel.findWorkersByCrop(mockConn, mockCropId, (err, workers) => {
        expect(err).toBe(dbError);
        expect(workers).toBeNull();
        done();
      });
    });

    it('la query debe hacer INNER JOIN entre crop_workers y users', () => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findWorkersByCrop(mockConn, mockCropId, () => {});

      const [query] = mockConn.query.mock.calls[0];
      expect(query.toLowerCase()).toContain('inner join');
      expect(query.toLowerCase()).toContain('crop_workers');
      expect(query.toLowerCase()).toContain('users');
    });

    it('la query debe usar DISTINCT para evitar duplicados', () => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findWorkersByCrop(mockConn, mockCropId, () => {});

      const [query] = mockConn.query.mock.calls[0];
      expect(query.toLowerCase()).toContain('distinct');
    });

    it('la query debe filtrar por cultivo_id con el parámetro correcto', () => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findWorkersByCrop(mockConn, mockCropId, () => {});

      expect(mockConn.query).toHaveBeenCalledWith(
        expect.any(String),
        [mockCropId],
        expect.any(Function)
      );
    });

    it('debe retornar campos de usuario: id, nombre, apellido, rol, email, telefono', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, mockWorkers);
        })
      };

      ReportModel.findWorkersByCrop(mockConn, mockCropId, (err, workers) => {
        expect(err).toBeNull();
        expect(workers[0]).toHaveProperty('id');
        expect(workers[0]).toHaveProperty('nombre');
        expect(workers[0]).toHaveProperty('apellido');
        expect(workers[0]).toHaveProperty('rol');
        expect(workers[0]).toHaveProperty('email');
        done();
      });
    });
  });

  // ==================== findTasksByCrop ====================

  describe('findTasksByCrop', () => {
    it('debe retornar array de tareas cuando existen', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, mockTasks);
        })
      };

      ReportModel.findTasksByCrop(mockConn, mockCropId, (err, tasks) => {
        expect(err).toBeNull();
        expect(Array.isArray(tasks)).toBe(true);
        expect(tasks.length).toBe(1);
        expect(tasks[0].nombre).toBe('Riego');
        done();
      });
    });

    it('debe retornar array vacío cuando no hay tareas', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findTasksByCrop(mockConn, mockCropId, (err, tasks) => {
        expect(err).toBeNull();
        expect(tasks).toEqual([]);
        done();
      });
    });

    it('debe llamar al callback con error cuando la query falla', (done) => {
      const dbError = new Error('ER_NO_SUCH_TABLE');
      dbError.code = 'ER_NO_SUCH_TABLE';

      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(dbError, null);
        })
      };

      ReportModel.findTasksByCrop(mockConn, mockCropId, (err, tasks) => {
        expect(err).toBe(dbError);
        expect(tasks).toBeNull();
        done();
      });
    });

    it('la query debe usar LEFT JOIN para incluir tareas sin asignado', () => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findTasksByCrop(mockConn, mockCropId, () => {});

      const [query] = mockConn.query.mock.calls[0];
      expect(query.toLowerCase()).toContain('left join');
    });

    it('la query debe incluir nombre y apellido del asignado', () => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findTasksByCrop(mockConn, mockCropId, () => {});

      const [query] = mockConn.query.mock.calls[0];
      expect(query).toContain('asignado_nombre');
      expect(query).toContain('asignado_apellido');
    });

    it('la query debe ordenar por fecha_inicio', () => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findTasksByCrop(mockConn, mockCropId, () => {});

      const [query] = mockConn.query.mock.calls[0];
      expect(query.toLowerCase()).toContain('order by');
      expect(query.toLowerCase()).toContain('fecha_inicio');
    });
  });

  // ==================== findMeasurementsByCrop ====================

  describe('findMeasurementsByCrop', () => {
    it('debe retornar array de mediciones cuando existen', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, mockMeasurements);
        })
      };

      ReportModel.findMeasurementsByCrop(mockConn, mockCropId, (err, measurements) => {
        expect(err).toBeNull();
        expect(Array.isArray(measurements)).toBe(true);
        expect(measurements.length).toBe(1);
        expect(measurements[0].temperatura).toBe(25.5);
        done();
      });
    });

    it('debe retornar array vacío cuando no hay mediciones', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findMeasurementsByCrop(mockConn, mockCropId, (err, measurements) => {
        expect(err).toBeNull();
        expect(measurements).toEqual([]);
        done();
      });
    });

    it('debe llamar al callback con error cuando la query falla', (done) => {
      const dbError = new Error('ER_LOCK_WAIT_TIMEOUT');
      dbError.code = 'ER_LOCK_WAIT_TIMEOUT';

      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(dbError, null);
        })
      };

      ReportModel.findMeasurementsByCrop(mockConn, mockCropId, (err, measurements) => {
        expect(err).toBe(dbError);
        expect(measurements).toBeNull();
        done();
      });
    });

    it('la query debe usar LEFT JOIN para incluir mediciones sin usuario', () => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findMeasurementsByCrop(mockConn, mockCropId, () => {});

      const [query] = mockConn.query.mock.calls[0];
      expect(query.toLowerCase()).toContain('left join');
      expect(query.toLowerCase()).toContain('measurements');
    });

    it('la query debe ordenar por fecha_medicion ASC', () => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, []);
        })
      };

      ReportModel.findMeasurementsByCrop(mockConn, mockCropId, () => {});

      const [query] = mockConn.query.mock.calls[0];
      expect(query.toLowerCase()).toContain('order by');
      expect(query.toLowerCase()).toContain('fecha_medicion');
    });

    it('debe incluir nombre y apellido del usuario que tomó la medición', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, mockMeasurements);
        })
      };

      ReportModel.findMeasurementsByCrop(mockConn, mockCropId, (err, measurements) => {
        expect(err).toBeNull();
        expect(measurements[0].usuario_nombre).toBe('Ana');
        expect(measurements[0].usuario_apellido).toBe('López');
        done();
      });
    });

    it('debe retornar datos de medición: temperatura, humedad, ph_suelo, altura_plantas', (done) => {
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, mockMeasurements);
        })
      };

      ReportModel.findMeasurementsByCrop(mockConn, mockCropId, (err, measurements) => {
        expect(err).toBeNull();
        expect(measurements[0]).toHaveProperty('temperatura');
        expect(measurements[0]).toHaveProperty('humedad');
        expect(measurements[0]).toHaveProperty('ph_suelo');
        expect(measurements[0]).toHaveProperty('altura_plantas');
        done();
      });
    });
  });

  // ==================== CASOS EDGE ====================

  describe('Casos edge y manejo de datos', () => {
    it('findCropWithCreator retorna el primer resultado si hay múltiples (por ID único)', (done) => {
      const secondRow = { ...mockCropRow, id: 'otro-id' };
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          callback(null, [mockCropRow, secondRow]);
        })
      };

      ReportModel.findCropWithCreator(mockConn, mockCropId, (err, cropData) => {
        expect(err).toBeNull();
        expect(cropData.id).toBe(mockCropId);
        done();
      });
    });

    it('todos los métodos aceptan cropId como string (UUID)', (done) => {
      const uuidCropId = '550e8400-e29b-41d4-a716-446655440000';
      let callCount = 0;
      const mockConn = {
        query: jest.fn((query, params, callback) => {
          expect(params[0]).toBe(uuidCropId);
          callCount++;
          callback(null, []);
        })
      };

      ReportModel.findCropWithCreator(mockConn, uuidCropId, () => {
        ReportModel.findWorkersByCrop(mockConn, uuidCropId, () => {
          ReportModel.findTasksByCrop(mockConn, uuidCropId, () => {
            ReportModel.findMeasurementsByCrop(mockConn, uuidCropId, () => {
              expect(callCount).toBe(4);
              done();
            });
          });
        });
      });
    });
  });
});
