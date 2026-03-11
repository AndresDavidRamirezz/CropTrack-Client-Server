import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

import reactLogo    from '../../assets/tecnologias/react.svg';
import nodeLogo     from '../../assets/tecnologias/node-js.svg';
import expressLogo  from '../../assets/tecnologias/express.svg';
import mysqlLogo    from '../../assets/tecnologias/mysql.svg';
import jestLogo     from '../../assets/tecnologias/jest.svg';
import cypressLogo  from '../../assets/tecnologias/cypress.svg';

import vercelLogo     from '../../assets/deploy/vercel.svg';
import renderLogo     from '../../assets/deploy/render.png';
import railwayLogo    from '../../assets/deploy/railway.svg';
import cloudinaryLogo from '../../assets/deploy/cloudinary.svg';

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

  const testimonials = [
    {
      name: 'Carlos Mendoza',
      role: 'Productor agropecuario',
      company: 'Estancia El Progreso, Córdoba',
      initials: 'CM',
      avatarColor: '#4CAF50',
      rating: 5,
      text: 'CropTrack transformó completamente la forma en que gestionamos nuestras cosechas. Antes todo era en papel y se perdía información. Ahora tengo todo centralizado y puedo ver el estado de cada cultivo en segundos. Les recomiendo esta herramienta a todos.'
    },
    {
      name: 'Ana Gómez',
      role: 'Supervisora de campo',
      company: 'AgroSur S.A., Buenos Aires',
      initials: 'AG',
      avatarColor: '#2196F3',
      rating: 5,
      text: 'La asignación de tareas y el seguimiento del equipo nunca fue tan fácil. Mis supervisores y trabajadores saben exactamente qué hacer cada día. Los reportes PDF son muy profesionales y nos ahorran horas de trabajo administrativo.'
    },
    {
      name: 'Roberto Fierro',
      role: 'Administrador',
      company: 'Cooperativa Agrícola del Norte',
      initials: 'RF',
      avatarColor: '#FF9800',
      rating: 5,
      text: 'Excelente herramienta para administrar múltiples parcelas. Las mediciones de temperatura, humedad y pH bien organizadas nos ayudaron a mejorar el rendimiento notablemente. El módulo de reportes es el que más usamos día a día.'
    }
  ];

  const techStack = [
    { name: 'React',   desc: 'Interfaz de usuario',    color: '#61DAFB', logo: reactLogo   },
    { name: 'Node.js', desc: 'Entorno de ejecución',   color: '#539E43', logo: nodeLogo    },
    { name: 'Express', desc: 'Framework API REST',     color: '#888888', logo: expressLogo },
    { name: 'MySQL',   desc: 'Base de datos',          color: '#00758F', logo: mysqlLogo   },
    { name: 'Jest',    desc: 'Tests unitarios',        color: '#C21325', logo: jestLogo    },
    { name: 'Cypress', desc: 'Tests end-to-end',       color: '#04C38E', logo: cypressLogo },
  ];

  const deployStack = [
    {
      name: 'Vercel',
      layer: 'Frontend',
      detail: 'Deploy automático en cada merge a main',
      gradient: '#ffffff',
      logo: vercelLogo,
    },
    {
      name: 'Render',
      layer: 'Backend / API',
      detail: 'Servidor Node.js + Express en producción',
      gradient: '#ffffff',
      logo: renderLogo,
    },
    {
      name: 'Railway',
      layer: 'Base de datos',
      detail: 'MySQL gestionado en la nube',
      gradient: '#ffffff',
      logo: railwayLogo,
    },
    {
      name: 'Cloudinary',
      layer: 'Imágenes',
      detail: 'Almacenamiento y optimización de imágenes',
      gradient: '#ffffff',
      logo: cloudinaryLogo,
    },
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

      {/* TESTIMONIALS */}
      <section className="landing-testimonials">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Lo que dicen nuestros usuarios</h2>
          <p className="landing-section-subtitle">
            Productores y equipos de todo el país ya digitalizaron su gestión agrícola con CropTrack.
          </p>
        </div>
        <div className="landing-testimonials-grid">
          {testimonials.map((t, index) => (
            <div key={index} className="landing-testimonial-card">
              <div className="landing-testimonial-stars">
                {'★'.repeat(t.rating)}
              </div>
              <p className="landing-testimonial-text">"{t.text}"</p>
              <div className="landing-testimonial-author">
                <div
                  className="landing-testimonial-avatar"
                  style={{ backgroundColor: t.avatarColor }}
                >
                  {t.initials}
                </div>
                <div className="landing-testimonial-info">
                  <span className="landing-testimonial-name">{t.name}</span>
                  <span className="landing-testimonial-role">{t.role}</span>
                  <span className="landing-testimonial-company">{t.company}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className="landing-tech">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Construido con tecnología moderna</h2>
          <p className="landing-section-subtitle">
            Un stack robusto, probado y escalable, con cobertura de tests en cada capa.
          </p>
        </div>

        <div className="landing-tech-grid">
          {techStack.map((tech, index) => (
            <div key={index} className="landing-tech-item">
              <img src={tech.logo} alt={tech.name} className="landing-tech-logo-img" />
              <span className="landing-tech-name" style={{ color: tech.color }}>{tech.name}</span>
              <span className="landing-tech-desc">{tech.desc}</span>
            </div>
          ))}
        </div>

        <div className="landing-deploy-header">
          <h3 className="landing-deploy-title">Infraestructura de deploy</h3>
        </div>
        <div className="landing-deploy-grid">
          {deployStack.map((service, index) => (
            <div key={index} className="landing-deploy-card" style={{ background: service.gradient }}>
              <img src={service.logo} alt={service.name} className="landing-deploy-logo-img" />
              <div className="landing-deploy-info">
                <span className="landing-deploy-layer">{service.layer}</span>
                <span className="landing-deploy-name">{service.name}</span>
                <span className="landing-deploy-detail">{service.detail}</span>
              </div>
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
