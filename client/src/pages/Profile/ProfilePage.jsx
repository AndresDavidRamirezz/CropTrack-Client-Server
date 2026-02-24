import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosConfig';
import './ProfilePage.css';

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
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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
      const { data } = await api.get(`/api/users/${userData.id}`);
      console.log('✅ [PROFILE-PAGE] Datos obtenidos:', data);
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

      const { data } = await api.put(`/api/users/${userData.id}`, dataToSubmit);
      console.log('📥 [PROFILE-PAGE] Response:', data);
      console.log('✅ [PROFILE-PAGE] Perfil actualizado');

      const updatedUserData = {
        ...userData,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.toLowerCase().trim(),
        telefono: formData.telefono.trim() || null
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);

      setFormData(prev => ({
        ...prev,
        contrasena: '',
        confirmarContrasena: ''
      }));

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setIsEditing(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al actualizar el perfil';
      console.error('❌ [PROFILE-PAGE] Error actualizando perfil:', err);
      setMessage({ type: 'error', text: msg });
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

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${url}`;
  };

  // Subir un archivo (File o Blob) como avatar al servidor
  const uploadAvatarFile = async (file) => {
    setAvatarLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.put(`/api/users/${userData.id}/image`, formData);
      const updatedUserData = { ...userData, imagen_url: data.imagen_url };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setMessage({ type: 'success', text: 'Avatar actualizado correctamente' });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error al subir la imagen';
      console.error('❌ [PROFILE-PAGE] Error subiendo avatar:', err);
      setMessage({ type: 'error', text: msg });
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handler para input file (subir imagen desde archivos)
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Tipo de archivo no permitido. Solo JPEG, PNG, GIF o WEBP' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen no puede superar los 5MB' });
      return;
    }

    await uploadAvatarFile(file);
    e.target.value = '';
  };

  // Intentar abrir webcam. Si falla, caer al input nativo con capture
  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      setShowWebcam(true);
      setCapturedPhoto(null);
      // Asignar stream al video una vez que se renderice
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.log('Webcam no disponible, usando camara nativa');
      // Fallback: abrir camara nativa del dispositivo
      cameraInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.9));
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowWebcam(false);
    setCapturedPhoto(null);
  };

  const usePhoto = async () => {
    if (!capturedPhoto) return;
    const response = await fetch(capturedPhoto);
    const blob = await response.blob();
    const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
    stopWebcam();
    await uploadAvatarFile(file);
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

      {/* Card horizontal de informacion del usuario */}
      <div className="profile-info-card">
        <div className="profile-card-left">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {userData.imagen_url ? (
                <img
                  src={getAvatarUrl(userData.imagen_url)}
                  alt="Avatar"
                  className="avatar-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span
                className="avatar-icon"
                style={{ display: userData.imagen_url ? 'none' : 'flex' }}
              >
                👤
              </span>
              {avatarLoading && (
                <div className="avatar-overlay" style={{ opacity: 1 }}>
                  <div className="avatar-spinner"></div>
                </div>
              )}
            </div>
            <div className="profile-image-buttons">
              <button
                type="button"
                className="profile-image-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
              >
                Subir imagen
              </button>
              <button
                type="button"
                className="profile-image-btn"
                onClick={handleTakePhoto}
                disabled={avatarLoading}
              >
                Tomar foto
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
              disabled={avatarLoading}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
              disabled={avatarLoading}
            />
          </div>
          <span
            className="profile-rol-badge"
            style={{ backgroundColor: ROL_COLORS[userData.rol] || '#6c757d' }}
          >
            {ROL_LABELS[userData.rol] || userData.rol}
          </span>
          <span className="profile-username">@{userData.usuario || userData.nombre_usuario}</span>
        </div>
        <div className="profile-card-right">
          <div className="profile-details-grid">
            <div className="detail-item">
              <span className="detail-label">Nombre</span>
              <span className="detail-value">{userData.nombre}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Apellido</span>
              <span className="detail-value">{userData.apellido}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{userData.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Telefono</span>
              <span className="detail-value">{userData.telefono || 'No registrado'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Empresa</span>
              <span className="detail-value">{userData.empresa}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Ultimo acceso</span>
              <span className="detail-value">{formatDate(userData.ultimo_acceso)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal del formulario de edicion */}
      {isEditing && (
        <div className="profile-form-overlay" onClick={handleCancel}>
          <div className="profile-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-form-container editing">
              <div className="profile-form-header">
                <h3>Editar Informacion</h3>
                <span className="editing-indicator">Modo edicion activo</span>
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="profile-row">
                  <div className="profile-group">
                    <label htmlFor="nombre" className="profile-label">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`profile-input ${errors.nombre ? 'profile-input-error' : ''}`}
                      disabled={loading}
                      maxLength={100}
                    />
                    {errors.nombre && <span className="profile-error-text">{errors.nombre}</span>}
                  </div>

                  <div className="profile-group">
                    <label htmlFor="apellido" className="profile-label">
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className={`profile-input ${errors.apellido ? 'profile-input-error' : ''}`}
                      disabled={loading}
                      maxLength={100}
                    />
                    {errors.apellido && <span className="profile-error-text">{errors.apellido}</span>}
                  </div>
                </div>

                <div className="profile-row">
                  <div className="profile-group">
                    <label htmlFor="email" className="profile-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`profile-input ${errors.email ? 'profile-input-error' : ''}`}
                      disabled={loading}
                      maxLength={100}
                    />
                    {errors.email && <span className="profile-error-text">{errors.email}</span>}
                  </div>

                  <div className="profile-group">
                    <label htmlFor="telefono" className="profile-label">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={`profile-input ${errors.telefono ? 'profile-input-error' : ''}`}
                      placeholder="Ej: +54 11 1234-5678"
                      disabled={loading}
                      maxLength={20}
                    />
                    {errors.telefono && <span className="profile-error-text">{errors.telefono}</span>}
                  </div>
                </div>

                <div className="profile-divider">
                  <span>Cambiar Contrasena (opcional)</span>
                </div>

                <div className="profile-row">
                  <div className="profile-group">
                    <label htmlFor="contrasena" className="profile-label">
                      Nueva Contrasena
                    </label>
                    <input
                      type="password"
                      id="contrasena"
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleChange}
                      className={`profile-input ${errors.contrasena ? 'profile-input-error' : ''}`}
                      placeholder="Dejar vacio para no cambiar"
                      disabled={loading}
                      maxLength={100}
                    />
                    {errors.contrasena && <span className="profile-error-text">{errors.contrasena}</span>}
                  </div>

                  <div className="profile-group">
                    <label htmlFor="confirmarContrasena" className="profile-label">
                      Confirmar Contrasena
                    </label>
                    <input
                      type="password"
                      id="confirmarContrasena"
                      name="confirmarContrasena"
                      value={formData.confirmarContrasena}
                      onChange={handleChange}
                      className={`profile-input ${errors.confirmarContrasena ? 'profile-input-error' : ''}`}
                      placeholder="Repetir nueva contrasena"
                      disabled={loading}
                      maxLength={100}
                    />
                    {errors.confirmarContrasena && <span className="profile-error-text">{errors.confirmarContrasena}</span>}
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="profile-btn profile-btn-cancel"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="profile-btn profile-btn-submit"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de webcam */}
      {showWebcam && (
        <div className="webcam-overlay" onClick={stopWebcam}>
          <div className="webcam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="webcam-header">
              <h3>Tomar foto</h3>
              <button type="button" className="webcam-close" onClick={stopWebcam}>
                &times;
              </button>
            </div>
            <div className="webcam-preview">
              {!capturedPhoto ? (
                <video ref={videoRef} autoPlay playsInline muted className="webcam-video" />
              ) : (
                <img src={capturedPhoto} alt="Foto capturada" className="webcam-captured" />
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div className="webcam-actions">
              {!capturedPhoto ? (
                <button type="button" className="webcam-btn webcam-btn-capture" onClick={capturePhoto}>
                  Capturar
                </button>
              ) : (
                <>
                  <button type="button" className="webcam-btn webcam-btn-retake" onClick={() => setCapturedPhoto(null)}>
                    Reintentar
                  </button>
                  <button type="button" className="webcam-btn webcam-btn-use" onClick={usePhoto}>
                    {avatarLoading ? 'Subiendo...' : 'Usar foto'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
