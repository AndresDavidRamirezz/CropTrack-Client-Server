import React, { useState, useEffect } from 'react';
import NavigationButtons from '../components/NavigationButtons/NavigationButtons';
import api from '../api/axiosConfig';
import './MainPage.css';

const TIPO_LABELS_MAP = {
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
  fertilizacion: 'Fertilización',
  otro: 'Otro'
};

const formatShortDate = (dateString) => {
  if (!dateString) return null;
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MainPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    setUserName(userData.nombre || localStorage.getItem('usuario') || 'Usuario');

    const userId = userData.id;
    const empresa = userData.empresa;

    if (!userId || !empresa) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.get(`/api/crops/user/${userId}`),
      api.get(`/api/tasks/user/${userId}`),
      api.get(`/api/measurements/user/${userId}`),
      api.get(`/api/users/empresa/${empresa}`)
    ])
      .then(([cropsRes, tasksRes, measurementsRes, workersRes]) => {
        const crops = cropsRes.data || [];
        const tasks = tasksRes.data || [];
        const measurements = measurementsRes.data || [];
        const workers = workersRes.data || [];

        const activeStates = ['planificado', 'sembrado', 'en_crecimiento', 'maduro'];

        const upcomingCrop = crops
          .filter(c => c.fecha_cosecha_estimada && activeStates.includes(c.estado))
          .sort((a, b) => new Date(a.fecha_cosecha_estimada) - new Date(b.fecha_cosecha_estimada))[0];

        const tipoCount = {};
        measurements.forEach(m => {
          if (m.tipo_medicion) tipoCount[m.tipo_medicion] = (tipoCount[m.tipo_medicion] || 0) + 1;
        });
        const topTipos = Object.entries(tipoCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        const lastMeasurement = [...measurements]
          .sort((a, b) => new Date(b.fecha_medicion || 0) - new Date(a.fecha_medicion || 0))[0]
          ?.fecha_medicion || null;

        setStats({
          crops: {
            total: crops.length,
            active: crops.filter(c => activeStates.includes(c.estado)).length,
            cosechadas: crops.filter(c => c.estado === 'cosechado').length,
            canceladas: crops.filter(c => c.estado === 'cancelado').length,
            upcomingName: upcomingCrop?.nombre || null,
            upcomingDate: upcomingCrop?.fecha_cosecha_estimada || null,
          },
          tasks: {
            total: tasks.length,
            pendiente: tasks.filter(t => t.estado === 'pendiente').length,
            en_proceso: tasks.filter(t => t.estado === 'en_proceso').length,
            completada: tasks.filter(t => t.estado === 'completada').length,
            cancelada: tasks.filter(t => t.estado === 'cancelada').length,
            urgentes: tasks.filter(t =>
              t.prioridad === 'urgente' &&
              t.estado !== 'completada' &&
              t.estado !== 'cancelada'
            ).length,
          },
          measurements: {
            total: measurements.length,
            topTipos,
            lastDate: lastMeasurement,
          },
          workers: {
            total: workers.length,
            supervisores: workers.filter(w => w.rol === 'supervisor').length,
            trabajadores: workers.filter(w => w.rol === 'trabajador').length,
            administradores: workers.filter(w => w.rol === 'administrador').length,
          }
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pct = (part, total) => total > 0 ? Math.round((part / total) * 100) : 0;

  return (
    <div className="main-page">

      {/* 1. Header */}
      <div className="main-dashboard-header">
        <h2 className="main-dashboard-title">
          Hola, <span className="main-dashboard-name">{userName}</span>
        </h2>
        <p className="main-dashboard-subtitle">Aquí está el resumen de tu actividad</p>
      </div>

      {/* 2. Navegación */}
      <NavigationButtons />

      {/* 3. Resumen por módulo */}
      <div className="main-stats-section">
        <h3 className="main-stats-section-title">Resumen por módulo</h3>
        <div className="main-stats-grid">
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="main-stat-card main-stat-skeleton" />
            ))
          ) : stats ? (
            <>
              {/* ── Cosechas ── */}
              <div className="main-stat-card main-stat-cosechas">
                <div className="main-stat-header">
                  <span className="main-stat-icon">🌱</span>
                  <div className="main-stat-content">
                    <span className="main-stat-label">Cosechas</span>
                    <span className="main-stat-number">{stats.crops.total}</span>
                  </div>
                </div>

                <div className="main-stat-progress">
                  <div
                    className="main-stat-progress-fill main-progress-cosechas"
                    style={{ width: `${pct(stats.crops.active, stats.crops.total)}%` }}
                  />
                </div>
                <span className="main-stat-progress-text">
                  {pct(stats.crops.active, stats.crops.total)}% en curso
                </span>

                <div className="main-stat-divider" />

                <div className="main-stat-details">
                  <div className="main-stat-row">
                    <span className="main-stat-dot main-dot-active" />
                    <span className="main-stat-row-label">{stats.crops.active} activas</span>
                  </div>
                  <div className="main-stat-row">
                    <span className="main-stat-dot main-dot-done" />
                    <span className="main-stat-row-label">{stats.crops.cosechadas} cosechadas</span>
                  </div>
                  {stats.crops.canceladas > 0 && (
                    <div className="main-stat-row">
                      <span className="main-stat-dot main-dot-cancel" />
                      <span className="main-stat-row-label">{stats.crops.canceladas} canceladas</span>
                    </div>
                  )}
                  {stats.crops.upcomingName && (
                    <div className="main-stat-upcoming">
                      <span className="main-stat-upcoming-label">Próxima cosecha</span>
                      <span className="main-stat-upcoming-name">{stats.crops.upcomingName}</span>
                      <span className="main-stat-upcoming-date">
                        {formatShortDate(stats.crops.upcomingDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Mediciones ── */}
              <div className="main-stat-card main-stat-mediciones">
                <div className="main-stat-header">
                  <span className="main-stat-icon">📊</span>
                  <div className="main-stat-content">
                    <span className="main-stat-label">Mediciones</span>
                    <span className="main-stat-number">{stats.measurements.total}</span>
                  </div>
                </div>

                <div className="main-stat-divider" />

                <div className="main-stat-details">
                  {stats.measurements.topTipos.length > 0 ? (
                    <>
                      <span className="main-stat-section-label">Tipos más frecuentes</span>
                      {stats.measurements.topTipos.map(([tipo, count]) => (
                        <div key={tipo} className="main-stat-tipo-row">
                          <span className="main-stat-tipo-name">
                            {TIPO_LABELS_MAP[tipo] || tipo}
                          </span>
                          <span className="main-stat-tipo-count">{count}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <span className="main-stat-empty">Sin mediciones aún</span>
                  )}
                  {stats.measurements.lastDate && (
                    <div className="main-stat-last-date">
                      <span className="main-stat-last-label">Última:</span>
                      <span className="main-stat-last-value">
                        {formatShortDate(stats.measurements.lastDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Tareas ── */}
              <div className="main-stat-card main-stat-tareas">
                <div className="main-stat-header">
                  <span className="main-stat-icon">✅</span>
                  <div className="main-stat-content">
                    <span className="main-stat-label">Tareas</span>
                    <span className="main-stat-number">{stats.tasks.total}</span>
                  </div>
                  {stats.tasks.urgentes > 0 && (
                    <span className="main-stat-alert">
                      ⚡ {stats.tasks.urgentes} urgente{stats.tasks.urgentes > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="main-stat-progress">
                  <div
                    className="main-stat-progress-fill main-progress-tareas"
                    style={{ width: `${pct(stats.tasks.completada, stats.tasks.total)}%` }}
                  />
                </div>
                <span className="main-stat-progress-text">
                  {pct(stats.tasks.completada, stats.tasks.total)}% completadas
                </span>

                <div className="main-stat-divider" />

                <div className="main-stat-details">
                  <div className="main-stat-pills-grid">
                    <span className="main-stat-pill main-pill-pendiente">
                      {stats.tasks.pendiente} pendientes
                    </span>
                    <span className="main-stat-pill main-pill-proceso">
                      {stats.tasks.en_proceso} en proceso
                    </span>
                    <span className="main-stat-pill main-pill-completada">
                      {stats.tasks.completada} completadas
                    </span>
                    {stats.tasks.cancelada > 0 && (
                      <span className="main-stat-pill main-pill-cancelada">
                        {stats.tasks.cancelada} canceladas
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Trabajadores ── */}
              <div className="main-stat-card main-stat-trabajadores">
                <div className="main-stat-header">
                  <span className="main-stat-icon">👥</span>
                  <div className="main-stat-content">
                    <span className="main-stat-label">Trabajadores</span>
                    <span className="main-stat-number">{stats.workers.total}</span>
                  </div>
                </div>

                <div className="main-stat-divider" />

                <div className="main-stat-details">
                  <span className="main-stat-section-label">Distribución por rol</span>
                  {stats.workers.administradores > 0 && (
                    <div className="main-stat-role-row">
                      <span className="main-stat-role-badge main-role-admin">Admin</span>
                      <div className="main-stat-role-bar-wrap">
                        <div
                          className="main-stat-role-bar main-role-bar-admin"
                          style={{ width: `${pct(stats.workers.administradores, stats.workers.total)}%` }}
                        />
                      </div>
                      <span className="main-stat-role-count">{stats.workers.administradores}</span>
                    </div>
                  )}
                  <div className="main-stat-role-row">
                    <span className="main-stat-role-badge main-role-supervisor">Supervisor</span>
                    <div className="main-stat-role-bar-wrap">
                      <div
                        className="main-stat-role-bar main-role-bar-supervisor"
                        style={{ width: `${pct(stats.workers.supervisores, stats.workers.total)}%` }}
                      />
                    </div>
                    <span className="main-stat-role-count">{stats.workers.supervisores}</span>
                  </div>
                  <div className="main-stat-role-row">
                    <span className="main-stat-role-badge main-role-trabajador">Trabajador</span>
                    <div className="main-stat-role-bar-wrap">
                      <div
                        className="main-stat-role-bar main-role-bar-trabajador"
                        style={{ width: `${pct(stats.workers.trabajadores, stats.workers.total)}%` }}
                      />
                    </div>
                    <span className="main-stat-role-count">{stats.workers.trabajadores}</span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

};

export default MainPage;
