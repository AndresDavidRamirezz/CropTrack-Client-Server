import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import dbConnection from './config/dbConfig.js';

import registerRoutes from './routes/registerRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import measurementRoutes from './routes/measurementRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cropWorkerRoutes from './routes/cropWorkerRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();


//Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
dbConnection(app);

console.log('✅ Conexión a MySQL configurada');

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CropTrack API' });
});

// Rutas de registro
app.use('/api/register', registerRoutes);
console.log('🚀 Rutas de registro registradas en /api/register');

// Rutas de login
app.use('/api/auth', loginRoutes);
console.log('🚀 Rutas de login registradas en /api/auth');

// Rutas de crop_workers (antes de crops para evitar conflictos con /:id)
app.use('/api/crops', cropWorkerRoutes);
console.log('🚀 Rutas de crop_workers registradas en /api/crops/:cropId/workers');

// Rutas de crops
app.use('/api/crops', cropRoutes);
console.log('🚀 Rutas de crops registradas en /api/crops');

// Rutas de measurements
app.use('/api/measurements', measurementRoutes);
console.log('🚀 Rutas de measurements registradas en /api/measurements');

// Rutas de tasks
app.use('/api/tasks', taskRoutes);
console.log('🚀 Rutas de tasks registradas en /api/tasks');

// Rutas de users
app.use('/api/users', userRoutes);
console.log('🚀 Rutas de users registradas en /api/users');

// Rutas de reports
app.use('/api/reports', reportRoutes);
console.log('🚀 Rutas de reports registradas en /api/reports');

const PORT = process.env.PORT || 4000;

// Error 404
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler global
app.use((err, req, res, next) => {
  const errorDetail = err?.stack || err?.message || JSON.stringify(err);
  console.error('❌ Error global:', errorDetail, '\nError completo:', err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

export default app;