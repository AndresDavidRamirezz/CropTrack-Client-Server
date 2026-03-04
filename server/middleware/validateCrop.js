import { body, validationResult } from 'express-validator';

const estadosValidos = ['planificado', 'sembrado', 'en_crecimiento', 'maduro', 'cosechado', 'cancelado'];

export const validateCrop = [

  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la cosecha es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),

  body('empresa')
    .notEmpty()
    .withMessage('La empresa es obligatoria')
    .isLength({ min: 2, max: 100 })
    .withMessage('La empresa debe tener entre 2 y 100 caracteres')
    .trim(),

  body('tipo')
    .notEmpty()
    .withMessage('El tipo de cultivo es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El tipo debe tener entre 2 y 50 caracteres')
    .trim(),

  body('variedad')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage('La variedad no puede exceder los 100 caracteres')
    .trim(),

  body('area_hectareas')
    .optional({ nullable: true, checkFalsy: true })
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('El área debe ser un número decimal válido')
    .custom((value) => {
      if (value && parseFloat(value) < 0) {
        throw new Error('El área no puede ser negativa');
      }
      return true;
    }),

  body('ubicacion')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage('La ubicación no puede exceder los 200 caracteres')
    .trim(),

  body('fecha_siembra')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha de siembra debe tener formato válido (YYYY-MM-DD)'),

  body('fecha_cosecha_estimada')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha de cosecha estimada debe tener formato válido (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && req.body.fecha_siembra) {
        const fechaSiembra = new Date(req.body.fecha_siembra);
        const fechaCosecha = new Date(value);
        if (fechaCosecha < fechaSiembra) {
          throw new Error('La fecha de cosecha estimada no puede ser anterior a la fecha de siembra');
        }
      }
      return true;
    }),

  body('fecha_cosecha_real')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha de cosecha real debe tener formato válido (YYYY-MM-DD)'),

  body('estado')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(estadosValidos)
    .withMessage(`El estado debe ser uno de: ${estadosValidos.join(', ')}`),

  body('notas')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 5000 })
    .withMessage('Las notas no pueden exceder los 5000 caracteres')
    .trim(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('❌ [VALIDACIÓN-CROP] Errores encontrados:', errors.array());

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

    console.log('✅ [VALIDACIÓN-CROP] Todos los campos son válidos');
    next();
  }
];
