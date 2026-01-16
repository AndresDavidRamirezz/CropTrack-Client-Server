import { Router } from 'express';

import { generateId } from '../middleware/generateId.js';
import { validateMeasurement } from '../middleware/validateMeasurement.js';

import {
  createMeasurement,
  getMeasurementsByUser,
  getMeasurementsByCrop,
  getMeasurementById,
  updateMeasurement,
  deleteMeasurement
} from '../controllers/measurementController.js';

const router = Router();

router.post('/', generateId, validateMeasurement, createMeasurement);

router.get('/user/:userId', getMeasurementsByUser);

router.get('/crop/:cropId', getMeasurementsByCrop);

router.get('/:id', getMeasurementById);

router.put('/:id', updateMeasurement);

router.delete('/:id', deleteMeasurement);

export default router;