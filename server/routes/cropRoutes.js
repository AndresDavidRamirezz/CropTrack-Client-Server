import { Router } from 'express';
import multer from 'multer';

import { generateId } from '../middleware/generateId.js';
import { validateCrop } from '../middleware/validateCrop.js';

import {
  createCrop,
  getCropsByUser,
  getCropById,
  updateCrop,
  deleteCrop,
  uploadImage,
  deleteImage
} from '../controllers/cropController.js';
import multerService from '../services/multerService.js';

const router = Router();

router.post('/', generateId, validateCrop, createCrop);

router.get('/user/:userId', getCropsByUser);

// PUT /api/crops/:id/image - Subir/actualizar imagen
router.put('/:id/image', multerService.createUpload('crops').single('image'), uploadImage);

// DELETE /api/crops/:id/image - Eliminar imagen
router.delete('/:id/image', deleteImage);

router.get('/:id', getCropById);

router.put('/:id', updateCrop);

router.delete('/:id', deleteCrop);

// Manejo de errores de Multer y Cloudinary
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo excede el tamaño máximo de 5MB' });
    }
    return res.status(400).json({ error: `Error de archivo: ${err.message}` });
  }
  if (err.message && err.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ error: err.message });
  }
  // Errores de Cloudinary (objeto con http_code en lugar de Error estándar)
  if (err && (err.http_code || err.error?.http_code)) {
    const code = err.http_code || err.error?.http_code;
    const msg = err.message || err.error?.message || 'Error al conectar con el servicio de imágenes';
    console.error('❌ [CROP-ROUTES] Error de Cloudinary:', code, msg);
    return res.status(500).json({ error: `Error de Cloudinary (${code}): ${msg}` });
  }
  next(err);
});

export default router;
