import React from 'react';
import './TaskCard.css';

const ESTADO_COLORS = {
  pendiente: '#6c757d',
  en_proceso: '#0d6efd',
  completada: '#198754',
  cancelada: '#dc3545'
};

const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  completada: 'Completada',
  cancelada: 'Cancelada'
};

const PRIORIDAD_COLORS = {
  baja: '#6c757d',
  media: '#0d6efd',
  alta: '#f59e0b',
  urgente: '#dc3545'
};

const PRIORIDAD_LABELS = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente'
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const TaskCard = ({ task, crops, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`¿Estas seguro de eliminar la tarea "${task.titulo}"?`)) {
      onDelete(task.id);
    }
  };

  // Obtener nombre del cultivo
  const getCropName = () => {
    if (!task.cultivo_id) return null;
    const crop = crops?.find(c => c.id === task.cultivo_id);
    return crop ? crop.nombre : 'Cultivo no encontrado';
  };

  const estadoColor = ESTADO_COLORS[task.estado] || '#6c757d';
  const estadoLabel = ESTADO_LABELS[task.estado] || task.estado;
  const prioridadColor = PRIORIDAD_COLORS[task.prioridad] || '#6c757d';
  const prioridadLabel = PRIORIDAD_LABELS[task.prioridad] || task.prioridad;
  const cropName = getCropName();

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-titulo">{task.titulo}</h3>
        <span
          className="task-prioridad-badge"
          style={{ backgroundColor: prioridadColor }}
        >
          {prioridadLabel}
        </span>
      </div>

      <span
        className="task-estado-badge"
        style={{ backgroundColor: estadoColor }}
      >
        {estadoLabel}
      </span>

      <div className="task-card-body">
        {cropName && (
          <div className="task-info-row">
            <span className="task-label">Cultivo:</span>
            <span className="task-value">{cropName}</span>
          </div>
        )}

        {task.fecha_inicio && (
          <div className="task-info-row">
            <span className="task-label">Inicio:</span>
            <span className="task-value">{formatDate(task.fecha_inicio)}</span>
          </div>
        )}

        {task.fecha_limite && (
          <div className="task-info-row">
            <span className="task-label">Limite:</span>
            <span className="task-value task-fecha-limite">{formatDate(task.fecha_limite)}</span>
          </div>
        )}

        {task.asignado_a && (
          <div className="task-info-row">
            <span className="task-label">Asignado:</span>
            <span className="task-value task-asignado">{task.asignado_a.substring(0, 8)}...</span>
          </div>
        )}

        {task.descripcion && (
          <div className="task-descripcion">
            <span className="task-label">Descripcion:</span>
            <p className="task-descripcion-text">{task.descripcion}</p>
          </div>
        )}

        {task.observaciones && (
          <div className="task-observaciones">
            <span className="task-label">Observaciones:</span>
            <p className="task-observaciones-text">{task.observaciones}</p>
          </div>
        )}
      </div>

      <div className="task-card-actions">
        <button
          className="btn-task btn-edit"
          onClick={() => onEdit(task)}
        >
          Editar
        </button>
        <button
          className="btn-task btn-delete"
          onClick={handleDelete}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
