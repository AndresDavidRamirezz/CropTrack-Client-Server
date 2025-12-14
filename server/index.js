import express from 'express';
import cors from 'cors';

import dbConnection from './config/dbConfig.js';

console.log('\n========================================');
console.log('🚀 CROPTRACK SERVER - INICIANDO');
console.log('========================================\n');

const app = express();

// Middlewares
console.log('⚙️  Configurando middlewares...');
app.use(cors({
  origin: 'http://localhost:3000', // URL de tu frontend React
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('✅ CORS configurado: http://localhost:3000');

app.use(express.json());
console.log('✅ Body parser (JSON) configurado');

dbConnection(app);

console.log('\n📋 Registrando rutas...');

// Rutas
app.get('/', (req, res) => {
  res.send('API RESTful de CropTrack Funcionando');
});
console.log('✅ Ruta raíz registrada en /');

// Puerto
const PORT = 4000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(`✅ SERVIDOR CORRIENDO EN PUERTO ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('========================================\n');
});

// Exportar app para pruebas
export default app;