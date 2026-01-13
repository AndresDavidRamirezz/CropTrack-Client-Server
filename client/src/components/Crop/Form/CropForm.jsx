import React, { useState, useEffect } from 'react';
import './CropForm.css';

const TIPOS_CULTIVO = [
  { value: '', label: 'Seleccionar tipo...' },
  { value: 'hortaliza', label: 'Hortaliza' },
  { value: 'fruta', label: 'Fruta' },
  { value: 'cereal', label: 'Cereal' },
  { value: 'legumbre', label: 'Legumbre' },
  { value: 'tuberculo', label: 'Tubérculo' },
  { value: 'otro', label: 'Otro' }
];

const ESTADOS_CULTIVO = [
  { value: 'planificado', label: 'Planificado' },
  { value: 'sembrado', label: 'Sembrado' },
  { value: 'en_crecimiento', label: 'En Crecimiento' },
  { value: 'maduro', label: 'Maduro' },
  { value: 'cosechado', label: 'Cosechado' },
  { value: 'cancelado', label: 'Cancelado' }
];

const initialFormState = {
  nombre: '',
  tipo: '',
  variedad: '',
  area_hectareas: '',
  ubicacion: '',
  fecha_siembra: '',
  fecha_cosecha_estimada: '',
  estado: 'planificado',
  notas: ''
};

const CropForm = ({ onSubmit, initialData, onCancel, loading }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        tipo: initialData.tipo || '',
        variedad: initialData.variedad || '',
        area_hectareas: initialData.area_hectareas || '',
        ubicacion: initialData.ubicacion || '',
        fecha_siembra: initialData.fecha_siembra?.split('T')[0] || '',
        fecha_cosecha_estimada: initialData.fecha_cosecha_estimada?.split('T')[0] || '',
        estado: initialData.estado || 'planificado',
        notas: initialData.notas || ''
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

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'El tipo es obligatorio';
    }

    if (formData.variedad && formData.variedad.length > 100) {
      newErrors.variedad = 'La variedad no puede exceder 100 caracteres';
    }

    if (formData.area_hectareas && formData.area_hectareas < 0) {
      newErrors.area_hectareas = 'El área no puede ser negativa';
    }

    if (formData.ubicacion && formData.ubicacion.length > 200) {
      newErrors.ubicacion = 'La ubicación no puede exceder 200 caracteres';
    }

    if (formData.fecha_siembra && formData.fecha_cosecha_estimada) {
      if (new Date(formData.fecha_cosecha_estimada) < new Date(formData.fecha_siembra)) {
        newErrors.fecha_cosecha_estimada = 'La fecha de cosecha debe ser posterior a la siembra';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dataToSubmit = {
      ...formData,
      area_hectareas: formData.area_hectareas ? parseFloat(formData.area_hectareas) : null,
      fecha_siembra: formData.fecha_siembra || null,
      fecha_cosecha_estimada: formData.fecha_cosecha_estimada || null,
      variedad: formData.variedad || null,
      ubicacion: formData.ubicacion || null,
      notas: formData.notas || null
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

  return (
    <div className="crop-form-container">
      <div className="crop-form-header">
        <h2>{isEditing ? 'Editar Cosecha' : 'Nueva Cosecha'}</h2>
        {isEditing && (
          <span className="editing-badge">Editando: {initialData.nombre}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="crop-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">
              Nombre <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`form-input ${errors.nombre ? 'input-error' : ''}`}
              placeholder="Ej: Maíz temporada 2024"
              disabled={loading}
              maxLength={100}
            />
            {errors.nombre && <span className="error-text">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="tipo" className="form-label">
              Tipo <span className="required">*</span>
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className={`form-input form-select ${errors.tipo ? 'input-error' : ''}`}
              disabled={loading}
            >
              {TIPOS_CULTIVO.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            {errors.tipo && <span className="error-text">{errors.tipo}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="variedad" className="form-label">Variedad</label>
            <input
              type="text"
              id="variedad"
              name="variedad"
              value={formData.variedad}
              onChange={handleChange}
              className={`form-input ${errors.variedad ? 'input-error' : ''}`}
              placeholder="Ej: Híbrido DK-7088"
              disabled={loading}
              maxLength={100}
            />
            {errors.variedad && <span className="error-text">{errors.variedad}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="estado" className="form-label">Estado</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="form-input form-select"
              disabled={loading}
            >
              {ESTADOS_CULTIVO.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="area_hectareas" className="form-label">Área (hectáreas)</label>
            <input
              type="number"
              id="area_hectareas"
              name="area_hectareas"
              value={formData.area_hectareas}
              onChange={handleChange}
              className={`form-input ${errors.area_hectareas ? 'input-error' : ''}`}
              placeholder="Ej: 15.5"
              disabled={loading}
              min="0"
              step="0.01"
            />
            {errors.area_hectareas && <span className="error-text">{errors.area_hectareas}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="ubicacion" className="form-label">Ubicación</label>
            <input
              type="text"
              id="ubicacion"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              className={`form-input ${errors.ubicacion ? 'input-error' : ''}`}
              placeholder="Ej: Parcela Norte, Lote 3"
              disabled={loading}
              maxLength={200}
            />
            {errors.ubicacion && <span className="error-text">{errors.ubicacion}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha_siembra" className="form-label">Fecha de Siembra</label>
            <input
              type="date"
              id="fecha_siembra"
              name="fecha_siembra"
              value={formData.fecha_siembra}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha_cosecha_estimada" className="form-label">Fecha Cosecha Estimada</label>
            <input
              type="date"
              id="fecha_cosecha_estimada"
              name="fecha_cosecha_estimada"
              value={formData.fecha_cosecha_estimada}
              onChange={handleChange}
              className={`form-input ${errors.fecha_cosecha_estimada ? 'input-error' : ''}`}
              disabled={loading}
            />
            {errors.fecha_cosecha_estimada && (
              <span className="error-text">{errors.fecha_cosecha_estimada}</span>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="notas" className="form-label">Notas</label>
          <textarea
            id="notas"
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            className="form-input form-textarea"
            placeholder="Notas adicionales sobre el cultivo..."
            disabled={loading}
            rows={4}
          />
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
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Cosecha'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CropForm;
