import { body, validationResult } from 'express-validator';

export const validateUserUpdate = [

  body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios')
    .trim(),

  body('apellido')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('El formato del email no es valido')
    .isLength({ max: 100 })
    .withMessage('El email no puede exceder los 100 caracteres')
    .normalizeEmail(),

  body('telefono')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 20 })
    .withMessage('El telefono no puede exceder los 20 caracteres')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('El telefono solo puede contener numeros, +, -, espacios y parentesis')
    .trim(),

  body('contrasena')
    .optional()
    .isLength({ min: 6, max: 100 })
    .withMessage('La contrasena debe tener entre 6 y 100 caracteres'),

  // Rechazar campos no permitidos
  body('id')
    .not().exists()
    .withMessage('No se puede modificar el ID'),

  body('nombre_usuario')
    .not().exists()
    .withMessage('No se puede modificar el nombre de usuario'),

  body('usuario')
    .not().exists()
    .withMessage('No se puede modificar el nombre de usuario'),

  body('empresa')
    .not().exists()
    .withMessage('No se puede modificar la empresa'),

  body('rol')
    .not().exists()
    .withMessage('No se puede modificar el rol'),

  body('imagen_url')
    .not().exists()
    .withMessage('Usar el endpoint PUT /:id/image para cambiar la imagen de perfil'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('❌ [VALIDACION-USER-UPDATE] Errores encontrados:', errors.array());

      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        message: 'Error de validacion',
        errors: formattedErrors
      });
    }

    console.log('✅ [VALIDACION-USER-UPDATE] Todos los campos son validos');
    next();
  }
];
