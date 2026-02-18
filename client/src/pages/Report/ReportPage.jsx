import React, { useState, useEffect } from 'react';
import { ESTADO_COLORS, ESTADO_LABELS, formatDate, getFullImageUrl } from '../../components/Crop/Card/CropCard';
import './ReportPage.css';

const API_URL = 'http://localhost:4000/api';

const ReportPage = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);
  const [preview, setPreview] = useState(null); // { url, cropName }

  const getUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      return {
        usuario_creador_id: userData?.id,
        empresa: userData?.empresa
      };
    } catch (err) {
      return { usuario_creador_id: null, empresa: null };
    }
  };

  const fetchCrops = async () => {
    const { usuario_creador_id } = getUserData();

    if (!usuario_creador_id) {
      setError('No se pudo identificar al usuario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/crops/user/${usuario_creador_id}`);
      const data = await response.json();

      if (response.ok) {
        setCrops(data);
      } else {
        throw new Error(data.error || 'Error al cargar las cosechas');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar las cosechas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  // Limpiar blob URL al desmontar o cerrar preview
  useEffect(() => {
    return () => {
      if (preview?.url) {
        window.URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const handleGenerateReport = async (cropId, cropName) => {
    setGeneratingId(cropId);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/reports/${cropId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Abrir previsualizacion en vez de descargar directamente
      setPreview({ url, cropName });
    } catch (err) {
      setError(err.message || 'Error al generar el reporte');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownload = () => {
    if (!preview) return;

    const link = document.createElement('a');
    link.href = preview.url;
    link.download = `reporte-${preview.cropName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClosePreview = () => {
    if (preview?.url) {
      window.URL.revokeObjectURL(preview.url);
    }
    setPreview(null);
  };

  return (
    <div className="report-page">
      <header className="report-page-header">
        <div className="report-page-header-info">
          <h1>Reportes de Cosechas</h1>
          <p className="report-page-subtitle">
            Selecciona una cosecha para generar su reporte PDF completo
          </p>
        </div>
      </header>

      {error && (
        <div className="report-error-banner">
          <span className="report-error-icon">!</span>
          <span>{error}</span>
          <button className="report-error-close" onClick={() => setError(null)}>x</button>
        </div>
      )}

      {loading ? (
        <div className="report-page-loading">
          <div className="report-spinner"></div>
          <span>Cargando cosechas...</span>
        </div>
      ) : crops.length === 0 ? (
        <div className="report-page-empty">
          <span className="report-empty-icon">📋</span>
          <p>No tienes cosechas registradas</p>
          <span className="report-empty-hint">Crea una cosecha primero para poder generar reportes</span>
        </div>
      ) : (
        <div className="report-page-grid">
          {crops.map((crop) => (
            <div key={crop.id} className="report-crop-card">
              <div className="report-crop-card-thumb">
                {crop.imagen_url ? (
                  <img src={getFullImageUrl(crop.imagen_url)} alt={crop.nombre} />
                ) : (
                  <span className="report-crop-card-icon">🌱</span>
                )}
              </div>

              <div className="report-crop-card-body">
                <h3 className="report-crop-card-name">{crop.nombre}</h3>
                <div className="report-crop-card-meta">
                  <span className="report-crop-card-tipo">{crop.tipo}</span>
                  {crop.variedad && (
                    <span className="report-crop-card-variedad">{crop.variedad}</span>
                  )}
                </div>
                {crop.ubicacion && (
                  <span className="report-crop-card-location">📍 {crop.ubicacion}</span>
                )}
                {crop.fecha_siembra && (
                  <span className="report-crop-card-date">🗓 Siembra: {formatDate(crop.fecha_siembra)}</span>
                )}
                <span
                  className="report-crop-card-estado"
                  style={{ backgroundColor: ESTADO_COLORS[crop.estado] || '#6c757d' }}
                >
                  {ESTADO_LABELS[crop.estado] || crop.estado}
                </span>
              </div>

              <button
                className="report-crop-card-btn"
                onClick={() => handleGenerateReport(crop.id, crop.nombre)}
                disabled={generatingId === crop.id}
              >
                {generatingId === crop.id ? (
                  <>
                    <span className="report-btn-spinner"></span>
                    Generando...
                  </>
                ) : (
                  <>📄 Generar Reporte</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de previsualizacion del PDF */}
      {preview && (
        <div className="report-preview-overlay" onClick={handleClosePreview}>
          <div className="report-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-preview-header">
              <h2>Reporte: {preview.cropName}</h2>
              <button className="report-preview-close" onClick={handleClosePreview}>
                &times;
              </button>
            </div>

            <div className="report-preview-body">
              <iframe
                src={preview.url}
                title={`Reporte de ${preview.cropName}`}
                className="report-preview-iframe"
              />
            </div>

            <div className="report-preview-actions">
              <button className="report-preview-btn-download" onClick={handleDownload}>
                📥 Descargar PDF
              </button>
              <button className="report-preview-btn-close" onClick={handleClosePreview}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
