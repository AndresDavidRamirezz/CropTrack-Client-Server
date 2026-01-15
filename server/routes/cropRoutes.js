import { Router } from 'express';

import { generateId } from '../middleware/generateId.js';
import { validateCrop } from '../middleware/validateCrop.js';

import {
  createCrop,
  getCropsByUser,
  getCropById,
  updateCrop,
  deleteCrop
} from '../controllers/cropController.js';

const router = Router();

router.post('/', generateId, validateCrop, createCrop);

router.get('/user/:userId', getCropsByUser);

router.get('/:id', getCropById);

router.put('/:id', updateCrop);

router.delete('/:id', deleteCrop);

export default router;
