import { v2 as cloudinary } from 'cloudinary';

console.log('☁️ [CLOUDINARY-CONFIG] Verificando variables de entorno:', {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? '✅ presente' : '❌ FALTA',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '✅ presente' : '❌ FALTA',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✅ presente' : '❌ FALTA'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
