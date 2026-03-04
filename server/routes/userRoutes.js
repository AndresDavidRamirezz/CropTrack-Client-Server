import { Router } from 'express';
import multer from 'multer';
import { generateId } from '../middleware/generateId.js';
import { validateUser } from '../middleware/validateUser.js';
import { validateUserUpdate } from '../middleware/validateUserUpdate.js';
import {
  createUser,
  getUsersByEmpresa,
  getUserById,
  updateUser,
  deleteUser,
  uploadImage,
  deleteImage
} from '../controllers/userController.js';
import multerService from '../services/multerService.js';

const router = Router();

// POST /api/users - Crear trabajador/supervisor
router.post('/', generateId, validateUser, createUser);

// GET /api/users/empresa/:empresa - Listar workers de la empresa
router.get('/empresa/:empresa', getUsersByEmpresa);

// PUT /api/users/:id/image - Subir/actualizar imagen
router.put('/:id/image', multerService.createUpload('users').single('image'), uploadImage);

// DELETE /api/users/:id/image - Eliminar imagen
router.delete('/:id/image', deleteImage);

// GET /api/users/:id - Obtener un usuario por ID
router.get('/:id', getUserById);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', validateUserUpdate, updateUser);

// DELETE /api/users/:id - Eliminar un worker
router.delete('/:id', deleteUser);

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
  // Capturar cualquier otro error (Cloudinary, red, etc.) y loguearlo en detalle
  const errorDetail = err?.stack || err?.message || JSON.stringify(err);
  console.error('❌ [USER-ROUTES] Error en upload de imagen:', errorDetail, '\nError completo:', err);
  return res.status(500).json({ error: 'Error al subir la imagen. Revisá los logs del servidor.' });
});

export default router;
