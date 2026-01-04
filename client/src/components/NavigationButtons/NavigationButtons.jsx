import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationButtons.css';

const NavigationButtons = () => {
  const navigate = useNavigate();

  const navigationItems = [
    {
      id: 'cosechas',
      label: 'Cosechas',
      path: '/crop',
      icon: '🌱',
      color: 'green'
    },
    {
      id: 'mediciones',
      label: 'Mediciones',
      path: '/measurement',
      icon: '📊',
      color: 'blue'
    },
    {
      id: 'tareas',
      label: 'Tareas',
      path: '/task',
      icon: '✅',
      color: 'orange'
    },
    {
      id: 'trabajadores',
      label: 'Trabajadores',
      path: '/worker',
      icon: '👥',
      color: 'purple'
    },
    {
      id: 'perfil',
      label: 'Perfil',
      path: '/profile',
      icon: '👤',
      color: 'red'
    },
    {
      id: 'extras',
      label: 'Extras',
      path: '/extras',
      icon: '⚙️',
      color: 'gray'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="navigation-buttons-container">
      <div className="navigation-grid">
        {navigationItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-button ${item.id}-button`}
            onClick={() => handleNavigation(item.path)}
          >
            <div className="button-icon">{item.icon}</div>
            <div className="button-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationButtons;