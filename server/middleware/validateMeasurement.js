import { body, validationResult } from 'express-validator';

const tiposMedicion = [
  'temperatura',
  'humedad',
  'ph',
  'nutrientes',
  'altura',
  'peso',
  'rendimiento',
  'plaga',
  'enfermedad',
  'riego',
  'fertilizacion',
  'otro'
];

const unidadesValidas = [
  'celsius',
  'fahrenheit',
  'porcentaje',
  'ph',
  'kg',
  'g',
  'ton',
  'cm',
  'm',
  'litros',
  'ml',
  'unidades',
  'kg/ha',
  'ton/ha',
  'ppm',
  'otro'
];

export const validateMeasurement = [

  body('cultivo_id')
    .notEmpty()
    .withMessage('El ID del cultivo es obligatorio')
    .isLength({ min: 36, max: 36 })
    .withMessage('El ID del cultivo debe ser un UUID valido'),

  body('usuario_id')
    .notEmpty()
    .withMessage('El ID del usuario es obligatorio')
    .isLength({ min: 36, max: 36 })
    .withMessage('El ID del usuario debe ser un UUID valido'),

  body('tipo_medicion')
    .notEmpty()
    .withMessage('El tipo de medicion es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El tipo de medicion debe tener entre 2 y 50 caracteres')
    .trim(),

  body('valor')
    .notEmpty()
    .withMessage('El valor es obligatorio')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('El valor debe ser un numero decimal valido'),

  body('unidad')
    .notEmpty()
    .withMessage('La unidad es obligatoria')
    .isLength({ min: 1, max: 20 })
    .withMessage('La unidad debe tener entre 1 y 20 caracteres')
    .trim(),

  body('fecha_medicion')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha de medicion debe tener formato valido (YYYY-MM-DD o ISO8601)'),

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
      console.log('❌ [VALIDACION-MEASUREMENT] Errores encontrados:', errors.array());

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

    console.log('✅ [VALIDACION-MEASUREMENT] Todos los campos son validos');
    next();
  }
];
