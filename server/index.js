import express from 'express';
import cors from 'cors';

import dbConnection from './config/dbConfig.js';

import registerRoutes from './routes/registerRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import cropRoutes from './routes/cropRoutes.js';

const app = express();


//Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
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

// Rutas de crops
app.use('/api/crops', cropRoutes);
console.log('🚀 Rutas de crops registradas en /api/crops');

const PORT = process.env.PORT || 4000;

// Error 404
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

export default app;