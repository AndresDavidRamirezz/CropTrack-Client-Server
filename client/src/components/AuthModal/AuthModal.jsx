import React from 'react';
import './AuthModal.css';

const AuthModal = ({ role, setRole }) => (
  <nav className="auth-modal-nav">
    <button
      className={`role-button ${role === 'administrador' ? 'active' : ''}`}
      onClick={() => setRole('administrador')}
    >
      Administrador
    </button>
    <button
      className={`role-button ${role === 'trabajador' ? 'active' : ''}`}
      onClick={() => setRole('trabajador')}
    >
      Trabajador
    </button>
    <button
      className={`role-button ${role === 'supervisor' ? 'active' : ''}`}
      onClick={() => setRole('supervisor')}
    >
      Supervisor
    </button>
  </nav>
);

export default AuthModal;