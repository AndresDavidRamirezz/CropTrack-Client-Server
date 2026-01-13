import React from 'react';
import './CropCard.css';

const ESTADO_COLORS = {
  planificado: '#6c757d',
  sembrado: '#0d6efd',
  en_crecimiento: '#198754',
  maduro: '#ffc107',
  cosechado: '#20c997',
  cancelado: '#dc3545'
};

const ESTADO_LABELS = {
  planificado: 'Planificado',
  sembrado: 'Sembrado',
  en_crecimiento: 'En Crecimiento',
  maduro: 'Maduro',
  cosechado: 'Cosechado',
  cancelado: 'Cancelado'
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

const CropCard = ({ crop, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de eliminar la cosecha "${crop.nombre}"?`)) {
      onDelete(crop.id);
    }
  };

  return (
    <div className="crop-card">
      <div className="crop-card-header">
        <h3 className="crop-nombre">{crop.nombre}</h3>
        <span className="crop-tipo">{crop.tipo}</span>
      </div>

      <span
        className="crop-estado-badge"
        style={{ backgroundColor: ESTADO_COLORS[crop.estado] || '#6c757d' }}
      >
        {ESTADO_LABELS[crop.estado] || crop.estado}
      </span>

      <div className="crop-card-body">
        {crop.variedad && (
          <div className="crop-info-row">
            <span className="crop-label">Variedad:</span>
            <span className="crop-value">{crop.variedad}</span>
          </div>
        )}

        {crop.area_hectareas && (
          <div className="crop-info-row">
            <span className="crop-label">Área:</span>
            <span className="crop-value">{crop.area_hectareas} ha</span>
          </div>
        )}

        {crop.ubicacion && (
          <div className="crop-info-row">
            <span className="crop-label">Ubicación:</span>
            <span className="crop-value">{crop.ubicacion}</span>
          </div>
        )}

        {crop.fecha_siembra && (
          <div className="crop-info-row">
            <span className="crop-label">Siembra:</span>
            <span className="crop-value">{formatDate(crop.fecha_siembra)}</span>
          </div>
        )}

        {crop.fecha_cosecha_estimada && (
          <div className="crop-info-row">
            <span className="crop-label">Cosecha est.:</span>
            <span className="crop-value">{formatDate(crop.fecha_cosecha_estimada)}</span>
          </div>
        )}

        {crop.notas && (
          <div className="crop-notas">
            <span className="crop-label">Notas:</span>
            <p className="crop-notas-text">{crop.notas}</p>
          </div>
        )}
      </div>

      <div className="crop-card-actions">
        <button
          className="btn-crop btn-edit"
          onClick={() => onEdit(crop)}
        >
          Editar
        </button>
        <button
          className="btn-crop btn-delete"
          onClick={handleDelete}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default CropCard;
