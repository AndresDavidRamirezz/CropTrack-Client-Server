import { Router } from 'express';
import { generateCropReport } from '../controllers/reportController.js';

const router = Router();

// GET /api/reports/:cropId - Generar reporte PDF de una cosecha
router.get('/:cropId', (req, res, next) => {
  console.log('🔵 [REPORT-ROUTES] GET /api/reports/:cropId - Peticion recibida');
  console.log('🔵 [REPORT-ROUTES] Params:', req.params);
  console.log('🔵 [REPORT-ROUTES] IP:', req.ip);
  console.log('🔵 [REPORT-ROUTES] Timestamp:', new Date().toISOString());
  next();
}, generateCropReport);

export default router;
