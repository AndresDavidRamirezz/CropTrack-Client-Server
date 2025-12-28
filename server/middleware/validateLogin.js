import { body, validationResult } from 'express-validator';

export const validateLogin = [
  
  body('usuario')
    .notEmpty()
    .withMessage('El nombre de usuario es obligatorio')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .trim(),

  body('contrasena')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),

  body('rol')
    .optional()
    .isIn(['administrador', 'supervisor', 'trabajador'])
    .withMessage('El rol debe ser: administrador, supervisor o trabajador')
    .toLowerCase(),

  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      console.log('❌ [VALIDACIÓN-LOGIN] Errores encontrados:', errors.array());
      
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

    console.log('✅ [VALIDACIÓN-LOGIN] Credenciales válidas');
    next();
  }
];