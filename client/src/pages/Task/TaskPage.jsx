import React, { useState, useEffect } from 'react';
import TaskForm from '../../components/Task/Form/TaskForm';
import TaskList from '../../components/Task/List/TaskList';
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

  // Obtener datos del usuario logueado
  const getUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      console.log('[TASK-PAGE] userData:', userData);
      return {
        usuario_id: userData?.id,
        empresa: userData?.empresa
      };
    } catch (err) {
      console.error('[TASK-PAGE] Error obteniendo userData:', err);
      return { usuario_id: null, empresa: null };
    }
  };

  // Cargar cultivos del usuario
  const fetchCrops = async () => {
    const { usuario_id } = getUserData();

    if (!usuario_id) return;

    try {
      console.log('[TASK-PAGE] Cargando cultivos para usuario:', usuario_id);
      const response = await fetch(`${CROPS_API_URL}/user/${usuario_id}`);
      const data = await response.json();

      if (response.ok) {
        setCrops(data);
        console.log('[TASK-PAGE] Cultivos cargados:', data.length);
      }
    } catch (err) {
      console.error('[TASK-PAGE] Error al cargar cultivos:', err);
    }
  };

  // Cargar tareas al montar el componente
  const fetchTasks = async () => {
    const { usuario_id } = getUserData();

    if (!usuario_id) {
      setError('No se pudo identificar al usuario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[TASK-PAGE] Cargando tareas para usuario:', usuario_id);

      const response = await fetch(`${API_URL}/user/${usuario_id}`);
      const data = await response.json();

      console.log('[TASK-PAGE] Response status:', response.status);
      console.log('[TASK-PAGE] Data:', data);

      if (response.ok) {
        setTasks(data);
        console.log('[TASK-PAGE] Tareas cargadas:', data.length);
      } else {
        throw new Error(data.error || 'Error al cargar las tareas');
      }
    } catch (err) {
      console.error('[TASK-PAGE] Error al cargar tareas:', err);
      setError(err.message || 'Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCrops();
  }, []);

  // Crear nueva tarea
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

      console.log('[TASK-PAGE] Creando tarea:', taskData);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      const data = await response.json();
      console.log('[TASK-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('[TASK-PAGE] Tarea creada exitosamente');
        await fetchTasks();
        setShowForm(false);
      } else {
        throw new Error(data.error || data.message || 'Error al crear la tarea');
      }
    } catch (err) {
      console.error('[TASK-PAGE] Error al crear tarea:', err);
      setError(err.message || 'Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar tarea existente
  const handleUpdate = async (id, formData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('[TASK-PAGE] Actualizando tarea:', id, formData);

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('[TASK-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('[TASK-PAGE] Tarea actualizada exitosamente');
        await fetchTasks();
        setEditingTask(null);
        setShowForm(false);
      } else {
        throw new Error(data.error || data.message || 'Error al actualizar la tarea');
      }
    } catch (err) {
      console.error('[TASK-PAGE] Error al actualizar tarea:', err);
      setError(err.message || 'Error al actualizar la tarea');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar tarea
  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);

    try {
      console.log('[TASK-PAGE] Eliminando tarea:', id);

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      console.log('[TASK-PAGE] Response:', response.status, data);

      if (response.ok) {
        console.log('[TASK-PAGE] Tarea eliminada exitosamente');
        await fetchTasks();
      } else {
        throw new Error(data.error || 'Error al eliminar la tarea');
      }
    } catch (err) {
      console.error('[TASK-PAGE] Error al eliminar tarea:', err);
      setError(err.message || 'Error al eliminar la tarea');
    } finally {
      setLoading(false);
    }
  };

  // Activar modo edicion
  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edicion / crear
  const handleCancel = () => {
    setEditingTask(null);
    setShowForm(false);
    setError(null);
  };

  // Toggle mostrar formulario
  const handleToggleForm = () => {
    if (showForm) {
      handleCancel();
    } else {
      setShowForm(true);
      setEditingTask(null);
    }
  };

  return (
    <div className="task-page">
      <header className="task-page-header">
        <div className="header-content">
          <h1>Gestion de Tareas</h1>
          <p>Organiza y administra las tareas de tus cultivos</p>
        </div>
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
        {showForm && (
          <TaskForm
            initialData={editingTask}
            crops={crops}
            onSubmit={editingTask ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            loading={loading}
          />
        )}

        <TaskList
          tasks={tasks}
          crops={crops}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading && !showForm}
        />
      </div>
    </div>
  );
};

export default TaskPage;
