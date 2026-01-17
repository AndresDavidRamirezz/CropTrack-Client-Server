import React, { useState, useEffect } from 'react';
import './TaskForm.css';

const PRIORIDADES = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' }
];

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' }
];

const initialFormState = {
  titulo: '',
  cultivo_id: '',
  asignado_a: '',
  prioridad: 'media',
  estado: 'pendiente',
  fecha_inicio: '',
  fecha_limite: '',
  descripcion: '',
  observaciones: ''
};

const TaskForm = ({ onSubmit, initialData, crops, onCancel, loading }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        cultivo_id: initialData.cultivo_id || '',
        asignado_a: initialData.asignado_a || '',
        prioridad: initialData.prioridad || 'media',
        estado: initialData.estado || 'pendiente',
        fecha_inicio: initialData.fecha_inicio?.split('T')[0] || '',
        fecha_limite: initialData.fecha_limite?.split('T')[0] || '',
        descripcion: initialData.descripcion || '',
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

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El titulo es obligatorio';
    } else if (formData.titulo.length < 3) {
      newErrors.titulo = 'El titulo debe tener al menos 3 caracteres';
    } else if (formData.titulo.length > 150) {
      newErrors.titulo = 'El titulo no puede exceder 150 caracteres';
    }

    if (formData.asignado_a && formData.asignado_a.length !== 36) {
      newErrors.asignado_a = 'El ID del asignado debe ser un UUID valido (36 caracteres)';
    }

    if (formData.descripcion && formData.descripcion.length > 5000) {
      newErrors.descripcion = 'La descripcion no puede exceder 5000 caracteres';
    }

    if (formData.observaciones && formData.observaciones.length > 5000) {
      newErrors.observaciones = 'Las observaciones no pueden exceder 5000 caracteres';
    }

    if (formData.fecha_inicio && formData.fecha_limite) {
      if (new Date(formData.fecha_limite) < new Date(formData.fecha_inicio)) {
        newErrors.fecha_limite = 'La fecha limite debe ser posterior a la fecha de inicio';
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
      cultivo_id: formData.cultivo_id || null,
      asignado_a: formData.asignado_a || null,
      fecha_inicio: formData.fecha_inicio || null,
      fecha_limite: formData.fecha_limite || null,
      descripcion: formData.descripcion || null,
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

  return (
    <div className="task-form-container">
      <div className="task-form-header">
        <h2>{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
        {isEditing && (
          <span className="editing-badge">Editando: {initialData.titulo}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group full-width">
          <label htmlFor="titulo" className="form-label">
            Titulo <span className="required">*</span>
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            className={`form-input ${errors.titulo ? 'input-error' : ''}`}
            placeholder="Ej: Regar cultivo de maiz"
            disabled={loading}
            maxLength={150}
          />
          {errors.titulo && <span className="error-text">{errors.titulo}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cultivo_id" className="form-label">Cultivo (opcional)</label>
            <select
              id="cultivo_id"
              name="cultivo_id"
              value={formData.cultivo_id}
              onChange={handleChange}
              className="form-input form-select"
              disabled={loading}
            >
              <option value="">Sin cultivo asociado</option>
              {crops?.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.nombre} - {crop.tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="asignado_a" className="form-label">Asignado a (UUID)</label>
            <input
              type="text"
              id="asignado_a"
              name="asignado_a"
              value={formData.asignado_a}
              onChange={handleChange}
              className={`form-input ${errors.asignado_a ? 'input-error' : ''}`}
              placeholder="UUID del usuario asignado"
              disabled={loading}
              maxLength={36}
            />
            {errors.asignado_a && <span className="error-text">{errors.asignado_a}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prioridad" className="form-label">Prioridad</label>
            <select
              id="prioridad"
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
              className="form-input form-select"
              disabled={loading}
            >
              {PRIORIDADES.map(prioridad => (
                <option key={prioridad.value} value={prioridad.value}>
                  {prioridad.label}
                </option>
              ))}
            </select>
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
              {ESTADOS.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha_inicio" className="form-label">Fecha de Inicio</label>
            <input
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha_limite" className="form-label">Fecha Limite</label>
            <input
              type="date"
              id="fecha_limite"
              name="fecha_limite"
              value={formData.fecha_limite}
              onChange={handleChange}
              className={`form-input ${errors.fecha_limite ? 'input-error' : ''}`}
              disabled={loading}
            />
            {errors.fecha_limite && <span className="error-text">{errors.fecha_limite}</span>}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="descripcion" className="form-label">Descripcion</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className={`form-input form-textarea ${errors.descripcion ? 'input-error' : ''}`}
            placeholder="Descripcion detallada de la tarea..."
            disabled={loading}
            rows={3}
          />
          {errors.descripcion && <span className="error-text">{errors.descripcion}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="observaciones" className="form-label">Observaciones</label>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className={`form-input form-textarea ${errors.observaciones ? 'input-error' : ''}`}
            placeholder="Observaciones adicionales..."
            disabled={loading}
            rows={3}
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
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Tarea'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
