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

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${url}`;
};

const CropCard = ({ crop, onSelect }) => {
  return (
    <div className="crop-card" onClick={() => onSelect(crop)}>
      <div className="crop-card-thumb">
        {crop.imagen_url ? (
          <img src={getFullImageUrl(crop.imagen_url)} alt={crop.nombre} />
        ) : (
          <span className="crop-card-thumb-icon">🌱</span>
        )}
      </div>
      <div className="crop-card-info">
        <h3 className="crop-card-name">{crop.nombre}</h3>
        {crop.ubicacion && (
          <span className="crop-card-location">{crop.ubicacion}</span>
        )}
        {crop.fecha_cosecha_estimada && (
          <span className="crop-card-date">Cosecha: {formatDate(crop.fecha_cosecha_estimada)}</span>
        )}
      </div>
      <span
        className="crop-card-estado"
        style={{ backgroundColor: ESTADO_COLORS[crop.estado] || '#6c757d' }}
      >
        {ESTADO_LABELS[crop.estado] || crop.estado}
      </span>
    </div>
  );
};

export { ESTADO_COLORS, ESTADO_LABELS, formatDate, getFullImageUrl };
export default CropCard;
