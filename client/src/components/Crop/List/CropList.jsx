import React from 'react';
import CropCard from '../Card/CropCard';
import './CropList.css';

const CropList = ({ crops, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="crop-list-loading">
        <div className="loading-spinner"></div>
        <p>Cargando cosechas...</p>
      </div>
    );
  }

  if (!crops || crops.length === 0) {
    return (
      <div className="crop-list-empty">
        <div className="empty-icon">🌱</div>
        <h3>No hay cosechas registradas</h3>
        <p>Crea tu primera cosecha usando el formulario de arriba.</p>
      </div>
    );
  }

  return (
    <div className="crop-list">
      <div className="crop-list-header">
        <h2>Mis Cosechas</h2>
        <span className="crop-count">{crops.length} cosecha{crops.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="crop-grid">
        {crops.map((crop) => (
          <CropCard
            key={crop.id}
            crop={crop}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default CropList;
