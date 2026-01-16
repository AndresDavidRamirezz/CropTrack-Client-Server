import { body, validationResult } from 'express-validator';

const prioridadesValidas = ['baja', 'media', 'alta', 'urgente'];
const estadosValidos = ['pendiente', 'en_proceso', 'completada', 'cancelada'];

export const validateTask = [

  body('empresa')
    .notEmpty()
    .withMessage('La empresa es obligatoria')
    .isLength({ min: 2, max: 100 })
    .withMessage('La empresa debe tener entre 2 y 100 caracteres')
    .trim(),

  body('creado_por')
    .notEmpty()
    .withMessage('El ID del creador es obligatorio')
    .isLength({ min: 36, max: 36 })
    .withMessage('El ID del creador debe ser un UUID valido'),

  body('titulo')
    .notEmpty()
    .withMessage('El titulo es obligatorio')
    .isLength({ min: 3, max: 150 })
    .withMessage('El titulo debe tener entre 3 y 150 caracteres')
    .trim(),

  body('cultivo_id')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 36, max: 36 })
    .withMessage('El ID del cultivo debe ser un UUID valido'),

  body('asignado_a')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 36, max: 36 })
    .withMessage('El ID del asignado debe ser un UUID valido'),

  body('descripcion')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 5000 })
    .withMessage('La descripcion no puede exceder los 5000 caracteres')
    .trim(),

  body('prioridad')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(prioridadesValidas)
    .withMessage(`La prioridad debe ser una de: ${prioridadesValidas.join(', ')}`),

  body('estado')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(estadosValidos)
    .withMessage(`El estado debe ser uno de: ${estadosValidos.join(', ')}`),

  body('fecha_inicio')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha de inicio debe tener formato valido (YYYY-MM-DD)'),

  body('fecha_limite')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha limite debe tener formato valido (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && req.body.fecha_inicio) {
        const fechaInicio = new Date(req.body.fecha_inicio);
        const fechaLimite = new Date(value);
        if (fechaLimite < fechaInicio) {
          throw new Error('La fecha limite no puede ser anterior a la fecha de inicio');
        }
      }
      return true;
    }),

  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 5000 })
    .withMessage('Las observaciones no pueden exceder los 5000 caracteres')
    .trim(),

  body('imagen_url')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage('La URL de la imagen no puede exceder los 255 caracteres')
    .trim(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('❌ [VALIDACION-TASK] Errores encontrados:', errors.array());

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

    console.log('✅ [VALIDACION-TASK] Todos los campos son validos');
    next();
  }
];
