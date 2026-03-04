import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinaryConfig.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan: JPEG, PNG, GIF, WEBP'), false);
  }
};

// Crea una instancia de multer configurada para una subcarpeta en Cloudinary
// El public_id se toma del parámetro :id de la ruta, así cada entidad tiene
// exactamente un slot en Cloudinary que se sobreescribe al actualizar.
const createUpload = (subfolder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req) => ({
      folder: `croptrack/${subfolder}`,
      public_id: req.params.id,
      overwrite: true,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      resource_type: 'image'
    })
  });

  return multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });
};

// Elimina una imagen de Cloudinary dado su URL completa
const deleteFile = async (imageUrl) => {
  if (!imageUrl) return;

  // Extrae el public_id de la URL de Cloudinary
  // Formato: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
  const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  if (!match) return;

  const publicId = match[1];

  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ [MULTER-SERVICE] Imagen eliminada de Cloudinary:', publicId);
  } catch (err) {
    console.warn('⚠️ [MULTER-SERVICE] Error al eliminar imagen de Cloudinary:', err.message);
  }
};

const multerService = {
  createUpload,
  deleteFile
};

export default multerService;
