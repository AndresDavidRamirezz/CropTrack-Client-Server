import React from 'react';

const AuthModal = ({ role, setRole }) => (
  <nav style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
    <button
      style={{ 
        marginRight: 8, 
        background: role === 'Administrador' ? '#87D000' : 'rgba(255, 255, 255, 0.2)', 
        color: '#fff', 
        border: role === 'Administrador' ? 'none' : '1px solid rgba(255, 255, 255, 0.3)', 
        padding: '8px 24px', 
        borderRadius: 6, 
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setRole('Administrador')}
    >
      Administrador
    </button>
    <button
      style={{ 
        marginRight: 8, 
        background: role === 'Trabajador' ? '#87D000' : 'rgba(255, 255, 255, 0.2)', 
        color: '#fff', 
        border: role === 'Trabajador' ? 'none' : '1px solid rgba(255, 255, 255, 0.3)', 
        padding: '8px 24px', 
        borderRadius: 6, 
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setRole('Trabajador')}
    >
      Trabajador
    </button>
    <button
      style={{ 
        background: role === 'Supervisor' ? '#87D000' : 'rgba(255, 255, 255, 0.2)', 
        color: '#fff', 
        border: role === 'Supervisor' ? 'none' : '1px solid rgba(255, 255, 255, 0.3)', 
        padding: '8px 24px', 
        borderRadius: 6, 
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setRole('Supervisor')}
    >
      Supervisor
    </button>
  </nav>
);

export default AuthModal;