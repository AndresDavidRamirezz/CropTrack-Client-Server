import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../../src/components/Footer/Footer';

describe('Footer - Tests Unitarios', () => {
  // ==================== RENDERIZADO ====================

  describe('Renderizado', () => {
    it('debe renderizar el componente Footer', () => {
      const { container } = render(<Footer />);
      expect(container.querySelector('.footer')).toBeInTheDocument();
    });

    it('debe renderizar el texto de la universidad', () => {
      render(<Footer />);
      expect(screen.getByText('Universidad del Norte Santo Tomás de Aquino')).toBeInTheDocument();
    });

    it('debe renderizar el nombre del autor', () => {
      render(<Footer />);
      expect(screen.getByText(/Andrés David Ramírez/i)).toBeInTheDocument();
    });

    it('debe renderizar el texto de derechos reservados', () => {
      render(<Footer />);
      expect(screen.getByText(/Todos los derechos reservados/i)).toBeInTheDocument();
    });
  });

  // ==================== AÑO DINÁMICO ====================

  describe('Año dinámico', () => {
    it('debe mostrar el año actual', () => {
      const currentYear = new Date().getFullYear();
      render(<Footer />);
      
      expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
    });

    it('debe contener el símbolo de copyright', () => {
      render(<Footer />);
      expect(screen.getByText(/©/)).toBeInTheDocument();
    });

    it('debe actualizar el año correctamente', () => {
      // Guardar Date original
      const RealDate = Date;
      
      // Mock de Date que devuelve 2025
      global.Date = class extends RealDate {
        constructor(...args) {
          if (args.length === 0) {
            super('2025-01-01T00:00:00.000Z');
          } else {
            super(...args);
          }
        }
        
        getFullYear() {
          return 2025;
        }
      };

      render(<Footer />);
      expect(screen.getByText(/© 2025/)).toBeInTheDocument();

      // Restaurar Date original
      global.Date = RealDate;
    });
  });

  // ==================== ESTRUCTURA HTML ====================

  describe('Estructura HTML', () => {
    it('debe tener un elemento footer como contenedor principal', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('footer');
    });

    it('debe tener un div con clase footer-content', () => {
      const { container } = render(<Footer />);
      expect(container.querySelector('.footer-content')).toBeInTheDocument();
    });

    it('debe tener un párrafo con clase footer-text', () => {
      const { container } = render(<Footer />);
      const footerText = container.querySelector('.footer-text');
      
      expect(footerText).toBeInTheDocument();
      expect(footerText.tagName).toBe('P');
    });

    it('debe tener un párrafo con clase footer-copyright', () => {
      const { container } = render(<Footer />);
      const footerCopyright = container.querySelector('.footer-copyright');
      
      expect(footerCopyright).toBeInTheDocument();
      expect(footerCopyright.tagName).toBe('P');
    });
  });

  // ==================== CLASES CSS ====================

  describe('Clases CSS', () => {
    it('debe aplicar la clase footer al contenedor', () => {
      const { container } = render(<Footer />);
      expect(container.querySelector('.footer')).toHaveClass('footer');
    });

    it('debe aplicar la clase footer-content al contenido', () => {
      const { container } = render(<Footer />);
      expect(container.querySelector('.footer-content')).toHaveClass('footer-content');
    });

    it('debe aplicar la clase footer-text al texto de la universidad', () => {
      const { container } = render(<Footer />);
      const universityText = screen.getByText('Universidad del Norte Santo Tomás de Aquino');
      expect(universityText).toHaveClass('footer-text');
    });

    it('debe aplicar la clase footer-copyright al texto de copyright', () => {
      const { container } = render(<Footer />);
      const copyrightText = screen.getByText(/© \d{4} Andrés David Ramírez/);
      expect(copyrightText).toHaveClass('footer-copyright');
    });
  });

  // ==================== CONTENIDO ====================

  describe('Contenido', () => {
    it('debe contener exactamente 2 párrafos', () => {
      const { container } = render(<Footer />);
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(2);
    });

    it('el primer párrafo debe ser el texto de la universidad', () => {
      const { container } = render(<Footer />);
      const firstParagraph = container.querySelector('p.footer-text');
      expect(firstParagraph).toHaveTextContent('Universidad del Norte Santo Tomás de Aquino');
    });

    it('el segundo párrafo debe contener el copyright', () => {
      const { container } = render(<Footer />);
      const secondParagraph = container.querySelector('p.footer-copyright');
      expect(secondParagraph).toHaveTextContent(/©.*Andrés David Ramírez.*Todos los derechos reservados/);
    });
  });

  // ==================== ACCESIBILIDAD ====================

  describe('Accesibilidad', () => {
    it('debe usar la etiqueta semántica <footer>', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('el texto debe ser visible', () => {
      render(<Footer />);
      expect(screen.getByText('Universidad del Norte Santo Tomás de Aquino')).toBeVisible();
      expect(screen.getByText(/Andrés David Ramírez/)).toBeVisible();
    });

    it('debe tener estructura de contenido apropiada', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      const content = footer.querySelector('.footer-content');
      
      expect(content).toBeInTheDocument();
      expect(footer).toContainElement(content);
    });
  });

  // ==================== SNAPSHOT ====================
  // ⭐ AGREGAR ESTA SECCIÓN ⭐
  
  describe('Snapshot', () => {
    it('debe coincidir con el snapshot', () => {
      // Mock del año para que siempre sea 2024 en el snapshot
      const RealDate = Date;
      global.Date = class extends RealDate {
        getFullYear() {
          return 2024;
        }
      };

      const { container } = render(<Footer />);
      expect(container.firstChild).toMatchSnapshot();

      // Restaurar Date original
      global.Date = RealDate;
    });
  });
});