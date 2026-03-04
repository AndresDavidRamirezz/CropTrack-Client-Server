import React, { useState, useEffect } from 'react';
import CropForm from '../../components/Crop/Form/CropForm';
import CropList from '../../components/Crop/List/CropList';
import { ESTADO_COLORS, ESTADO_LABELS, formatDate, getFullImageUrl } from '../../components/Crop/Card/CropCard';
import api from '../../api/axiosConfig';
import './CropPage.css';

const CropPage = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [editingWorkerIds, setEditingWorkerIds] = useState([]);

  // Obtener datos del usuario logueado
  const getUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      return {
        usuario_creador_id: userData?.id,
        empresa: userData?.empresa
      };
    } catch (err) {
      return { usuario_creador_id: null, empresa: null };
    }
  };

  // Cargar cosechas al montar el componente
  const fetchCrops = async () => {
    const { usuario_creador_id } = getUserData();

    if (!usuario_creador_id) {
      setError('No se pudo identificar al usuario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get(`/api/crops/user/${usuario_creador_id}`);
      setCrops(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al cargar las cosechas');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    const { empresa } = getUserData();
    if (!empresa) return;

    try {
      const { data } = await api.get(`/api/users/empresa/${encodeURIComponent(empresa)}`);
      setWorkers(data);
    } catch (err) {
      console.error('Error al cargar trabajadores:', err);
    }
  };

  const fetchCropWorkers = async (cropId) => {
    try {
      const { data } = await api.get(`/api/crops/${cropId}/workers`);
      return data.map(w => w.id);
    } catch (err) {
      console.error('Error al cargar workers de cosecha:', err);
    }
    return [];
  };

  const saveCropWorkers = async (cropId, workerIds) => {
    try {
      await api.put(`/api/crops/${cropId}/workers`, { workerIds });
    } catch (err) {
      console.error('Error al guardar workers de cosecha:', err);
    }
  };

  useEffect(() => {
    fetchCrops();
    fetchWorkers();
  }, []);

  // Subir imagen a una cosecha por ID
  const uploadImageToCrop = async (cropId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      await api.put(`/api/crops/${cropId}/image`, formData);
    } catch (err) {
      console.error('Error al subir imagen:', err);
    }
  };

  // Crear nueva cosecha
  const handleCreate = async (formData, imageFile, selectedWorkerIds) => {
    setLoading(true);
    setError(null);

    try {
      const { usuario_creador_id, empresa } = getUserData();

      if (!usuario_creador_id || !empresa) {
        throw new Error('No se pudo obtener la informacion del usuario');
      }

      const cropData = {
        ...formData,
        empresa,
        usuario_creador_id
      };

      const { data } = await api.post('/api/crops', cropData);

      if (imageFile && data.id) {
        await uploadImageToCrop(data.id, imageFile);
      }
      if (selectedWorkerIds && selectedWorkerIds.length > 0 && data.id) {
        await saveCropWorkers(data.id, selectedWorkerIds);
      }
      await fetchCrops();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al crear la cosecha');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cosecha existente
  const handleUpdate = async (id, formData, imageFile, selectedWorkerIds) => {
    setLoading(true);
    setError(null);

    try {
      await api.put(`/api/crops/${id}`, formData);

      if (imageFile) {
        await uploadImageToCrop(id, imageFile);
      }
      if (selectedWorkerIds) {
        await saveCropWorkers(id, selectedWorkerIds);
      }
      await fetchCrops();
      setEditingCrop(null);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al actualizar la cosecha');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cosecha
  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/api/crops/${id}`);
      setSelectedCrop(null);
      setSelectedCropWorkers([]);
      await fetchCrops();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al eliminar la cosecha');
    } finally {
      setLoading(false);
    }
  };

  // Activar modo edicion desde el modal
  const handleEdit = async (crop) => {
    setSelectedCrop(null);
    setError(null);
    const workerIds = await fetchCropWorkers(crop.id);
    setEditingWorkerIds(workerIds);
    setEditingCrop(crop);
    setShowForm(true);
  };

  const [selectedCropWorkers, setSelectedCropWorkers] = useState([]);

  // Seleccionar cultivo para ver detalle (modal solo lectura)
  const handleSelect = async (crop) => {
    setSelectedCrop(crop);
    setSelectedCropWorkers([]);
    try {
      const { data } = await api.get(`/api/crops/${crop.id}/workers`);
      setSelectedCropWorkers(data);
    } catch (err) {
      console.error('Error al cargar workers del cultivo:', err);
    }
  };

  // Eliminar desde modal
  const handleDeleteFromModal = () => {
    if (selectedCrop && window.confirm(`Estas seguro de eliminar la cosecha "${selectedCrop.nombre}"?`)) {
      handleDelete(selectedCrop.id);
    }
  };

  // Cancelar edicion / crear
  const handleCancel = () => {
    setEditingCrop(null);
    setEditingWorkerIds([]);
    setShowForm(false);
    setError(null);
  };

  // Toggle mostrar formulario
  const handleToggleForm = () => {
    if (showForm) {
      handleCancel();
    } else {
      setShowForm(true);
      setEditingCrop(null);
      setEditingWorkerIds([]);
    }
  };

  return (
    <div className="crop-page">
      <header className="crop-page-header">
        <h1>Gestion de Cosechas</h1>
        <button
          className={`btn-toggle-form ${showForm ? 'active' : ''}`}
          onClick={handleToggleForm}
        >
          {showForm ? 'Cerrar Formulario' : '+ Nueva Cosecha'}
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <span className="error-icon">!</span>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError(null)}>x</button>
        </div>
      )}

      <div className="crop-page-content">
        <CropList
          crops={crops}
          onSelect={handleSelect}
          loading={loading && !showForm}
        />
      </div>

      {/* Modal del formulario (crear / editar) */}
      {showForm && (
        <div className="crop-form-overlay" onClick={handleCancel}>
          <div className="crop-form-modal" onClick={(e) => e.stopPropagation()}>
            <CropForm
              initialData={editingCrop}
              onSubmit={editingCrop ? handleUpdate : handleCreate}
              onCancel={handleCancel}
              loading={loading}
              workers={workers}
              initialWorkerIds={editingWorkerIds}
            />
          </div>
        </div>
      )}

      {/* Modal de detalle del cultivo - solo lectura */}
      {selectedCrop && (
        <div className="crop-detail-overlay" onClick={() => setSelectedCrop(null)}>
          <div className="crop-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crop-detail-header">
              <div className="crop-detail-header-info">
                <h2>{selectedCrop.nombre}</h2>
                <div className="crop-detail-badges">
                  <span className="crop-detail-tipo">{selectedCrop.tipo}</span>
                  <span
                    className="crop-detail-estado"
                    style={{ backgroundColor: ESTADO_COLORS[selectedCrop.estado] || '#6c757d' }}
                  >
                    {ESTADO_LABELS[selectedCrop.estado] || selectedCrop.estado}
                  </span>
                </div>
              </div>
              <button className="crop-detail-close" onClick={() => setSelectedCrop(null)}>
                &times;
              </button>
            </div>

            {selectedCrop.imagen_url && (
              <img
                src={getFullImageUrl(selectedCrop.imagen_url)}
                alt={selectedCrop.nombre}
                className="crop-detail-image"
              />
            )}

            <div className="crop-detail-body">
              {selectedCrop.variedad && (
                <div className="crop-detail-row">
                  <span className="crop-detail-label">Variedad</span>
                  <span className="crop-detail-value">{selectedCrop.variedad}</span>
                </div>
              )}

              {selectedCrop.area_hectareas && (
                <div className="crop-detail-row">
                  <span className="crop-detail-label">Area</span>
                  <span className="crop-detail-value">{selectedCrop.area_hectareas} ha</span>
                </div>
              )}

              {selectedCrop.ubicacion && (
                <div className="crop-detail-row">
                  <span className="crop-detail-label">Ubicacion</span>
                  <span className="crop-detail-value">{selectedCrop.ubicacion}</span>
                </div>
              )}

              {selectedCrop.fecha_siembra && (
                <div className="crop-detail-row">
                  <span className="crop-detail-label">Siembra</span>
                  <span className="crop-detail-value">{formatDate(selectedCrop.fecha_siembra)}</span>
                </div>
              )}

              {selectedCrop.fecha_cosecha_estimada && (
                <div className="crop-detail-row">
                  <span className="crop-detail-label">Cosecha est.</span>
                  <span className="crop-detail-value">{formatDate(selectedCrop.fecha_cosecha_estimada)}</span>
                </div>
              )}

              {selectedCrop.notas && (
                <div className="crop-detail-notas">
                  <span className="crop-detail-label">Notas</span>
                  <p className="crop-detail-notas-text">{selectedCrop.notas}</p>
                </div>
              )}

              {selectedCropWorkers.length > 0 && (
                <div className="crop-detail-workers">
                  <span className="crop-detail-label">Trabajadores asignados</span>
                  <div className="crop-detail-workers-list">
                    {selectedCropWorkers.map(w => (
                      <div key={w.id} className="crop-detail-worker-item">
                        <span className="crop-detail-worker-name">{w.nombre} {w.apellido}</span>
                        <span className={`crop-detail-worker-rol ${w.rol}`}>
                          {w.rol === 'supervisor' ? 'Supervisor' : 'Trabajador'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="crop-detail-actions">
              <button className="btn-detail-edit" onClick={() => handleEdit(selectedCrop)}>
                Editar
              </button>
              <button className="btn-detail-delete" onClick={handleDeleteFromModal}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropPage;
