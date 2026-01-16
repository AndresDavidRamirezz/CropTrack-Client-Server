import React from 'react';
import MeasurementCard from '../Card/MeasurementCard';
import './MeasurementList.css';

const MeasurementList = ({ measurements, crops, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="measurement-list-loading">
        <div className="loading-spinner"></div>
        <p>Cargando mediciones...</p>
      </div>
    );
  }

  if (!measurements || measurements.length === 0) {
    return (
      <div className="measurement-list-empty">
        <div className="empty-icon">📊</div>
        <h3>No hay mediciones registradas</h3>
        <p>Crea tu primera medicion usando el formulario de arriba.</p>
      </div>
    );
  }

  return (
    <div className="measurement-list">
      <div className="measurement-list-header">
        <h2>Mis Mediciones</h2>
        <span className="measurement-count">{measurements.length} medicion{measurements.length !== 1 ? 'es' : ''}</span>
      </div>

      <div className="measurement-grid">
        {measurements.map((measurement) => (
          <MeasurementCard
            key={measurement.id}
            measurement={measurement}
            crops={crops}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default MeasurementList;
