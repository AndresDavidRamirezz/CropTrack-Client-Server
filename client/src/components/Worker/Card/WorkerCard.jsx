import React from 'react';
import './WorkerCard.css';

const ROL_COLORS = {
  trabajador: '#0d6efd',
  supervisor: '#AB47BC'
};

const ROL_LABELS = {
  trabajador: 'Trabajador',
  supervisor: 'Supervisor'
};

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:4000${url}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Nunca';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const WorkerCard = ({ worker, onSelect }) => {
  return (
    <div className="worker-card" onClick={() => onSelect(worker)}>
      <div className="worker-card-avatar">
        {worker.imagen_url ? (
          <img src={getFullImageUrl(worker.imagen_url)} alt={`${worker.nombre} ${worker.apellido}`} />
        ) : (
          <span className="worker-card-avatar-icon">👤</span>
        )}
      </div>
      <div className="worker-card-info">
        <h3 className="worker-card-name">{worker.nombre} {worker.apellido}</h3>
        <span
          className="worker-card-rol"
          style={{ backgroundColor: ROL_COLORS[worker.rol] || '#6c757d' }}
        >
          {ROL_LABELS[worker.rol] || worker.rol}
        </span>
      </div>
    </div>
  );
};

export { ROL_COLORS, ROL_LABELS, getFullImageUrl, formatDate };
export default WorkerCard;
