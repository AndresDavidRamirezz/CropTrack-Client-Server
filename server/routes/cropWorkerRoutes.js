import { Router } from 'express';
import { getCropWorkers, setCropWorkers } from '../controllers/cropWorkerController.js';

const router = Router();

// GET /api/crops/:cropId/workers - Obtener workers asignados a una cosecha
router.get('/:cropId/workers', getCropWorkers);

// PUT /api/crops/:cropId/workers - Asignar workers a una cosecha
router.put('/:cropId/workers', setCropWorkers);

export default router;
