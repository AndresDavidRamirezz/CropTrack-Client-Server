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

const MeasurementCard = ({ measurement, crops, onSelect }) => {
  const getCropName = () => {
    const crop = crops?.find(c => c.id === measurement.cultivo_id);
    return crop ? crop.nombre : measurement.cultivo_nombre || 'Cultivo no encontrado';
  };

  const tipoColor = TIPO_COLORS[measurement.tipo_medicion] || '#6c757d';
  const tipoLabel = TIPO_LABELS[measurement.tipo_medicion] || measurement.tipo_medicion;
  const unidadLabel = UNIDAD_LABELS[measurement.unidad] || measurement.unidad;
  const asignadoNombre = measurement.asignado_nombre
    ? `${measurement.asignado_nombre} ${measurement.asignado_apellido || ''}`.trim()
    : null;

  return (
    <div className="measurement-card" onClick={() => onSelect(measurement)}>
      <div className="measurement-col measurement-col-valor">
        <span className="measurement-card-number">{measurement.valor}</span>
        <span className="measurement-card-unit">{unidadLabel}</span>
      </div>
      <div className="measurement-col">
        <span className="measurement-col-label">Cosecha</span>
        <span className="measurement-col-value">{getCropName()}</span>
      </div>
      <div className="measurement-col">
        <span className="measurement-col-label">Fecha</span>
        <span className="measurement-col-value">{formatDate(measurement.fecha_medicion) || '—'}</span>
      </div>
      <div className="measurement-col">
        <span className="measurement-col-label">Asignado a</span>
        <span className="measurement-col-value">{asignadoNombre || '—'}</span>
      </div>
      <span className="measurement-card-tipo" style={{ backgroundColor: tipoColor }}>
        {tipoLabel}
      </span>
    </div>
  );
};

export { TIPO_COLORS, TIPO_LABELS, UNIDAD_LABELS, formatDate };
export default MeasurementCard;
