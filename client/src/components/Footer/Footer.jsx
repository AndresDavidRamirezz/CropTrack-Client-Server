// components/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          Universidad del Norte Santo Tomás de Aquino
        </p>
        <p className="footer-copyright">
          © {currentYear} Andrés David Ramírez - Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
};

export default Footer;