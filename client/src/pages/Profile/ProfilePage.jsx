import React, { useState, useEffect } from 'react';
import './ProfilePage.css';

const API_URL = 'http://localhost:4000/api/users';

const ROL_COLORS = {
  administrador: '#dc3545',
  supervisor: '#198754',
  trabajador: '#0d6efd'
};

const ROL_LABELS = {
  administrador: 'Administrador',
  supervisor: 'Supervisor',
  trabajador: 'Trabajador'
};

const initialFormState = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  contrasena: '',
  confirmarContrasena: ''
};

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Obtener datos del usuario desde localStorage
  const loadUserData = () => {
    try {
      const data = JSON.parse(localStorage.getItem('userData'));
      console.log('🔍 [PROFILE-PAGE] userData cargado:', data);
      if (data) {
        setUserData(data);
        setFormData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
          contrasena: '',
          confirmarContrasena: ''
        });
      }
    } catch (err) {
      console.error('❌ [PROFILE-PAGE] Error cargando userData:', err);
      setMessage({ type: 'error', text: 'Error al cargar los datos del perfil' });
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Obtener datos frescos del servidor
  const fetchUserData = async () => {
    if (!userData?.id) return;

    setLoading(true);
    try {
      console.log('🟡 [PROFILE-PAGE] Obteniendo datos del servidor para:', userData.id);
      const response = await fetch(`${API_URL}/${userData.id}`);
      const data = await response.json();

      if (response.ok) {
        console.log('✅ [PROFILE-PAGE] Datos obtenidos:', data);
        // Actualizar localStorage y estado
        const updatedUserData = { ...userData, ...data };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        setFormData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
          contrasena: '',
          confirmarContrasena: ''
        });
      }
    } catch (err) {
      console.error('❌ [PROFILE-PAGE] Error obteniendo datos:', err);
    } finally {
      setLoading(false);
    }
  };

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
      newErrors.nombre = 'Maximo 100 caracteres';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    } else if (formData.apellido.length > 100) {
      newErrors.apellido = 'Maximo 100 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email invalido';
    }

    if (formData.telefono && formData.telefono.length > 20) {
      newErrors.telefono = 'Maximo 20 caracteres';
    }

    // Contrasena opcional, pero si se proporciona debe cumplir requisitos
    if (formData.contrasena && formData.contrasena.length < 6) {
      newErrors.contrasena = 'Minimo 6 caracteres';
    }

    // Confirmar contrasena si hay contrasena
    if (formData.contrasena && formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contrasenas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const dataToSubmit = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.toLowerCase().trim(),
        telefono: formData.telefono.trim() || null
      };

      // Solo agregar contrasena si se proporciono
      if (formData.contrasena) {
        dataToSubmit.contrasena = formData.contrasena;
      }

      console.log('🟡 [PROFILE-PAGE] Actualizando perfil:', dataToSubmit);

      const response = await fetch(`${API_URL}/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit)
      });

      const data = await response.json();
      console.log('📥 [PROFILE-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('✅ [PROFILE-PAGE] Perfil actualizado');

        // Actualizar localStorage con los nuevos datos
        const updatedUserData = {
          ...userData,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.toLowerCase().trim(),
          telefono: formData.telefono.trim() || null
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);

        // Limpiar campos de contrasena
        setFormData(prev => ({
          ...prev,
          contrasena: '',
          confirmarContrasena: ''
        }));

        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        setIsEditing(false);
      } else {
        throw new Error(data.message || data.error || 'Error al actualizar el perfil');
      }
    } catch (err) {
      console.error('❌ [PROFILE-PAGE] Error actualizando perfil:', err);
      setMessage({ type: 'error', text: err.message || 'Error al actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    if (userData) {
      setFormData({
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        email: userData.email || '',
        telefono: userData.telefono || '',
        contrasena: '',
        confirmarContrasena: ''
      });
    }
    setErrors({});
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!userData) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-page-header">
        <div className="header-content">
          <h1>Mi Perfil</h1>
          <p>Visualiza y edita tu informacion personal</p>
        </div>
        {!isEditing && (
          <button className="btn-edit-profile" onClick={handleEditClick}>
            Editar Perfil
          </button>
        )}
      </header>

      {message.text && (
        <div className={`message-banner ${message.type}`}>
          <span className="message-icon">{message.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{message.text}</span>
          <button className="message-close" onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      <div className="profile-content">
        {/* Seccion de informacion del perfil */}
        <div className="profile-info-card">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <div className="profile-identity">
            <h2 className="profile-name">{userData.nombre} {userData.apellido}</h2>
            <span className="profile-username">@{userData.usuario || userData.nombre_usuario}</span>
          </div>
          <div className="profile-badges">
            <span
              className="profile-rol-badge"
              style={{ backgroundColor: ROL_COLORS[userData.rol] || '#6c757d' }}
            >
              {ROL_LABELS[userData.rol] || userData.rol}
            </span>
          </div>
          <div className="profile-meta">
            <div className="meta-item">
              <span className="meta-label">Empresa:</span>
              <span className="meta-value">{userData.empresa}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Ultimo acceso:</span>
              <span className="meta-value">{formatDate(userData.ultimo_acceso)}</span>
            </div>
          </div>
        </div>

        {/* Formulario de edicion */}
        <div className={`profile-form-container ${isEditing ? 'editing' : 'viewing'}`}>
          <div className="profile-form-header">
            <h3>{isEditing ? 'Editar Informacion' : 'Informacion de Contacto'}</h3>
            {isEditing && (
              <span className="editing-indicator">Modo edicion activo</span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">
                  Nombre {isEditing && <span className="required">*</span>}
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`form-input ${errors.nombre ? 'input-error' : ''}`}
                  disabled={!isEditing || loading}
                  maxLength={100}
                />
                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="apellido" className="form-label">
                  Apellido {isEditing && <span className="required">*</span>}
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className={`form-input ${errors.apellido ? 'input-error' : ''}`}
                  disabled={!isEditing || loading}
                  maxLength={100}
                />
                {errors.apellido && <span className="error-text">{errors.apellido}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email {isEditing && <span className="required">*</span>}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  disabled={!isEditing || loading}
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
                  placeholder={isEditing ? 'Ej: +54 11 1234-5678' : ''}
                  disabled={!isEditing || loading}
                  maxLength={20}
                />
                {errors.telefono && <span className="error-text">{errors.telefono}</span>}
              </div>
            </div>

            {isEditing && (
              <>
                <div className="form-divider">
                  <span>Cambiar Contrasena (opcional)</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contrasena" className="form-label">
                      Nueva Contrasena
                    </label>
                    <input
                      type="password"
                      id="contrasena"
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      className={`form-input ${errors.contrasena ? 'input-error' : ''}`}
                      placeholder="Dejar vacio para no cambiar"
                      disabled={loading}
                      maxLength={100}
                    />
                    {errors.contrasena && <span className="error-text">{errors.contrasena}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmarContrasena" className="form-label">
                      Confirmar Contrasena
                    </label>
                    <input
                      type="password"
                      id="confirmarContrasena"
                      name="confirmarContrasena"
                      value={formData.confirmarContrasena}
                      onChange={handleChange}
                      className={`form-input ${errors.confirmarContrasena ? 'input-error' : ''}`}
                      placeholder="Repetir nueva contrasena"
                      disabled={loading}
                      maxLength={100}
                    />
                    {errors.confirmarContrasena && <span className="error-text">{errors.confirmarContrasena}</span>}
                  </div>
                </div>
              </>
            )}

            {isEditing && (
              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-form btn-cancel"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-form btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
