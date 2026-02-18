import { Router } from 'express';
import { generateCropReport } from '../controllers/reportController.js';

const router = Router();

// GET /api/reports/:cropId - Generar reporte PDF de una cosecha
router.get('/:cropId', generateCropReport);

export default router;
