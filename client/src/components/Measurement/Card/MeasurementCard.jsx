import React from 'react';
import './MeasurementCard.css';

const TIPO_COLORS = {
  temperatura: '#ef4444',
  humedad: '#3b82f6',
  ph: '#8b5cf6',
  nutrientes: '#22c55e',
  altura: '#f59e0b',
  peso: '#6366f1',
  rendimiento: '#14b8a6',
  plaga: '#dc2626',
  enfermedad: '#b91c1c',
  riego: '#0ea5e9',
  fertilizacion: '#84cc16',
  otro: '#6c757d'
};

const TIPO_LABELS = {
  temperatura: 'Temperatura',
  humedad: 'Humedad',
  ph: 'pH',
  nutrientes: 'Nutrientes',
  altura: 'Altura',
  peso: 'Peso',
  rendimiento: 'Rendimiento',
  plaga: 'Plaga',
  enfermedad: 'Enfermedad',
  riego: 'Riego',
  fertilizacion: 'Fertilizacion',
  otro: 'Otro'
};

const UNIDAD_LABELS = {
  celsius: 'C',
  fahrenheit: 'F',
  porcentaje: '%',
  ph: 'pH',
  kg: 'kg',
  g: 'g',
  ton: 'ton',
  cm: 'cm',
  m: 'm',
  litros: 'L',
  ml: 'ml',
  unidades: 'u',
  'kg/ha': 'kg/ha',
  'ton/ha': 'ton/ha',
  ppm: 'ppm',
  otro: ''
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

const MeasurementCard = ({ measurement, crops, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`¿Estas seguro de eliminar esta medicion?`)) {
      onDelete(measurement.id);
    }
  };

  // Obtener nombre del cultivo
  const getCropName = () => {
    const crop = crops?.find(c => c.id === measurement.cultivo_id);
    return crop ? crop.nombre : 'Cultivo no encontrado';
  };

  const tipoColor = TIPO_COLORS[measurement.tipo_medicion] || '#6c757d';
  const tipoLabel = TIPO_LABELS[measurement.tipo_medicion] || measurement.tipo_medicion;
  const unidadLabel = UNIDAD_LABELS[measurement.unidad] || measurement.unidad;

  return (
    <div className="measurement-card">
      <div className="measurement-card-header">
        <div className="measurement-crop-name">{getCropName()}</div>
        <span
          className="measurement-tipo-badge"
          style={{ backgroundColor: tipoColor }}
        >
          {tipoLabel}
        </span>
      </div>

      <div className="measurement-value-container">
        <span className="measurement-value">{measurement.valor}</span>
        <span className="measurement-unidad">{unidadLabel}</span>
      </div>

      <div className="measurement-card-body">
        {measurement.fecha_medicion && (
          <div className="measurement-info-row">
            <span className="measurement-label">Fecha:</span>
            <span className="measurement-info-value">{formatDate(measurement.fecha_medicion)}</span>
          </div>
        )}

        {measurement.observaciones && (
          <div className="measurement-observaciones">
            <span className="measurement-label">Observaciones:</span>
            <p className="measurement-observaciones-text">{measurement.observaciones}</p>
          </div>
        )}
      </div>

      <div className="measurement-card-actions">
        <button
          className="btn-measurement btn-edit"
          onClick={() => onEdit(measurement)}
        >
          Editar
        </button>
        <button
          className="btn-measurement btn-delete"
          onClick={handleDelete}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default MeasurementCard;
