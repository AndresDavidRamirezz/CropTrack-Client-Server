import React, { useState, useEffect, useRef } from 'react';
import './CropForm.css';

const TIPOS_CULTIVO = [
  { value: '', label: 'Seleccionar tipo...' },
  { value: 'hortaliza', label: 'Hortaliza' },
  { value: 'fruta', label: 'Fruta' },
  { value: 'cereal', label: 'Cereal' },
  { value: 'legumbre', label: 'Legumbre' },
  { value: 'tuberculo', label: 'Tuberculo' },
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

const CropForm = ({ onSubmit, initialData, onCancel, loading, workers = [], initialWorkerIds = [] }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [imageMessage, setImageMessage] = useState({ type: '', text: '' });
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const isEditing = Boolean(initialData);

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:4000${url}`;
  };

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
      setImagePreview(initialData.imagen_url ? getFullImageUrl(initialData.imagen_url) : null);
    } else {
      setFormData(initialFormState);
      setImagePreview(null);
    }
    setPendingImageFile(null);
    setErrors({});
    setImageMessage({ type: '', text: '' });
    setSelectedWorkerIds(initialWorkerIds || []);
  }, [initialData, initialWorkerIds]);

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

  const toggleWorker = (workerId) => {
    setSelectedWorkerIds(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
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
      newErrors.area_hectareas = 'El area no puede ser negativa';
    }

    if (formData.ubicacion && formData.ubicacion.length > 200) {
      newErrors.ubicacion = 'La ubicacion no puede exceder 200 caracteres';
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
      onSubmit(initialData.id, dataToSubmit, pendingImageFile, selectedWorkerIds);
    } else {
      onSubmit(dataToSubmit, pendingImageFile, selectedWorkerIds);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setPendingImageFile(null);
    setImagePreview(null);
    setImageMessage({ type: '', text: '' });
    setSelectedWorkerIds([]);
    if (onCancel) onCancel();
  };

  // Seleccionar archivo de imagen (guardarlo local, no subir todavia)
  const handleImageSelect = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageMessage({ type: 'error', text: 'Solo JPEG, PNG, GIF o WEBP' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageMessage({ type: 'error', text: 'La imagen no puede superar los 5MB' });
      return;
    }

    setPendingImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageMessage({ type: 'success', text: 'Imagen seleccionada' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleImageSelect(file);
    e.target.value = '';
  };

  // Webcam
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
    const file = new File([blob], `crop-${Date.now()}.jpg`, { type: 'image/jpeg' });
    stopWebcam();
    handleImageSelect(file);
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
              placeholder="Ej: Maiz temporada 2024"
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
              placeholder="Ej: Hibrido DK-7088"
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
            <label htmlFor="area_hectareas" className="form-label">Area (hectareas)</label>
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
            <label htmlFor="ubicacion" className="form-label">Ubicacion</label>
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

        {workers.length > 0 && (() => {
          const supervisores = workers.filter(w => w.rol === 'supervisor');
          const trabajadores = workers.filter(w => w.rol === 'trabajador');

          return (
            <div className="crop-workers-section">
              <div className="crop-workers-header">
                <label className="form-label">Trabajadores asignados</label>
                <span className="crop-workers-count">
                  {selectedWorkerIds.length} seleccionado{selectedWorkerIds.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="crop-workers-columns">
                {supervisores.length > 0 && (
                  <div className="crop-workers-column">
                    <span className="crop-workers-group-title">Supervisores</span>
                    <div className="crop-workers-list">
                      {supervisores.map(w => {
                        const isSelected = selectedWorkerIds.includes(w.id);
                        return (
                          <label key={w.id} className={`crop-workers-item ${isSelected ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleWorker(w.id)}
                              disabled={loading}
                            />
                            <span className="crop-workers-name">{w.nombre} {w.apellido}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {trabajadores.length > 0 && (
                  <div className="crop-workers-column">
                    <span className="crop-workers-group-title">Trabajadores</span>
                    <div className="crop-workers-list">
                      {trabajadores.map(w => {
                        const isSelected = selectedWorkerIds.includes(w.id);
                        return (
                          <label key={w.id} className={`crop-workers-item ${isSelected ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleWorker(w.id)}
                              disabled={loading}
                            />
                            <span className="crop-workers-name">{w.nombre} {w.apellido}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

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

        <div className="form-row form-row-bottom">
          <div className="form-group">
            <label htmlFor="notas" className="form-label">Notas</label>
            <textarea
              id="notas"
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              className="form-input form-textarea"
              placeholder="Notas adicionales sobre el cultivo..."
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Seccion de imagen - disponible para crear y editar */}
          <div className="crop-image-section">
            <label className="form-label">Imagen del cultivo</label>
            {imageMessage.text && (
              <span className={`crop-image-message ${imageMessage.type}`}>
                {imageMessage.text}
              </span>
            )}
            <div className="crop-image-area">
              {imagePreview ? (
                <div className="crop-image-preview">
                  <img src={imagePreview} alt="Cultivo" />
                </div>
              ) : (
                <div className="crop-image-empty">Sin imagen</div>
              )}
              <div className="crop-image-buttons">
                <button
                  type="button"
                  className="crop-image-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  Subir imagen
                </button>
                <button
                  type="button"
                  className="crop-image-btn"
                  onClick={startWebcam}
                  disabled={loading}
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
              disabled={loading}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              disabled={loading}
            />
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
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Cosecha'}
          </button>
        </div>
      </form>

      {/* Modal de webcam */}
      {showWebcam && (
        <div className="crop-webcam-overlay" onClick={stopWebcam}>
          <div className="crop-webcam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crop-webcam-header">
              <h3>Tomar foto</h3>
              <button type="button" className="crop-webcam-close" onClick={stopWebcam}>
                &times;
              </button>
            </div>
            <div className="crop-webcam-preview">
              {!capturedPhoto ? (
                <video ref={videoRef} autoPlay playsInline muted className="crop-webcam-video" />
              ) : (
                <img src={capturedPhoto} alt="Foto capturada" className="crop-webcam-captured" />
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div className="crop-webcam-actions">
              {!capturedPhoto ? (
                <button type="button" className="crop-webcam-btn crop-webcam-btn-capture" onClick={capturePhoto}>
                  Capturar
                </button>
              ) : (
                <>
                  <button type="button" className="crop-webcam-btn crop-webcam-btn-retake" onClick={() => setCapturedPhoto(null)}>
                    Reintentar
                  </button>
                  <button type="button" className="crop-webcam-btn crop-webcam-btn-use" onClick={usePhoto}>
                    Usar foto
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

export default CropForm;
