import React, { useState, useEffect } from 'react';
import WorkerForm from '../../components/Worker/Form/WorkerForm';
import WorkerList from '../../components/Worker/List/WorkerList';
import { ROL_COLORS, ROL_LABELS, getFullImageUrl, formatDate } from '../../components/Worker/Card/WorkerCard';
import './WorkerPage.css';

const API_URL = 'http://localhost:4000/api/users';

const WorkerPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const getUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      return {
        id: userData?.id,
        empresa: userData?.empresa
      };
    } catch (err) {
      return { id: null, empresa: null };
    }
  };

  const fetchWorkers = async () => {
    const { empresa } = getUserData();

    if (!empresa) {
      setError('No se pudo identificar la empresa');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/empresa/${encodeURIComponent(empresa)}`);
      const data = await response.json();

      if (response.ok) {
        setWorkers(data);
      } else {
        throw new Error(data.error || 'Error al cargar los trabajadores');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los trabajadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

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

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workerData)
      });

      const data = await response.json();

      if (response.ok) {
        await fetchWorkers();
        setShowForm(false);
      } else {
        throw new Error(data.message || data.error || 'Error al crear el trabajador');
      }
    } catch (err) {
      setError(err.message || 'Error al crear el trabajador');
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
        await fetchWorkers();
        setEditingWorker(null);
        setShowForm(false);
      } else {
        throw new Error(data.message || data.error || 'Error al actualizar el trabajador');
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar el trabajador');
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
        setSelectedWorker(null);
        await fetchWorkers();
      } else {
        throw new Error(data.message || data.error || 'Error al eliminar el trabajador');
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar el trabajador');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (worker) => {
    setSelectedWorker(null);
    setEditingWorker(worker);
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelect = (worker) => {
    setSelectedWorker(worker);
  };

  const handleDeleteFromModal = () => {
    if (selectedWorker && window.confirm(`Estas seguro de eliminar a "${selectedWorker.nombre} ${selectedWorker.apellido}"?`)) {
      handleDelete(selectedWorker.id);
    }
  };

  const handleCancel = () => {
    setEditingWorker(null);
    setShowForm(false);
    setError(null);
  };

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
        <div className="worker-header-content">
          <h1>Gestion de Trabajadores</h1>
          <p>Administra los trabajadores y supervisores de tu empresa</p>
        </div>
        <button
          className={`worker-btn-toggle-form ${showForm ? 'active' : ''}`}
          onClick={handleToggleForm}
        >
          {showForm ? 'Cerrar Formulario' : '+ Nuevo Trabajador'}
        </button>
      </header>

      {error && (
        <div className="worker-error-banner">
          <span className="worker-error-icon">!</span>
          <span>{error}</span>
          <button className="worker-error-close" onClick={() => setError(null)}>x</button>
        </div>
      )}

      <div className="worker-page-content">
        {showForm && (
          <div className="worker-form-overlay" onClick={handleCancel}>
            <div className="worker-form-modal" onClick={(e) => e.stopPropagation()}>
              <WorkerForm
                initialData={editingWorker}
                onSubmit={editingWorker ? handleUpdate : handleCreate}
                onCancel={handleCancel}
                loading={loading}
              />
            </div>
          </div>
        )}

        <WorkerList
          workers={workers}
          onSelect={handleSelect}
          loading={loading && !showForm}
        />
      </div>

      {/* Modal de detalle del trabajador */}
      {selectedWorker && (
        <div className="worker-detail-overlay" onClick={() => setSelectedWorker(null)}>
          <div className="worker-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="worker-detail-header">
              <div className="worker-detail-header-info">
                <h2>{selectedWorker.nombre} {selectedWorker.apellido}</h2>
                <div className="worker-detail-badges">
                  <span className="worker-detail-username">@{selectedWorker.nombre_usuario}</span>
                  <span
                    className="worker-detail-rol"
                    style={{ backgroundColor: ROL_COLORS[selectedWorker.rol] || '#6c757d' }}
                  >
                    {ROL_LABELS[selectedWorker.rol] || selectedWorker.rol}
                  </span>
                </div>
              </div>
              <button className="worker-detail-close" onClick={() => setSelectedWorker(null)}>
                &times;
              </button>
            </div>

            {selectedWorker.imagen_url && (
              <img
                src={getFullImageUrl(selectedWorker.imagen_url)}
                alt={`${selectedWorker.nombre} ${selectedWorker.apellido}`}
                className="worker-detail-image"
              />
            )}

            <div className="worker-detail-body">
              <div className="worker-detail-row">
                <span className="worker-detail-label">Email</span>
                <span className="worker-detail-value">{selectedWorker.email}</span>
              </div>

              {selectedWorker.telefono && (
                <div className="worker-detail-row">
                  <span className="worker-detail-label">Telefono</span>
                  <span className="worker-detail-value">{selectedWorker.telefono}</span>
                </div>
              )}

              <div className="worker-detail-row">
                <span className="worker-detail-label">Empresa</span>
                <span className="worker-detail-value">{selectedWorker.empresa}</span>
              </div>

              <div className="worker-detail-row">
                <span className="worker-detail-label">Ultimo acceso</span>
                <span className="worker-detail-value">{formatDate(selectedWorker.ultimo_acceso)}</span>
              </div>

              <div className="worker-detail-row">
                <span className="worker-detail-label">Registrado</span>
                <span className="worker-detail-value">{formatDate(selectedWorker.created_at)}</span>
              </div>
            </div>

            <div className="worker-detail-actions">
              <button className="worker-btn-detail-edit" onClick={() => handleEdit(selectedWorker)}>
                Editar
              </button>
              <button className="worker-btn-detail-delete" onClick={handleDeleteFromModal}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerPage;
