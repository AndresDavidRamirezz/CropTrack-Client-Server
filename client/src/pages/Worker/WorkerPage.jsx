import React, { useState, useEffect } from 'react';
import WorkerForm from '../../components/Worker/Form/WorkerForm';
import WorkerList from '../../components/Worker/List/WorkerList';
import './WorkerPage.css';

const API_URL = 'http://localhost:4000/api/users';

const WorkerPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Obtener datos del usuario logueado
  const getUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      console.log('🔍 [WORKER-PAGE] userData:', userData);
      return {
        id: userData?.id,
        empresa: userData?.empresa
      };
    } catch (err) {
      console.error('❌ [WORKER-PAGE] Error obteniendo userData:', err);
      return { id: null, empresa: null };
    }
  };

  // Cargar workers al montar el componente
  const fetchWorkers = async () => {
    const { empresa } = getUserData();

    if (!empresa) {
      setError('No se pudo identificar la empresa');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🟡 [WORKER-PAGE] Cargando trabajadores para empresa:', empresa);

      const response = await fetch(`${API_URL}/empresa/${encodeURIComponent(empresa)}`);
      const data = await response.json();

      console.log('📥 [WORKER-PAGE] Response status:', response.status);
      console.log('📥 [WORKER-PAGE] Data:', data);

      if (response.ok) {
        setWorkers(data);
        console.log('✅ [WORKER-PAGE] Trabajadores cargados:', data.length);
      } else {
        throw new Error(data.error || 'Error al cargar los trabajadores');
      }
    } catch (err) {
      console.error('❌ [WORKER-PAGE] Error al cargar trabajadores:', err);
      setError(err.message || 'Error al cargar los trabajadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Crear nuevo trabajador
  const handleCreate = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const { empresa } = getUserData();

      if (!empresa) {
        throw new Error('No se pudo obtener la informacion del usuario');
      }

      const workerData = {
        ...formData,
        empresa
      };

      console.log('🟡 [WORKER-PAGE] Creando trabajador:', workerData);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerData)
      });

      const data = await response.json();
      console.log('📥 [WORKER-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('✅ [WORKER-PAGE] Trabajador creado exitosamente');
        await fetchWorkers();
        setShowForm(false);
      } else {
        throw new Error(data.message || data.error || 'Error al crear el trabajador');
      }
    } catch (err) {
      console.error('❌ [WORKER-PAGE] Error al crear trabajador:', err);
      setError(err.message || 'Error al crear el trabajador');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar trabajador existente
  const handleUpdate = async (id, formData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🟡 [WORKER-PAGE] Actualizando trabajador:', id, formData);

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('📥 [WORKER-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('✅ [WORKER-PAGE] Trabajador actualizado exitosamente');
        await fetchWorkers();
        setEditingWorker(null);
        setShowForm(false);
      } else {
        throw new Error(data.message || data.error || 'Error al actualizar el trabajador');
      }
    } catch (err) {
      console.error('❌ [WORKER-PAGE] Error al actualizar trabajador:', err);
      setError(err.message || 'Error al actualizar el trabajador');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar trabajador
  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🟡 [WORKER-PAGE] Eliminando trabajador:', id);

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      console.log('📥 [WORKER-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('✅ [WORKER-PAGE] Trabajador eliminado exitosamente');
        await fetchWorkers();
      } else {
        throw new Error(data.message || data.error || 'Error al eliminar el trabajador');
      }
    } catch (err) {
      console.error('❌ [WORKER-PAGE] Error al eliminar trabajador:', err);
      setError(err.message || 'Error al eliminar el trabajador');
    } finally {
      setLoading(false);
    }
  };

  // Activar modo edicion
  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edicion / crear
  const handleCancel = () => {
    setEditingWorker(null);
    setShowForm(false);
    setError(null);
  };

  // Toggle mostrar formulario
  const handleToggleForm = () => {
    if (showForm) {
      handleCancel();
    } else {
      setShowForm(true);
      setEditingWorker(null);
    }
  };

  return (
    <div className="worker-page">
      <header className="worker-page-header">
        <div className="header-content">
          <h1>Gestion de Trabajadores</h1>
          <p>Administra los trabajadores y supervisores de tu empresa</p>
        </div>
        <button
          className={`btn-toggle-form ${showForm ? 'active' : ''}`}
          onClick={handleToggleForm}
        >
          {showForm ? 'Cerrar Formulario' : '+ Nuevo Trabajador'}
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="worker-page-content">
        {showForm && (
          <WorkerForm
            initialData={editingWorker}
            onSubmit={editingWorker ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            loading={loading}
          />
        )}

        <WorkerList
          workers={workers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading && !showForm}
        />
      </div>
    </div>
  );
};

export default WorkerPage;
