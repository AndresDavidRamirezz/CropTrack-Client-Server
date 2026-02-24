// ==================== APP DE EXPRESS PARA TESTS DE INTEGRACIÓN ====================
import express from 'express';
import cors from 'cors';
import myConnection from 'express-myconnection';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Rutas
import registerRoutes from '../../routes/registerRoutes.js';
import loginRoutes from '../../routes/loginRoutes.js';

// Pool de conexiones global para poder cerrarlo después
let pool = null;

// Configuración de base de datos de TEST (desde .env.test)
const dbOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'croptrack_test'
};

// Crear app de Express para tests
const createTestApp = () => {
  const app = express();

  // Crear pool si no existe
  if (!pool) {
    pool = mysql.createPool(dbOptions);
  }

  // Middlewares
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());

  // Conexión a base de datos de TEST usando el pool creado
  app.use(myConnection(mysql, dbOptions, 'pool'));

  // Ruta de prueba
  app.get('/', (req, res) => {
    res.json({ message: 'CropTrack API - Test Environment' });
  });

  // Rutas
  app.use('/api/register', registerRoutes);
  app.use('/api/auth', loginRoutes);

  // Error 404
  app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
  });

  // Error handler global
  app.use((err, req, res, next) => {
    res.status(500).json({
      message: 'Something went wrong!',
      error: err.message
    });
  });

  return app;
};

// Cerrar pool de conexiones de express-myconnection
export const closeExpressPool = () => {
  return new Promise((resolve) => {
    if (pool) {
      pool.end(() => {
        pool = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
};

export default createTestApp;
