import { Router } from 'express';
import { createAdmin } from '../controllers/registerController.js';
import { validate } from '../middleware/validate.js';
import { generateId } from '../middleware/generateId.js';

const router = Router();

router.post('/register-admin', validate, generateId, createAdmin);

export default router;