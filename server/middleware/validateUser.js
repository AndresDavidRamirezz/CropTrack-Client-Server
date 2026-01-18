import { body, validationResult } from 'express-validator';

const rolesValidos = ['trabajador', 'supervisor'];

export const validateUser = [

  body('usuario')
    .notEmpty()
    .withMessage('El nombre de usuario es obligatorio')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, numeros y guion bajo')
    .trim(),

  body('contrasena')
    .notEmpty()
    .withMessage('La contrasena es obligatoria')
    .isLength({ min: 6, max: 100 })
    .withMessage('La contrasena debe tener entre 6 y 100 caracteres'),

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
    .withMessage('El formato del email no es valido')
    .isLength({ max: 100 })
    .withMessage('El email no puede exceder los 100 caracteres')
    .normalizeEmail(),

  body('empresa')
    .notEmpty()
    .withMessage('La empresa es obligatoria')
    .isLength({ min: 2, max: 100 })
    .withMessage('La empresa debe tener entre 2 y 100 caracteres')
    .trim(),

  body('telefono')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 20 })
    .withMessage('El telefono no puede exceder los 20 caracteres')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('El telefono solo puede contener numeros, +, -, espacios y parentesis')
    .trim(),

  body('rol')
    .notEmpty()
    .withMessage('El rol es obligatorio')
    .isIn(rolesValidos)
    .withMessage(`El rol debe ser uno de: ${rolesValidos.join(', ')}`),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('❌ [VALIDACION-USER] Errores encontrados:', errors.array());

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

    console.log('✅ [VALIDACION-USER] Todos los campos son validos');
    next();
  }
];
