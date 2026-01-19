import React from 'react';
import WorkerCard from '../Card/WorkerCard';
import './WorkerList.css';

const WorkerList = ({ workers, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="worker-list-loading">
        <div className="loading-spinner"></div>
        <p>Cargando trabajadores...</p>
      </div>
    );
  }

  if (!workers || workers.length === 0) {
    return (
      <div className="worker-list-empty">
        <div className="empty-icon">👥</div>
        <h3>No hay trabajadores registrados</h3>
        <p>Crea tu primer trabajador usando el formulario de arriba.</p>
      </div>
    );
  }

  return (
    <div className="worker-list">
      <div className="worker-list-header">
        <h2>Trabajadores</h2>
        <span className="worker-count">{workers.length} trabajador{workers.length !== 1 ? 'es' : ''}</span>
      </div>

      <div className="worker-grid">
        {workers.map((worker) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkerList;
