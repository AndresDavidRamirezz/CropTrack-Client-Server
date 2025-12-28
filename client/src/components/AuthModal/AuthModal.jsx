import React from 'react';

const AuthModal = ({ role, setRole }) => (
  <nav style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
    <button
      style={{ 
        marginRight: 8, 
        background: role === 'administrador' ? '#87D000' : 'rgba(255, 255, 255, 0.2)', 
        color: '#fff', 
        border: role === 'administrador' ? 'none' : '1px solid rgba(255, 255, 255, 0.3)', 
        padding: '8px 24px', 
        borderRadius: 6, 
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setRole('administrador')}
    >
      Administrador
    </button>
    <button
      style={{ 
        marginRight: 8, 
        background: role === 'trabajador' ? '#87D000' : 'rgba(255, 255, 255, 0.2)', 
        color: '#fff', 
        border: role === 'trabajador' ? 'none' : '1px solid rgba(255, 255, 255, 0.3)', 
        padding: '8px 24px', 
        borderRadius: 6, 
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setRole('trabajador')}
    >
      Trabajador
    </button>
    <button
      style={{ 
        background: role === 'supervisor' ? '#87D000' : 'rgba(255, 255, 255, 0.2)', 
        color: '#fff', 
        border: role === 'supervisor' ? 'none' : '1px solid rgba(255, 255, 255, 0.3)', 
        padding: '8px 24px', 
        borderRadius: 6, 
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setRole('supervisor')}
    >
      Supervisor
    </button>
  </nav>
);

export default AuthModal;