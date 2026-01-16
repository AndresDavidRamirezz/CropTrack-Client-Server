import React, { useState, useEffect } from 'react';
import './MeasurementForm.css';

const TIPOS_MEDICION = [
  { value: '', label: 'Seleccionar tipo...' },
  { value: 'temperatura', label: 'Temperatura' },
  { value: 'humedad', label: 'Humedad' },
  { value: 'ph', label: 'pH' },
  { value: 'nutrientes', label: 'Nutrientes' },
  { value: 'altura', label: 'Altura' },
  { value: 'peso', label: 'Peso' },
  { value: 'rendimiento', label: 'Rendimiento' },
  { value: 'plaga', label: 'Plaga' },
  { value: 'enfermedad', label: 'Enfermedad' },
  { value: 'riego', label: 'Riego' },
  { value: 'fertilizacion', label: 'Fertilizacion' },
  { value: 'otro', label: 'Otro' }
];

const UNIDADES = [
  { value: '', label: 'Seleccionar unidad...' },
  { value: 'celsius', label: 'Celsius (C)' },
  { value: 'fahrenheit', label: 'Fahrenheit (F)' },
  { value: 'porcentaje', label: 'Porcentaje (%)' },
  { value: 'ph', label: 'pH' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'ton', label: 'Toneladas (ton)' },
  { value: 'cm', label: 'Centimetros (cm)' },
  { value: 'm', label: 'Metros (m)' },
  { value: 'litros', label: 'Litros (L)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'unidades', label: 'Unidades' },
  { value: 'kg/ha', label: 'kg/hectarea' },
  { value: 'ton/ha', label: 'ton/hectarea' },
  { value: 'ppm', label: 'PPM' },
  { value: 'otro', label: 'Otro' }
];

const initialFormState = {
  cultivo_id: '',
  tipo_medicion: '',
  valor: '',
  unidad: '',
  fecha_medicion: '',
  observaciones: ''
};

const MeasurementForm = ({ onSubmit, initialData, crops, onCancel, loading }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        cultivo_id: initialData.cultivo_id || '',
        tipo_medicion: initialData.tipo_medicion || '',
        valor: initialData.valor || '',
        unidad: initialData.unidad || '',
        fecha_medicion: initialData.fecha_medicion?.split('T')[0] || '',
        observaciones: initialData.observaciones || ''
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cultivo_id) {
      newErrors.cultivo_id = 'El cultivo es obligatorio';
    }

    if (!formData.tipo_medicion) {
      newErrors.tipo_medicion = 'El tipo de medicion es obligatorio';
    }

    if (!formData.valor) {
      newErrors.valor = 'El valor es obligatorio';
    } else if (isNaN(parseFloat(formData.valor))) {
      newErrors.valor = 'El valor debe ser un numero valido';
    }

    if (!formData.unidad) {
      newErrors.unidad = 'La unidad es obligatoria';
    }

    if (formData.observaciones && formData.observaciones.length > 5000) {
      newErrors.observaciones = 'Las observaciones no pueden exceder 5000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dataToSubmit = {
      ...formData,
      valor: parseFloat(formData.valor),
      fecha_medicion: formData.fecha_medicion || null,
      observaciones: formData.observaciones || null
    };

    if (isEditing) {
      onSubmit(initialData.id, dataToSubmit);
    } else {
      onSubmit(dataToSubmit);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    if (onCancel) onCancel();
  };

  // Obtener nombre del cultivo por ID
  const getCropName = (cropId) => {
    const crop = crops?.find(c => c.id === cropId);
    return crop ? crop.nombre : '';
  };

  return (
    <div className="measurement-form-container">
      <div className="measurement-form-header">
        <h2>{isEditing ? 'Editar Medicion' : 'Nueva Medicion'}</h2>
        {isEditing && (
          <span className="editing-badge">Editando medicion de: {getCropName(initialData.cultivo_id)}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="measurement-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cultivo_id" className="form-label">
              Cultivo <span className="required">*</span>
            </label>
            <select
              id="cultivo_id"
              name="cultivo_id"
              value={formData.cultivo_id}
              onChange={handleChange}
              className={`form-input form-select ${errors.cultivo_id ? 'input-error' : ''}`}
              disabled={loading}
            >
              <option value="">Seleccionar cultivo...</option>
              {crops?.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.nombre} - {crop.tipo}
                </option>
              ))}
            </select>
            {errors.cultivo_id && <span className="error-text">{errors.cultivo_id}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="tipo_medicion" className="form-label">
              Tipo de Medicion <span className="required">*</span>
            </label>
            <select
              id="tipo_medicion"
              name="tipo_medicion"
              value={formData.tipo_medicion}
              onChange={handleChange}
              className={`form-input form-select ${errors.tipo_medicion ? 'input-error' : ''}`}
              disabled={loading}
            >
              {TIPOS_MEDICION.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            {errors.tipo_medicion && <span className="error-text">{errors.tipo_medicion}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="valor" className="form-label">
              Valor <span className="required">*</span>
            </label>
            <input
              type="number"
              id="valor"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              className={`form-input ${errors.valor ? 'input-error' : ''}`}
              placeholder="Ej: 25.5"
              disabled={loading}
              step="0.01"
            />
            {errors.valor && <span className="error-text">{errors.valor}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="unidad" className="form-label">
              Unidad <span className="required">*</span>
            </label>
            <select
              id="unidad"
              name="unidad"
              value={formData.unidad}
              onChange={handleChange}
              className={`form-input form-select ${errors.unidad ? 'input-error' : ''}`}
              disabled={loading}
            >
              {UNIDADES.map(unidad => (
                <option key={unidad.value} value={unidad.value}>
                  {unidad.label}
                </option>
              ))}
            </select>
            {errors.unidad && <span className="error-text">{errors.unidad}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha_medicion" className="form-label">Fecha de Medicion</label>
            <input
              type="date"
              id="fecha_medicion"
              name="fecha_medicion"
              value={formData.fecha_medicion}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="observaciones" className="form-label">Observaciones</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className={`form-input form-textarea ${errors.observaciones ? 'input-error' : ''}`}
            placeholder="Observaciones adicionales sobre la medicion..."
            disabled={loading}
            rows={4}
          />
          {errors.observaciones && <span className="error-text">{errors.observaciones}</span>}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="btn-form btn-cancel"
            disabled={loading}
          >
            {isEditing ? 'Cancelar' : 'Limpiar'}
          </button>
          <button
            type="submit"
            className="btn-form btn-submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Medicion'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeasurementForm;
