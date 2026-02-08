// ==================== APP DE EXPRESS PARA TESTS DE INTEGRACIÓN ====================
import express from 'express';
import cors from 'cors';
import myConnection from 'express-myconnection';
import mysql from 'mysql2';

// Rutas
import registerRoutes from '../../routes/registerRoutes.js';
import loginRoutes from '../../routes/loginRoutes.js';

// Pool de conexiones global para poder cerrarlo después
let pool = null;

// Configuración de base de datos de TEST (hardcodeada para evitar import.meta.url)
const dbOptions = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'proyectofinal2024',
  database: 'croptrack_test'
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
