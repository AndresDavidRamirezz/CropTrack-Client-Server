import React, { useState, useEffect } from 'react';
import MeasurementForm from '../../components/Measurement/Form/MeasurementForm';
import MeasurementList from '../../components/Measurement/List/MeasurementList';
import { TIPO_COLORS, TIPO_LABELS, UNIDAD_LABELS, formatDate } from '../../components/Measurement/Card/MeasurementCard';
import './MeasurementPage.css';

const API_URL = 'http://localhost:4000/api/measurements';
const CROPS_API_URL = 'http://localhost:4000/api/crops';

const MeasurementPage = () => {
  const [measurements, setMeasurements] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);

  const getUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      return {
        usuario_id: userData?.id,
        empresa: userData?.empresa
      };
    } catch (err) {
      return { usuario_id: null, empresa: null };
    }
  };

  const getCropName = (cultivoId) => {
    const crop = crops?.find(c => c.id === cultivoId);
    return crop ? crop.nombre : 'Cultivo no encontrado';
  };

  const fetchCrops = async () => {
    const { usuario_id } = getUserData();
    if (!usuario_id) return;

    try {
      const response = await fetch(`${CROPS_API_URL}/user/${usuario_id}`);
      const data = await response.json();
      if (response.ok) {
        setCrops(data);
      }
    } catch (err) {
      // Error silencioso al cargar cultivos
    }
  };

  const fetchMeasurements = async () => {
    const { usuario_id } = getUserData();

    if (!usuario_id) {
      setError('No se pudo identificar al usuario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/user/${usuario_id}`);
      const data = await response.json();

      if (response.ok) {
        setMeasurements(data);
      } else {
        throw new Error(data.error || 'Error al cargar las mediciones');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar las mediciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
    fetchCrops();
  }, []);

  const handleCreate = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const { usuario_id } = getUserData();

      if (!usuario_id) {
        throw new Error('No se pudo obtener la informacion del usuario');
      }

      const measurementData = {
        ...formData,
        usuario_id
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(measurementData)
      });

      const data = await response.json();

      if (response.ok) {
        await fetchMeasurements();
        setShowForm(false);
      } else {
        throw new Error(data.error || data.message || 'Error al crear la medicion');
      }
    } catch (err) {
      setError(err.message || 'Error al crear la medicion');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        await fetchMeasurements();
        setEditingMeasurement(null);
        setShowForm(false);
      } else {
        throw new Error(data.error || data.message || 'Error al actualizar la medicion');
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar la medicion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        await fetchMeasurements();
      } else {
        throw new Error(data.error || 'Error al eliminar la medicion');
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar la medicion');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (measurement) => {
    setSelectedMeasurement(null);
    setEditingMeasurement(measurement);
    setShowForm(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditingMeasurement(null);
    setShowForm(false);
    setError(null);
  };

  const handleToggleForm = () => {
    if (showForm) {
      handleCancel();
    } else {
      setShowForm(true);
      setEditingMeasurement(null);
    }
  };

  const handleSelect = (measurement) => {
    setSelectedMeasurement(measurement);
  };

  const handleDeleteFromModal = () => {
    if (window.confirm('¿Estas seguro de que deseas eliminar esta medicion?')) {
      handleDelete(selectedMeasurement.id);
      setSelectedMeasurement(null);
    }
  };

  return (
    <div className="measurement-page">
      <header className="measurement-page-header">
        <h1>Gestion de Mediciones</h1>
        <button
          className={`btn-toggle-form ${showForm ? 'active' : ''}`}
          onClick={handleToggleForm}
        >
          {showForm ? 'Cerrar Formulario' : '+ Nueva Medicion'}
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <span className="error-icon">!</span>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <div className="measurement-form-overlay" onClick={handleCancel}>
          <div className="measurement-form-modal" onClick={(e) => e.stopPropagation()}>
            <MeasurementForm
              initialData={editingMeasurement}
              crops={crops}
              onSubmit={editingMeasurement ? handleUpdate : handleCreate}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </div>
      )}

      <div className="measurement-page-content">
        <MeasurementList
          measurements={measurements}
          crops={crops}
          onSelect={handleSelect}
          loading={loading && !showForm}
        />
      </div>

      {selectedMeasurement && (
        <div className="measurement-detail-overlay" onClick={() => setSelectedMeasurement(null)}>
          <div className="measurement-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="measurement-detail-header">
              <div className="measurement-detail-header-info">
                <h2>{getCropName(selectedMeasurement.cultivo_id)}</h2>
                <div className="measurement-detail-badges">
                  <span
                    className="measurement-detail-tipo"
                    style={{ backgroundColor: TIPO_COLORS[selectedMeasurement.tipo_medicion] || '#6c757d' }}
                  >
                    {TIPO_LABELS[selectedMeasurement.tipo_medicion] || selectedMeasurement.tipo_medicion}
                  </span>
                </div>
              </div>
              <button className="measurement-detail-close" onClick={() => setSelectedMeasurement(null)}>
                &times;
              </button>
            </div>

            <div className="measurement-detail-value-section">
              <span className="measurement-detail-number">{selectedMeasurement.valor}</span>
              <span className="measurement-detail-unit">
                {UNIDAD_LABELS[selectedMeasurement.unidad] || selectedMeasurement.unidad}
              </span>
            </div>

            <div className="measurement-detail-body">
              {selectedMeasurement.fecha_medicion && (
                <div className="measurement-detail-row">
                  <span className="measurement-detail-label">Fecha de Medicion</span>
                  <span className="measurement-detail-value">{formatDate(selectedMeasurement.fecha_medicion)}</span>
                </div>
              )}

              <div className="measurement-detail-row">
                <span className="measurement-detail-label">Cultivo</span>
                <span className="measurement-detail-value">{getCropName(selectedMeasurement.cultivo_id)}</span>
              </div>

              <div className="measurement-detail-row">
                <span className="measurement-detail-label">Tipo</span>
                <span className="measurement-detail-value">
                  {TIPO_LABELS[selectedMeasurement.tipo_medicion] || selectedMeasurement.tipo_medicion}
                </span>
              </div>

              <div className="measurement-detail-row">
                <span className="measurement-detail-label">Unidad</span>
                <span className="measurement-detail-value">
                  {UNIDAD_LABELS[selectedMeasurement.unidad] || selectedMeasurement.unidad}
                </span>
              </div>

              {selectedMeasurement.observaciones && (
                <div className="measurement-detail-observaciones">
                  <span className="measurement-detail-label">Observaciones</span>
                  <p className="measurement-detail-observaciones-text">
                    {selectedMeasurement.observaciones}
                  </p>
                </div>
              )}
            </div>

            <div className="measurement-detail-actions">
              <button className="btn-detail-edit" onClick={() => handleEdit(selectedMeasurement)}>
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

export default MeasurementPage;
