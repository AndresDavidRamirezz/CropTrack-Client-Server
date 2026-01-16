import React, { useState, useEffect } from 'react';
import MeasurementForm from '../../components/Measurement/Form/MeasurementForm';
import MeasurementList from '../../components/Measurement/List/MeasurementList';
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

  // Obtener datos del usuario logueado
  const getUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      console.log('[MEASUREMENT-PAGE] userData:', userData);
      return {
        usuario_id: userData?.id,
        empresa: userData?.empresa
      };
    } catch (err) {
      console.error('[MEASUREMENT-PAGE] Error obteniendo userData:', err);
      return { usuario_id: null, empresa: null };
    }
  };

  // Cargar cultivos del usuario
  const fetchCrops = async () => {
    const { usuario_id } = getUserData();

    if (!usuario_id) return;

    try {
      console.log('[MEASUREMENT-PAGE] Cargando cultivos para usuario:', usuario_id);
      const response = await fetch(`${CROPS_API_URL}/user/${usuario_id}`);
      const data = await response.json();

      if (response.ok) {
        setCrops(data);
        console.log('[MEASUREMENT-PAGE] Cultivos cargados:', data.length);
      }
    } catch (err) {
      console.error('[MEASUREMENT-PAGE] Error al cargar cultivos:', err);
    }
  };

  // Cargar mediciones al montar el componente
  const fetchMeasurements = async () => {
    const { usuario_id } = getUserData();

    if (!usuario_id) {
      setError('No se pudo identificar al usuario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[MEASUREMENT-PAGE] Cargando mediciones para usuario:', usuario_id);

      const response = await fetch(`${API_URL}/user/${usuario_id}`);
      const data = await response.json();

      console.log('[MEASUREMENT-PAGE] Response status:', response.status);
      console.log('[MEASUREMENT-PAGE] Data:', data);

      if (response.ok) {
        setMeasurements(data);
        console.log('[MEASUREMENT-PAGE] Mediciones cargadas:', data.length);
      } else {
        throw new Error(data.error || 'Error al cargar las mediciones');
      }
    } catch (err) {
      console.error('[MEASUREMENT-PAGE] Error al cargar mediciones:', err);
      setError(err.message || 'Error al cargar las mediciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
    fetchCrops();
  }, []);

  // Crear nueva medicion
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

      console.log('[MEASUREMENT-PAGE] Creando medicion:', measurementData);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(measurementData)
      });

      const data = await response.json();
      console.log('[MEASUREMENT-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('[MEASUREMENT-PAGE] Medicion creada exitosamente');
        await fetchMeasurements();
        setShowForm(false);
      } else {
        throw new Error(data.error || data.message || 'Error al crear la medicion');
      }
    } catch (err) {
      console.error('[MEASUREMENT-PAGE] Error al crear medicion:', err);
      setError(err.message || 'Error al crear la medicion');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar medicion existente
  const handleUpdate = async (id, formData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('[MEASUREMENT-PAGE] Actualizando medicion:', id, formData);

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('[MEASUREMENT-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('[MEASUREMENT-PAGE] Medicion actualizada exitosamente');
        await fetchMeasurements();
        setEditingMeasurement(null);
        setShowForm(false);
      } else {
        throw new Error(data.error || data.message || 'Error al actualizar la medicion');
      }
    } catch (err) {
      console.error('[MEASUREMENT-PAGE] Error al actualizar medicion:', err);
      setError(err.message || 'Error al actualizar la medicion');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar medicion
  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);

    try {
      console.log('[MEASUREMENT-PAGE] Eliminando medicion:', id);

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      console.log('[MEASUREMENT-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('[MEASUREMENT-PAGE] Medicion eliminada exitosamente');
        await fetchMeasurements();
      } else {
        throw new Error(data.error || 'Error al eliminar la medicion');
      }
    } catch (err) {
      console.error('[MEASUREMENT-PAGE] Error al eliminar medicion:', err);
      setError(err.message || 'Error al eliminar la medicion');
    } finally {
      setLoading(false);
    }
  };

  // Activar modo edicion
  const handleEdit = (measurement) => {
    setEditingMeasurement(measurement);
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edicion / crear
  const handleCancel = () => {
    setEditingMeasurement(null);
    setShowForm(false);
    setError(null);
  };

  // Toggle mostrar formulario
  const handleToggleForm = () => {
    if (showForm) {
      handleCancel();
    } else {
      setShowForm(true);
      setEditingMeasurement(null);
    }
  };

  return (
    <div className="measurement-page">
      <header className="measurement-page-header">
        <div className="header-content">
          <h1>Gestion de Mediciones</h1>
          <p>Registra y administra las mediciones de tus cultivos</p>
        </div>
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
          <button className="error-close" onClick={() => setError(null)}>x</button>
        </div>
      )}

      <div className="measurement-page-content">
        {showForm && (
          <MeasurementForm
            initialData={editingMeasurement}
            crops={crops}
            onSubmit={editingMeasurement ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            loading={loading}
          />
        )}

        <MeasurementList
          measurements={measurements}
          crops={crops}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading && !showForm}
        />
      </div>
    </div>
  );
};

export default MeasurementPage;
