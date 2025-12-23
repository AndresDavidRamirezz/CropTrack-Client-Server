import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../../components/AuthModal/AuthModal';
import './LoginPage.css';

const LoginPage = () => {
  const [role, setRole] = useState('Administrador');
  const [formData, setFormData] = useState({ 
    nombre_usuario: '', 
    contrasena: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error al escribir
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.nombre_usuario.trim() || !formData.contrasena.trim()) {
      setError('Todos los campos son obligatorios');
      return false;
    }
    if (formData.nombre_usuario.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres');
      return false;
    }
    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log('🔐 LOGIN - Enviando credenciales...');
      console.log('📤 Datos enviados:', {
        nombre_usuario: formData.nombre_usuario,
        rol: role.toLowerCase()
      });

      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre_usuario: formData.nombre_usuario, 
          contrasena: formData.contrasena, 
          rol: role.toLowerCase() // 'administrador', 'supervisor', 'trabajador'
        })
      });
      
      const data = await response.json();
      console.log('🔐 LOGIN - Respuesta del servidor:', data);

      if (response.ok && data.token) {
        console.log('✅ LOGIN - Exitoso');

        // Guardar en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('usuario', formData.nombre_usuario);
        
        console.log('💾 LOGIN - Datos guardados en localStorage');
        
        // Navegar a página principal
        navigate('/main');
        
      } else {
        // Errores del servidor
        setError(data.message || 'Credenciales incorrectas');
        console.error('❌ LOGIN - Error:', data.message);
      }
    } catch (err) {
      console.error('❌ LOGIN - Error de conexión:', err);
      setError('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <AuthModal role={role} setRole={setRole} />

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              name="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ingresa tu usuario"
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ingresa tu contraseña"
              disabled={loading}
              required
            />
          </div>
          
          {error && <div className="error-message">⚠️ {error}</div>}
          
          <button 
            type="submit" 
            className="btn btn-login"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <button 
          onClick={handleRegister} 
          className="btn btn-register"
          disabled={loading}
        >
          Registrar Administrador
        </button>
      </div>
    </div>
  );
};

export default LoginPage;