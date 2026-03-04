import { Router } from 'express';
import multer from 'multer';

import { generateId } from '../middleware/generateId.js';
import { validateTask } from '../middleware/validateTask.js';

import {
  createTask,
  getTasksByUser,
  getTasksByAssignee,
  getTasksByCrop,
  getTaskById,
  updateTask,
  deleteTask,
  uploadImage,
  deleteImage
} from '../controllers/taskController.js';
import multerService from '../services/multerService.js';

const router = Router();

router.post('/', generateId, validateTask, createTask);

router.get('/user/:userId', getTasksByUser);

router.get('/assigned/:userId', getTasksByAssignee);

router.get('/crop/:cropId', getTasksByCrop);

// PUT /api/tasks/:id/image - Subir/actualizar imagen
router.put('/:id/image', multerService.createUpload('tasks').single('image'), uploadImage);

// DELETE /api/tasks/:id/image - Eliminar imagen
router.delete('/:id/image', deleteImage);

router.get('/:id', getTaskById);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

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
  console.error('❌ [TASK-ROUTES] Error en upload de imagen:', errorDetail, '\nError completo:', err);
  return res.status(500).json({ error: 'Error al subir la imagen. Revisá los logs del servidor.' });
});

export default router;
