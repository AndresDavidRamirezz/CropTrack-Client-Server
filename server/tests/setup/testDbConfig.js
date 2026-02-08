// ==================== CONFIGURACIÓN DE BASE DE DATOS PARA TESTS ====================
import mysql from 'mysql2/promise';

// Configuración hardcodeada para tests (evita problemas con import.meta.url)
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'proyectofinal2024',
  database: 'croptrack_test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones para tests
let pool = null;

// Crear pool de conexiones
export const createTestPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

// Obtener conexión del pool
export const getTestConnection = async () => {
  const testPool = createTestPool();
  return await testPool.getConnection();
};

// Limpiar tabla users (para tests)
export const clearUsersTable = async () => {
  const connection = await getTestConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    connection.release();
  }
};

// Limpiar todas las tablas (para tests)
export const clearAllTables = async () => {
  const connection = await getTestConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE tasks');
    await connection.query('TRUNCATE TABLE measurements');
    await connection.query('TRUNCATE TABLE crops');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    connection.release();
  }
};

// Cerrar pool de conexiones
export const closeTestPool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

// Verificar conexión a la base de datos de test
export const verifyTestDbConnection = async () => {
  try {
    const connection = await getTestConnection();
    await connection.query('SELECT 1');
    connection.release();
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  createTestPool,
  getTestConnection,
  clearUsersTable,
  clearAllTables,
  closeTestPool,
  verifyTestDbConnection,
  dbConfig
};
