import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css';
import logo from '../../assets/Logo.png';

const NavBar = () => {
  const navigate = useNavigate();

  // ============================================
  // 1. OBTENER DATOS DEL USUARIO
  // ============================================
  const userName = localStorage.getItem('usuario');
  const userRole = localStorage.getItem('role');
  
  // Verificar si el usuario está logueado
  const isLoggedIn = !!userName;

  console.log('🔍 NavBar - Estado de autenticación:', {
    isLoggedIn,
    userName,
    userRole
  });

  // ============================================
  // 2. MANEJO DE ERRORES Y NAVEGACIÓN
  // ============================================
  const handleLogout = () => {
    try {
      console.log('🚪 Iniciando cierre de sesión...');
      
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('role');
      
      console.log('✅ Sesión cerrada exitosamente');
      console.log('🔄 Redirigiendo a landing page...');
      
      navigate('/');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      // Incluso si hay error, intentar navegar al home
      navigate('/');
    }
  };

  const handleLogoClick = () => {
    try {
      if (isLoggedIn) {
        console.log('🏠 Logo click - Usuario logueado, navegando a /main');
        navigate('/main');
      } else {
        console.log('🏠 Logo click - Usuario no logueado, navegando a /');
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Error al navegar desde logo:', error);
    }
  };

  const handleLoginClick = () => {
    try {
      console.log('🔐 Navegando a página de Login...');
      navigate('/login');
    } catch (error) {
      console.error('❌ Error al navegar a login:', error);
    }
  };

  const handleRegisterClick = () => {
    try {
      console.log('📝 Navegando a página de Registro...');
      navigate('/register');
    } catch (error) {
      console.error('❌ Error al navegar a registro:', error);
    }
  };

  // ============================================
  // 3. RENDERIZADO
  // ============================================
  return (
    <nav className="navbar">
      {/* ========================================
          SECCIÓN IZQUIERDA
          Logo + Badge Rol (si está logueado)
          ======================================== */}
      <div className="navbar-left">
        {/* Logo - SIEMPRE VISIBLE */}
        <img 
          src={logo}
          alt="Logo CropTrack" 
          className="navbar-logo"
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
          title={isLoggedIn ? 'Ir al Dashboard' : 'Ir al Inicio'}
          onError={(e) => {
            console.error('❌ Error al cargar el logo');
            e.target.style.display = 'none';
          }}
        />
        
        {/* ROL DEL USUARIO - SOLO SI ESTÁ LOGUEADO */}
        {isLoggedIn && userRole && (
          <div className="role-container">
            <span className="user-role-badge" title={`Rol actual: ${userRole}`}>
              {userRole}
            </span>
          </div>
        )}
      </div>

      {/* ========================================
          TÍTULO EN EL CENTRO - SIEMPRE VISIBLE
          ======================================== */}
      <div className="navbar-center">
        <h1 className="navbar-title">CropTrack</h1>
      </div>

      {/* ========================================
          SECCIÓN DERECHA
          Usuario logueado: Nombre + Logout
          Usuario NO logueado: Botones Login + Registro
          ======================================== */}
      <div className="navbar-right">
        {isLoggedIn ? (
          // ✅ USUARIO LOGUEADO - Mostrar nombre y botón logout
          <div className="user-info">
            <span className="user-name" title={`Usuario: ${userName}`}>
              {userName}
            </span>
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Cerrar sesión y volver al inicio"
              aria-label="Cerrar sesión"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          // ❌ USUARIO NO LOGUEADO - Mostrar botones de Login y Registro
          <div className="auth-buttons-right">
            <button 
              className="nav-login-btn"
              onClick={handleLoginClick}
              title="Iniciar Sesión"
              aria-label="Ir a iniciar sesión"
            >
              Iniciar Sesión
            </button>
            <button 
              className="nav-register-btn"
              onClick={handleRegisterClick}
              title="Registrarse como nuevo usuario"
              aria-label="Ir a registrarse"
            >
              Registrarse
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;