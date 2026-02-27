import React, { useState, useEffect } from 'react';
import { ESTADO_COLORS, ESTADO_LABELS, formatDate, getFullImageUrl } from '../../components/Crop/Card/CropCard';
import api from '../../api/axiosConfig';
import './ReportPage.css';

const ReportPage = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);
  const [preview, setPreview] = useState(null); // { url, cropName }

  console.log('🔵 [REPORT-PAGE] Render - crops:', crops.length, '- loading:', loading, '- error:', error, '- generatingId:', generatingId, '- preview:', preview ? preview.cropName : null);

  const getUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const result = {
        usuario_creador_id: userData?.id,
        empresa: userData?.empresa
      };
      console.log('🔵 [REPORT-PAGE] getUserData:', result);
      return result;
    } catch (err) {
      console.error('❌ [REPORT-PAGE] getUserData - Error parseando localStorage:', err);
      return { usuario_creador_id: null, empresa: null };
    }
  };

  const fetchCrops = async () => {
    console.log('🔵 [REPORT-PAGE] fetchCrops - Inicio');
    const { usuario_creador_id } = getUserData();

    if (!usuario_creador_id) {
      console.warn('⚠️ [REPORT-PAGE] fetchCrops - usuario_creador_id no encontrado');
      setError('No se pudo identificar al usuario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔵 [REPORT-PAGE] fetchCrops - Fetching para usuario:', usuario_creador_id);
      const { data } = await api.get(`/api/crops/user/${usuario_creador_id}`);
      console.log('✅ [REPORT-PAGE] fetchCrops - Cosechas cargadas:', data.length);
      setCrops(data);
    } catch (err) {
      console.error('❌ [REPORT-PAGE] fetchCrops - Catch error:', err.message);
      setError(err.response?.data?.error || err.message || 'Error al cargar las cosechas');
    } finally {
      setLoading(false);
      console.log('🔵 [REPORT-PAGE] fetchCrops - Fin');
    }
  };

  useEffect(() => {
    console.log('🔵 [REPORT-PAGE] useEffect - Montaje inicial, llamando fetchCrops');
    fetchCrops();
  }, []);

  // Limpiar blob URL al desmontar o cerrar preview
  useEffect(() => {
    return () => {
      if (preview?.url) {
        console.log('🔵 [REPORT-PAGE] useEffect cleanup - Revocando blob URL');
        window.URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const handleGenerateReport = async (cropId, cropName) => {
    console.log('🟡 [REPORT-PAGE] handleGenerateReport - cropId:', cropId, '- cropName:', cropName);
    setGeneratingId(cropId);
    setError(null);

    try {
      console.log('🔵 [REPORT-PAGE] handleGenerateReport - Fetching PDF para cropId:', cropId);
      const startTime = Date.now();
      const response = await api.get(`/api/reports/${cropId}`, { responseType: 'blob' });
      const elapsed = Date.now() - startTime;
      console.log('🔵 [REPORT-PAGE] handleGenerateReport - Tiempo:', elapsed, 'ms');

      const blob = new Blob([response.data], { type: 'application/pdf' });
      console.log('🔵 [REPORT-PAGE] handleGenerateReport - Blob size:', (blob.size / 1024).toFixed(2), 'KB');
      const blobUrl = window.URL.createObjectURL(blob);
      console.log('✅ [REPORT-PAGE] handleGenerateReport - Blob URL creada:', blobUrl);

      // Abrir previsualizacion en vez de descargar directamente
      setPreview({ url: blobUrl, cropName, cropId });
      console.log('✅ [REPORT-PAGE] handleGenerateReport - Preview abierto para:', cropName);
    } catch (err) {
      console.error('❌ [REPORT-PAGE] handleGenerateReport - Catch error:', err.message);
      setError(err.response?.data?.error || err.message || 'Error al generar el reporte');
    } finally {
      setGeneratingId(null);
      console.log('🔵 [REPORT-PAGE] handleGenerateReport - Fin');
    }
  };

  const handleDownload = () => {
    if (!preview) {
      console.warn('⚠️ [REPORT-PAGE] handleDownload - No hay preview activo');
      return;
    }

    const safeName = preview.cropName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `reporte-${safeName}-${preview.cropId}.pdf`;
    console.log('🔵 [REPORT-PAGE] handleDownload - Descargando:', filename);

    const link = document.createElement('a');
    link.href = preview.url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('✅ [REPORT-PAGE] handleDownload - Descarga iniciada');
  };

  const handleClosePreview = () => {
    console.log('🔵 [REPORT-PAGE] handleClosePreview - Cerrando preview');
    if (preview?.url) {
      console.log('🔵 [REPORT-PAGE] handleClosePreview - Revocando blob URL');
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
            <div
              key={crop.id}
              className={`report-crop-card ${generatingId === crop.id ? 'generating' : ''}`}
              onClick={() => !generatingId && handleGenerateReport(crop.id, crop.nombre)}
            >
              {generatingId === crop.id && (
                <div className="report-crop-card-overlay">
                  <div className="report-btn-spinner"></div>
                  <span>Generando reporte...</span>
                </div>
              )}

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

              <div className="report-crop-card-footer">
                📄 Click para generar reporte
              </div>
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
