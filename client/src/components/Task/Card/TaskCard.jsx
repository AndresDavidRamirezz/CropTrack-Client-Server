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

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${url}`;
};

const TaskCard = ({ task, crops, onSelect }) => {
  const getCropName = () => {
    if (!task.cultivo_id) return null;
    const crop = crops?.find(c => c.id === task.cultivo_id);
    return crop ? crop.nombre : task.cultivo_nombre || null;
  };

  const estadoColor = ESTADO_COLORS[task.estado] || '#6c757d';
  const estadoLabel = ESTADO_LABELS[task.estado] || task.estado;
  const cropName = getCropName();
  const asignadoNombre = task.asignado_nombre
    ? `${task.asignado_nombre} ${task.asignado_apellido || ''}`.trim()
    : null;

  return (
    <div className="task-card" onClick={() => onSelect(task)}>
      <div className="task-col">
        <span className="task-col-label">Tarea</span>
        <span className="task-card-name">{task.titulo}</span>
      </div>
      <div className="task-col">
        <span className="task-col-label">Cosecha</span>
        <span className="task-col-value">{cropName || '—'}</span>
      </div>
      <div className="task-col">
        <span className="task-col-label">Fecha límite</span>
        <span className="task-col-value">{formatDate(task.fecha_limite) || '—'}</span>
      </div>
      <div className="task-col">
        <span className="task-col-label">Asignado a</span>
        <span className="task-col-value">{asignadoNombre || '—'}</span>
      </div>
      <span className="task-card-estado" style={{ backgroundColor: estadoColor }}>
        {estadoLabel}
      </span>
    </div>
  );
};

export { ESTADO_COLORS, ESTADO_LABELS, PRIORIDAD_COLORS, PRIORIDAD_LABELS, formatDate, getFullImageUrl };
export default TaskCard;
