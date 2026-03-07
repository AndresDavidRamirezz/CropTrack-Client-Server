import React from 'react';
import MeasurementCard from '../Card/MeasurementCard';
import './MeasurementList.css';

const groupByCrop = (measurements) => {
  return measurements.reduce((acc, measurement) => {
    const key = measurement.cultivo_id || 'sin-cultivo';
    if (!acc[key]) {
      acc[key] = { nombre: measurement.cultivo_nombre || 'Sin cultivo', items: [] };
    }
    acc[key].items.push(measurement);
    return acc;
  }, {});
};

const MeasurementList = ({ measurements, crops, onSelect, loading }) => {
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

  const grouped = groupByCrop(measurements);

  return (
    <div className="measurement-list">
      <div className="measurement-list-header">
        <h2>Mis Mediciones</h2>
        <span className="measurement-count">{measurements.length} medicion{measurements.length !== 1 ? 'es' : ''}</span>
      </div>

      {Object.values(grouped).map((group) => (
        <div key={group.nombre} className="measurement-group">
          <div className="measurement-grid">
            {group.items.map((measurement) => (
              <MeasurementCard
                key={measurement.id}
                measurement={measurement}
                crops={crops}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeasurementList;
