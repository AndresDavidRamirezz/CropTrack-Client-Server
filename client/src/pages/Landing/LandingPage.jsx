import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🌱',
      title: 'Gestión de Cosechas',
      description: 'Registrá y seguí todas tus cosechas en un solo lugar. Controlá el estado, área, variedad y fechas clave de cada cultivo.'
    },
    {
      icon: '📏',
      title: 'Mediciones',
      description: 'Registrá mediciones de temperatura, humedad, pH y más. Llevá un historial completo del estado de tus cultivos.'
    },
    {
      icon: '✅',
      title: 'Tareas',
      description: 'Organizá y asigná tareas a tu equipo. Establecé prioridades, fechas límite y hacé seguimiento del progreso.'
    },
    {
      icon: '👷',
      title: 'Trabajadores',
      description: 'Administrá tu equipo de trabajo. Asigná trabajadores y supervisores a cada cosecha de manera simple.'
    },
    {
      icon: '📄',
      title: 'Reportes PDF',
      description: 'Generá reportes completos en PDF de cada cosecha con todos los datos, tareas, mediciones y trabajadores.'
    },
    {
      icon: '🔐',
      title: 'Control de Acceso',
      description: 'Sistema de roles con administradores, supervisores y trabajadores. Cada uno con sus permisos correspondientes.'
    }
  ];

  const stats = [
    { value: '100%', label: 'Gestión Digital' },
    { value: '3', label: 'Roles de Usuario' },
    { value: '5', label: 'Módulos Integrados' },
    { value: '24/7', label: 'Disponibilidad' }
  ];

  return (
    <div className="landing-page">

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-hero-badge">Sistema de Gestión Agrícola</span>
          <h1 className="landing-hero-title">
            Gestioná tu campo con <span className="landing-hero-highlight">CropTrack</span>
          </h1>
          <p className="landing-hero-subtitle">
            La plataforma todo-en-uno para administrar cosechas, tareas, mediciones y equipos de trabajo.
            Tomá decisiones informadas con datos en tiempo real.
          </p>
          <div className="landing-hero-buttons">
            <button className="landing-btn-primary" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </button>
            <button className="landing-btn-secondary" onClick={() => navigate('/register/register-admin')}>
              Registrarse Gratis
            </button>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="landing-hero-card">
            <div className="landing-hero-card-header">
              <span className="landing-hero-card-dot green"></span>
              <span className="landing-hero-card-dot yellow"></span>
              <span className="landing-hero-card-dot red"></span>
              <span className="landing-hero-card-title">Panel de Cosechas</span>
            </div>
            <div className="landing-hero-card-body">
              <div className="landing-mock-item">
                <span className="landing-mock-icon">🌽</span>
                <div className="landing-mock-info">
                  <span className="landing-mock-name">Maíz Parcela Norte</span>
                  <span className="landing-mock-badge en_crecimiento">En crecimiento</span>
                </div>
              </div>
              <div className="landing-mock-item">
                <span className="landing-mock-icon">🍅</span>
                <div className="landing-mock-info">
                  <span className="landing-mock-name">Tomate Cherry</span>
                  <span className="landing-mock-badge maduro">Maduro</span>
                </div>
              </div>
              <div className="landing-mock-item">
                <span className="landing-mock-icon">🌿</span>
                <div className="landing-mock-info">
                  <span className="landing-mock-name">Soja Lote Sur</span>
                  <span className="landing-mock-badge sembrado">Sembrado</span>
                </div>
              </div>
              <div className="landing-mock-stats">
                <div className="landing-mock-stat">
                  <span className="landing-mock-stat-value">12</span>
                  <span className="landing-mock-stat-label">Cosechas</span>
                </div>
                <div className="landing-mock-stat">
                  <span className="landing-mock-stat-value">8</span>
                  <span className="landing-mock-stat-label">Tareas</span>
                </div>
                <div className="landing-mock-stat">
                  <span className="landing-mock-stat-value">24</span>
                  <span className="landing-mock-stat-label">Mediciones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="landing-stats">
        {stats.map((stat, index) => (
          <div key={index} className="landing-stat-item">
            <span className="landing-stat-value">{stat.value}</span>
            <span className="landing-stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section className="landing-features">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Todo lo que necesitás en un solo lugar</h2>
          <p className="landing-section-subtitle">
            CropTrack integra todos los módulos necesarios para gestionar tu operación agrícola de forma eficiente.
          </p>
        </div>
        <div className="landing-features-grid">
          {features.map((feature, index) => (
            <div key={index} className="landing-feature-card">
              <span className="landing-feature-icon">{feature.icon}</span>
              <h3 className="landing-feature-title">{feature.title}</h3>
              <p className="landing-feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <h2 className="landing-cta-title">¿Listo para digitalizar tu campo?</h2>
        <p className="landing-cta-subtitle">
          Comenzá hoy mismo a gestionar tus cosechas de forma profesional y eficiente.
        </p>
        <div className="landing-cta-buttons">
          <button className="landing-btn-primary large" onClick={() => navigate('/register/register-admin')}>
            Crear cuenta gratis
          </button>
          <button className="landing-btn-ghost large" onClick={() => navigate('/login')}>
            Ya tengo cuenta
          </button>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
