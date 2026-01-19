import React, { useState, useEffect } from 'react';
import './WorkerForm.css';

const ROLES = [
  { value: 'trabajador', label: 'Trabajador' },
  { value: 'supervisor', label: 'Supervisor' }
];

const initialFormState = {
  usuario: '',
  contrasena: '',
  confirmarContrasena: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  rol: 'trabajador'
};

const WorkerForm = ({ onSubmit, initialData, onCancel, loading }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        usuario: initialData.nombre_usuario || '',
        contrasena: '',
        confirmarContrasena: '',
        nombre: initialData.nombre || '',
        apellido: initialData.apellido || '',
        email: initialData.email || '',
        telefono: initialData.telefono || '',
        rol: initialData.rol || 'trabajador'
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

    // Solo validar usuario en modo crear
    if (!isEditing) {
      if (!formData.usuario.trim()) {
        newErrors.usuario = 'El nombre de usuario es obligatorio';
      } else if (formData.usuario.length < 3) {
        newErrors.usuario = 'Minimo 3 caracteres';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.usuario)) {
        newErrors.usuario = 'Solo letras, numeros y guion bajo';
      }
    }

    // Nombre siempre requerido
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'Maximo 100 caracteres';
    }

    // Apellido siempre requerido
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    } else if (formData.apellido.length > 100) {
      newErrors.apellido = 'Maximo 100 caracteres';
    }

    // Email siempre requerido
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email invalido';
    }

    // Telefono opcional, pero validar formato si se proporciona
    if (formData.telefono && formData.telefono.length > 20) {
      newErrors.telefono = 'Maximo 20 caracteres';
    }

    // Contrasena: obligatoria en crear, opcional en editar
    if (!isEditing && !formData.contrasena) {
      newErrors.contrasena = 'La contrasena es obligatoria';
    } else if (formData.contrasena && formData.contrasena.length < 6) {
      newErrors.contrasena = 'Minimo 6 caracteres';
    }

    // Confirmar contrasena si hay contrasena
    if (formData.contrasena && formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contrasenas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dataToSubmit = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      email: formData.email.toLowerCase().trim(),
      telefono: formData.telefono.trim() || null
    };

    if (!isEditing) {
      // Crear: agregar usuario, contrasena, rol
      dataToSubmit.usuario = formData.usuario.trim();
      dataToSubmit.contrasena = formData.contrasena;
      dataToSubmit.rol = formData.rol;
    } else {
      // Editar: solo agregar contrasena si se proporciono
      if (formData.contrasena) {
        dataToSubmit.contrasena = formData.contrasena;
      }
    }

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
    <div className="worker-form-container">
      <div className="worker-form-header">
        <h2>{isEditing ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h2>
        {isEditing && (
          <span className="editing-badge">Editando: {initialData.nombre} {initialData.apellido}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="worker-form">
        {/* Usuario y Rol - Solo en modo crear */}
        {!isEditing && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="usuario" className="form-label">
                Usuario <span className="required">*</span>
              </label>
              <input
                type="text"
                id="usuario"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                className={`form-input ${errors.usuario ? 'input-error' : ''}`}
                placeholder="Ej: juan_perez"
                disabled={loading}
                maxLength={50}
              />
              {errors.usuario && <span className="error-text">{errors.usuario}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="rol" className="form-label">
                Rol <span className="required">*</span>
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="form-input form-select"
                disabled={loading}
              >
                {ROLES.map(rol => (
                  <option key={rol.value} value={rol.value}>
                    {rol.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Nombre y Apellido */}
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
              placeholder="Ej: Juan"
              disabled={loading}
              maxLength={100}
            />
            {errors.nombre && <span className="error-text">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="apellido" className="form-label">
              Apellido <span className="required">*</span>
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className={`form-input ${errors.apellido ? 'input-error' : ''}`}
              placeholder="Ej: Perez"
              disabled={loading}
              maxLength={100}
            />
            {errors.apellido && <span className="error-text">{errors.apellido}</span>}
          </div>
        </div>

        {/* Email y Telefono */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="Ej: juan@ejemplo.com"
              disabled={loading}
              maxLength={100}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telefono" className="form-label">
              Telefono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`form-input ${errors.telefono ? 'input-error' : ''}`}
              placeholder="Ej: +54 11 1234-5678"
              disabled={loading}
              maxLength={20}
            />
            {errors.telefono && <span className="error-text">{errors.telefono}</span>}
          </div>
        </div>

        {/* Contrasena */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contrasena" className="form-label">
              Contrasena {!isEditing && <span className="required">*</span>}
            </label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              className={`form-input ${errors.contrasena ? 'input-error' : ''}`}
              placeholder={isEditing ? 'Dejar vacio para no cambiar' : 'Minimo 6 caracteres'}
              disabled={loading}
              maxLength={100}
            />
            {errors.contrasena && <span className="error-text">{errors.contrasena}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmarContrasena" className="form-label">
              Confirmar Contrasena {!isEditing && <span className="required">*</span>}
            </label>
            <input
              type="password"
              id="confirmarContrasena"
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              className={`form-input ${errors.confirmarContrasena ? 'input-error' : ''}`}
              placeholder="Repetir contrasena"
              disabled={loading}
              maxLength={100}
            />
            {errors.confirmarContrasena && <span className="error-text">{errors.confirmarContrasena}</span>}
          </div>
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
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Trabajador'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkerForm;
