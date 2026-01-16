import { Router } from 'express';

import { generateId } from '../middleware/generateId.js';
import { validateTask } from '../middleware/validateTask.js';

import {
  createTask,
  getTasksByUser,
  getTasksByAssignee,
  getTasksByCrop,
  getTaskById,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';

const router = Router();

router.post('/', generateId, validateTask, createTask);

router.get('/user/:userId', getTasksByUser);

router.get('/assigned/:userId', getTasksByAssignee);

router.get('/crop/:cropId', getTasksByCrop);

router.get('/:id', getTaskById);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

export default router;
