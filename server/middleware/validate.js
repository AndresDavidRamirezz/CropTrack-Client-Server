import { body, validationResult } from 'express-validator';

export const validate = [
  
  body('usuario')
    .notEmpty()
    .withMessage('El nombre de usuario es obligatorio')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guion bajo')
    .trim(),

  body('contrasena')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 6, max: 100 })
    .withMessage('La contraseña debe tener entre 6 y 100 caracteres'),

  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios')
    .trim(),

  body('apellido')
    .notEmpty()
    .withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios')
    .trim(),

  body('email')
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El formato del email no es válido')
    .isLength({ max: 100 })
    .withMessage('El email no puede exceder los 100 caracteres')
    .normalizeEmail(), // Convierte a minúsculas automáticamente

  body('nombre_empresa')
    .notEmpty()
    .withMessage('El nombre de la empresa es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre de la empresa debe tener entre 2 y 100 caracteres')
    .trim(),

  body('telefono')
    .optional({ nullable: true, checkFalsy: true }) // Permite null, undefined o string vacío
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede exceder los 20 caracteres')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('El teléfono solo puede contener números, +, -, espacios y paréntesis')
    .trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      console.log('❌ [VALIDACIÓN] Errores encontrados:', errors.array());
      
      // Formatear errores para el frontend
      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        message: 'Error de validación',
        errors: formattedErrors
      });
    }

    console.log('✅ [VALIDACIÓN] Todos los campos son válidos');
    next();
  }
];