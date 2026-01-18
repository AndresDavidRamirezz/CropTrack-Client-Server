import { Router } from 'express';
import { generateId } from '../middleware/generateId.js';
import { validateUser } from '../middleware/validateUser.js';
import { validateUserUpdate } from '../middleware/validateUserUpdate.js';
import {
  createUser,
  getUsersByEmpresa,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

const router = Router();

// POST /api/users - Crear trabajador/supervisor
router.post('/', generateId, validateUser, createUser);

// GET /api/users/empresa/:empresa - Listar workers de la empresa
router.get('/empresa/:empresa', getUsersByEmpresa);

// GET /api/users/:id - Obtener un usuario por ID
router.get('/:id', getUserById);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', validateUserUpdate, updateUser);

// DELETE /api/users/:id - Eliminar un worker
router.delete('/:id', deleteUser);

export default router;
