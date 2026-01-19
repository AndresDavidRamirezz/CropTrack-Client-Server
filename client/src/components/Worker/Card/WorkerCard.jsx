import React from 'react';
import './WorkerCard.css';

const ROL_COLORS = {
  trabajador: '#0d6efd',
  supervisor: '#198754'
};

const ROL_LABELS = {
  trabajador: 'Trabajador',
  supervisor: 'Supervisor'
};

const formatDate = (dateString) => {
  if (!dateString) return 'Nunca';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const WorkerCard = ({ worker, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`¿Estas seguro de eliminar a "${worker.nombre} ${worker.apellido}"?`)) {
      onDelete(worker.id);
    }
  };

  return (
    <div className="worker-card">
      <div className="worker-card-header">
        <div className="worker-header-info">
          <h3 className="worker-nombre">{worker.nombre} {worker.apellido}</h3>
          <span className="worker-username">@{worker.nombre_usuario}</span>
        </div>
        <span
          className="worker-rol-badge"
          style={{ backgroundColor: ROL_COLORS[worker.rol] || '#6c757d' }}
        >
          {ROL_LABELS[worker.rol] || worker.rol}
        </span>
      </div>

      <div className="worker-card-body">
        <div className="worker-info-row">
          <span className="worker-label">Email:</span>
          <span className="worker-value">{worker.email}</span>
        </div>

        {worker.telefono && (
          <div className="worker-info-row">
            <span className="worker-label">Telefono:</span>
            <span className="worker-value">{worker.telefono}</span>
          </div>
        )}

        <div className="worker-info-row">
          <span className="worker-label">Ultimo acceso:</span>
          <span className="worker-value">{formatDate(worker.ultimo_acceso)}</span>
        </div>

        <div className="worker-info-row">
          <span className="worker-label">Registrado:</span>
          <span className="worker-value">{formatDate(worker.created_at)}</span>
        </div>
      </div>

      <div className="worker-card-actions">
        <button
          className="btn-worker btn-edit"
          onClick={() => onEdit(worker)}
        >
          Editar
        </button>
        <button
          className="btn-worker btn-delete"
          onClick={handleDelete}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default WorkerCard;
