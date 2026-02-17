import React, { useState, useEffect } from 'react';
import TaskForm from '../../components/Task/Form/TaskForm';
import TaskList from '../../components/Task/List/TaskList';
import { ESTADO_COLORS, ESTADO_LABELS, PRIORIDAD_COLORS, PRIORIDAD_LABELS, formatDate, getFullImageUrl } from '../../components/Task/Card/TaskCard';
import './TaskPage.css';

const API_URL = 'http://localhost:4000/api/tasks';
const CROPS_API_URL = 'http://localhost:4000/api/crops';

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

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
      console.error('Error al cargar cultivos:', err);
    }
  };

  const fetchTasks = async () => {
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
        setTasks(data);
      } else {
        throw new Error(data.error || 'Error al cargar las tareas');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCrops();
  }, []);

  const handleCreate = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const { usuario_id, empresa } = getUserData();

      if (!usuario_id || !empresa) {
        throw new Error('No se pudo obtener la informacion del usuario');
      }

      const taskData = {
        ...formData,
        empresa,
        creado_por: usuario_id
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      const data = await response.json();

      if (response.ok) {
        await fetchTasks();
        setShowForm(false);
      } else {
        throw new Error(data.error || data.message || 'Error al crear la tarea');
      }
    } catch (err) {
      setError(err.message || 'Error al crear la tarea');
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
        await fetchTasks();
        setEditingTask(null);
        setShowForm(false);
      } else {
        throw new Error(data.error || data.message || 'Error al actualizar la tarea');
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar la tarea');
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
        setSelectedTask(null);
        await fetchTasks();
      } else {
        throw new Error(data.error || 'Error al eliminar la tarea');
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(null);
    setEditingTask(task);
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelect = (task) => {
    setSelectedTask(task);
  };

  const handleDeleteFromModal = () => {
    if (selectedTask && window.confirm(`Estas seguro de eliminar la tarea "${selectedTask.titulo}"?`)) {
      handleDelete(selectedTask.id);
    }
  };

  const handleCancel = () => {
    setEditingTask(null);
    setShowForm(false);
    setError(null);
  };

  const handleToggleForm = () => {
    if (showForm) {
      handleCancel();
    } else {
      setShowForm(true);
      setEditingTask(null);
    }
  };

  const getCropName = (cultivoId) => {
    if (!cultivoId) return null;
    const crop = crops?.find(c => c.id === cultivoId);
    return crop ? crop.nombre : 'Cultivo no encontrado';
  };

  return (
    <div className="task-page">
      <header className="task-page-header">
        <h1>Gestion de Tareas</h1>
        <button
          className={`btn-toggle-form ${showForm ? 'active' : ''}`}
          onClick={handleToggleForm}
        >
          {showForm ? 'Cerrar Formulario' : '+ Nueva Tarea'}
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <span className="error-icon">!</span>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError(null)}>x</button>
        </div>
      )}

      <div className="task-page-content">
        <TaskList
          tasks={tasks}
          crops={crops}
          onSelect={handleSelect}
          loading={loading && !showForm}
        />
      </div>

      {/* Modal del formulario (crear / editar) */}
      {showForm && (
        <div className="task-form-overlay" onClick={handleCancel}>
          <div className="task-form-modal" onClick={(e) => e.stopPropagation()}>
            <TaskForm
              initialData={editingTask}
              crops={crops}
              onSubmit={editingTask ? handleUpdate : handleCreate}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Modal de detalle de la tarea - solo lectura */}
      {selectedTask && (
        <div className="task-detail-overlay" onClick={() => setSelectedTask(null)}>
          <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="task-detail-header">
              <div className="task-detail-header-info">
                <h2>{selectedTask.titulo}</h2>
                <div className="task-detail-badges">
                  <span
                    className="task-detail-prioridad"
                    style={{ backgroundColor: PRIORIDAD_COLORS[selectedTask.prioridad] || '#6c757d' }}
                  >
                    {PRIORIDAD_LABELS[selectedTask.prioridad] || selectedTask.prioridad}
                  </span>
                  <span
                    className="task-detail-estado"
                    style={{ backgroundColor: ESTADO_COLORS[selectedTask.estado] || '#6c757d' }}
                  >
                    {ESTADO_LABELS[selectedTask.estado] || selectedTask.estado}
                  </span>
                </div>
              </div>
              <button className="task-detail-close" onClick={() => setSelectedTask(null)}>
                &times;
              </button>
            </div>

            {selectedTask.imagen_url && (
              <img
                src={getFullImageUrl(selectedTask.imagen_url)}
                alt={selectedTask.titulo}
                className="task-detail-image"
              />
            )}

            <div className="task-detail-body">
              {selectedTask.cultivo_id && (
                <div className="task-detail-row">
                  <span className="task-detail-label">Cultivo</span>
                  <span className="task-detail-value">{getCropName(selectedTask.cultivo_id)}</span>
                </div>
              )}

              {selectedTask.fecha_inicio && (
                <div className="task-detail-row">
                  <span className="task-detail-label">Fecha Inicio</span>
                  <span className="task-detail-value">{formatDate(selectedTask.fecha_inicio)}</span>
                </div>
              )}

              {selectedTask.fecha_limite && (
                <div className="task-detail-row">
                  <span className="task-detail-label">Fecha Limite</span>
                  <span className="task-detail-value">{formatDate(selectedTask.fecha_limite)}</span>
                </div>
              )}

              {selectedTask.asignado_a && (
                <div className="task-detail-row">
                  <span className="task-detail-label">Asignado a</span>
                  <span className="task-detail-value">{selectedTask.asignado_a}</span>
                </div>
              )}

              {selectedTask.descripcion && (
                <div className="task-detail-descripcion">
                  <span className="task-detail-label">Descripcion</span>
                  <p className="task-detail-descripcion-text">{selectedTask.descripcion}</p>
                </div>
              )}

              {selectedTask.observaciones && (
                <div className="task-detail-observaciones">
                  <span className="task-detail-label">Observaciones</span>
                  <p className="task-detail-observaciones-text">{selectedTask.observaciones}</p>
                </div>
              )}
            </div>

            <div className="task-detail-actions">
              <button className="btn-detail-edit" onClick={() => handleEdit(selectedTask)}>
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

export default TaskPage;
