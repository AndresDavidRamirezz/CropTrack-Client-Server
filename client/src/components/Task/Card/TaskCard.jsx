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
  return `http://localhost:4000${url}`;
};

const TaskCard = ({ task, crops, onSelect }) => {
  const getCropName = () => {
    if (!task.cultivo_id) return null;
    const crop = crops?.find(c => c.id === task.cultivo_id);
    return crop ? crop.nombre : 'Cultivo no encontrado';
  };

  const estadoColor = ESTADO_COLORS[task.estado] || '#6c757d';
  const estadoLabel = ESTADO_LABELS[task.estado] || task.estado;
  const cropName = getCropName();

  return (
    <div className="task-card" onClick={() => onSelect(task)}>
      <div className="task-card-info">
        <h3 className="task-card-name">{task.titulo}</h3>
        {cropName && (
          <span className="task-card-crop">{cropName}</span>
        )}
        {task.fecha_limite && (
          <span className="task-card-date">Limite: {formatDate(task.fecha_limite)}</span>
        )}
      </div>
      <span
        className="task-card-estado"
        style={{ backgroundColor: estadoColor }}
      >
        {estadoLabel}
      </span>
    </div>
  );
};

export { ESTADO_COLORS, ESTADO_LABELS, PRIORIDAD_COLORS, PRIORIDAD_LABELS, formatDate, getFullImageUrl };
export default TaskCard;
