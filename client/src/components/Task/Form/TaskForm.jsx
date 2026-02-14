import React, { useState, useEffect, useRef } from 'react';
import './TaskForm.css';

const API_URL = 'http://localhost:4000/api/tasks';

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
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageMessage, setImageMessage] = useState({ type: '', text: '' });
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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
      setImageUrl(initialData.imagen_url || null);
    } else {
      setFormData(initialFormState);
      setImageUrl(null);
    }
    setErrors({});
    setImageMessage({ type: '', text: '' });
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

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:4000${url}`;
  };

  const uploadImageFile = async (file) => {
    if (!initialData?.id) return;
    setImageLoading(true);
    setImageMessage({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('image', file);

      const response = await fetch(`${API_URL}/${initialData.id}/image`, {
        method: 'PUT',
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        setImageUrl(result.imagen_url);
        setImageMessage({ type: 'success', text: 'Imagen actualizada' });
      } else {
        throw new Error(result.error || 'Error al subir la imagen');
      }
    } catch (err) {
      setImageMessage({ type: 'error', text: err.message || 'Error al subir la imagen' });
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageMessage({ type: 'error', text: 'Solo JPEG, PNG, GIF o WEBP' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageMessage({ type: 'error', text: 'La imagen no puede superar los 5MB' });
      return;
    }

    await uploadImageFile(file);
    e.target.value = '';
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      setShowWebcam(true);
      setCapturedPhoto(null);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.log('Webcam no disponible, usando camara nativa');
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
    const file = new File([blob], `task-${Date.now()}.jpg`, { type: 'image/jpeg' });
    stopWebcam();
    await uploadImageFile(file);
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

        {/* Seccion de imagen - solo al editar */}
        {isEditing && (
          <div className="task-image-section">
            <label className="form-label">Imagen de la tarea</label>
            {imageMessage.text && (
              <span className={`task-image-message ${imageMessage.type}`}>
                {imageMessage.text}
              </span>
            )}
            <div className="task-image-area">
              {imageUrl ? (
                <div className="task-image-preview">
                  <img src={getFullImageUrl(imageUrl)} alt="Tarea" />
                </div>
              ) : (
                <div className="task-image-empty">Sin imagen</div>
              )}
              <div className="task-image-buttons">
                <button
                  type="button"
                  className="task-image-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLoading}
                >
                  {imageLoading ? 'Subiendo...' : 'Subir imagen'}
                </button>
                <button
                  type="button"
                  className="task-image-btn"
                  onClick={startWebcam}
                  disabled={imageLoading}
                >
                  Tomar foto
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              disabled={imageLoading}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              disabled={imageLoading}
            />
          </div>
        )}

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

      {/* Modal de webcam */}
      {showWebcam && (
        <div className="task-webcam-overlay" onClick={stopWebcam}>
          <div className="task-webcam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="task-webcam-header">
              <h3>Tomar foto</h3>
              <button type="button" className="task-webcam-close" onClick={stopWebcam}>
                &times;
              </button>
            </div>
            <div className="task-webcam-preview">
              {!capturedPhoto ? (
                <video ref={videoRef} autoPlay playsInline muted className="task-webcam-video" />
              ) : (
                <img src={capturedPhoto} alt="Foto capturada" className="task-webcam-captured" />
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div className="task-webcam-actions">
              {!capturedPhoto ? (
                <button type="button" className="task-webcam-btn task-webcam-btn-capture" onClick={capturePhoto}>
                  Capturar
                </button>
              ) : (
                <>
                  <button type="button" className="task-webcam-btn task-webcam-btn-retake" onClick={() => setCapturedPhoto(null)}>
                    Reintentar
                  </button>
                  <button type="button" className="task-webcam-btn task-webcam-btn-use" onClick={usePhoto}>
                    {imageLoading ? 'Subiendo...' : 'Usar foto'}
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

export default TaskForm;
