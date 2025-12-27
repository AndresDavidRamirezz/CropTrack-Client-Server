// pages/Register/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {

  // ============================================
  // 1. ESTADO DEL FORMULARIO
  // ============================================
  const [form, setForm] = useState({
    usuario: '',              // ✅ Cambio: nombre_usuario -> usuario
    contrasena: '',           // ✅ Mantener: contrasena
    confirmar_contrasena: '',
    nombre: '',
    apellido: '',
    email: '',
    nombre_empresa: '',       // ✅ Cambio: empresa -> nombre_empresa
    telefono: ''
  });

  // ============================================
  // 2. ESTADO DE VALIDACIÓN Y MENSAJES
  // ============================================
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();

  // ============================================
  // 3. REGLAS DE VALIDACIÓN
  // ============================================
  const validationRules = {
    usuario: {  // ✅ Cambio
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: 'Usuario debe tener 3-50 caracteres (solo letras, números y guion bajo)'
    },
    contrasena: {
      required: true,
      minLength: 6,
      maxLength: 100,
      message: 'Contraseña debe tener mínimo 6 caracteres'
    },
    confirmar_contrasena: {
      required: true,
      matchField: 'contrasena',
      message: 'Las contraseñas deben coincidir'
    },
    nombre: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      message: 'Nombre debe tener 2-100 caracteres (solo letras y espacios)'
    },
    apellido: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      message: 'Apellido debe tener 2-100 caracteres (solo letras y espacios)'
    },
    email: {
      required: true,
      maxLength: 100,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Debe ser un email válido'
    },
    nombre_empresa: {  // ✅ Cambio
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Empresa debe tener 2-100 caracteres'
    },
    telefono: {
      required: false,
      maxLength: 20,
      pattern: /^[0-9+\-\s()]+$/,
      message: 'Teléfono solo puede contener números, +, -, espacios y paréntesis'
    }
  };

  // ============================================
  // 4. FUNCIÓN DE VALIDACIÓN DE UN CAMPO
  // ============================================
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    if (rules.required && !value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} es requerido`;
    }

    if (!rules.required && !value.trim()) {
      return null;
    }

    if (rules.minLength && value.trim().length < rules.minLength) {
      return rules.message;
    }

    if (rules.maxLength && value.trim().length > rules.maxLength) {
      return rules.message;
    }

    if (rules.pattern && !rules.pattern.test(value.trim())) {
      return rules.message;
    }

    if (rules.matchField && value !== form[rules.matchField]) {
      return rules.message;
    }

    return null;
  };

  // ============================================
  // 5. VALIDAR TODOS LOS CAMPOS
  // ============================================
  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, form[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // 6. MANEJO DE CAMBIOS EN INPUTS
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setForm(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }

    console.log(`📝 Campo actualizado: ${name} = ${value}`);
  };

  // ============================================
  // 7. MARCAR CAMPO COMO TOCADO (onBlur)
  // ============================================
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));

    console.log(`👆 Campo tocado: ${name}`);
  };

  // ============================================
  // 8. ENVÍO DEL FORMULARIO
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('🚀 Iniciando envío del formulario...');

    const allTouched = {};
    Object.keys(form).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      console.log('❌ Validación fallida. Errores:', errors);
      setError('Por favor, corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);

    // ✅ Preparar datos con los nombres correctos de la API
    const jsonData = {
      usuario: form.usuario.trim(),           // ✅ Cambio
      contrasena: form.contrasena,            // ✅ Cambio
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim().toLowerCase(),
      nombre_empresa: form.nombre_empresa.trim(),  // ✅ Cambio
      telefono: form.telefono.trim() || null,
      rol: 'administrador'
    };

    console.log('📤 Enviando datos al servidor:', {
      ...jsonData,
      contrasena: '***OCULTA***'
    });

    try {
      // ✅ Ruta correcta: /api/register/register-admin
      const response = await fetch('http://localhost:4000/api/register/register-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
      });
      
      console.log('📡 Respuesta recibida. Status:', response.status);
      
      const data = await response.json();
      console.log('📦 Datos de respuesta:', data);
      
      if (response.ok) {
        console.log('✅ Registro exitoso');
        setSuccess('Administrador registrado correctamente. Redirigiendo al login...');
        
        // Limpiar el formulario
        setForm({
          usuario: '',
          contrasena: '',
          confirmar_contrasena: '',
          nombre: '',
          apellido: '',
          email: '',
          nombre_empresa: '',
          telefono: ''
        });
        setTouched({});
        setErrors({});
        
        setTimeout(() => {
          console.log('🔄 Redirigiendo a login...');
          navigate('/login');
        }, 2000);
      } else {
        console.log('⚠️ Error del servidor:', data);
        setError(data.message || data.error || 'Error al registrar el administrador');
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
      setError(`Error de conexión con el servidor: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // 9. INDICADOR DE FORTALEZA DE CONTRASEÑA
  // ============================================
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 1, label: 'Muy débil', color: '#ff4444' },
      { strength: 2, label: 'Débil', color: '#ff8800' },
      { strength: 3, label: 'Media', color: '#ffbb33' },
      { strength: 4, label: 'Buena', color: '#87D000' },
      { strength: 5, label: 'Excelente', color: '#00C851' }
    ];

    return levels[strength - 1] || levels[0];
  };

  const passwordStrength = getPasswordStrength(form.contrasena);

  // ============================================
  // 10. RENDERIZADO
  // ============================================
  return (
    <div className="registro-container">
      <div className="registro-form">
        <h2>Registro de Administrador</h2>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-columns">
            {/* ========== COLUMNA 1 ========== */}
            <div className="form-column">
              
              {/* Usuario */}
              <div className="form-group">
                <label htmlFor="usuario">
                  Usuario <span className="required">*</span>
                </label>
                <p className="field-hint">3-50 caracteres. Solo letras, números y guion bajo</p>
                <input 
                  type="text" 
                  id="usuario"
                  name="usuario"  // ✅ Cambio
                  value={form.usuario} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.usuario && touched.usuario ? 'input-error' : ''}
                  disabled={isSubmitting}
                />
                {errors.usuario && touched.usuario && (
                  <span className="error-text">{errors.usuario}</span>
                )}
              </div>
              
              {/* Nombre */}
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre <span className="required">*</span>
                </label>
                <p className="field-hint">2-100 caracteres. Solo letras y espacios</p>
                <input 
                  type="text" 
                  id="nombre"
                  name="nombre" 
                  value={form.nombre} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.nombre && touched.nombre ? 'input-error' : ''}
                  disabled={isSubmitting}
                />
                {errors.nombre && touched.nombre && (
                  <span className="error-text">{errors.nombre}</span>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <p className="field-hint">Debe ser un email válido (máx. 100 caracteres)</p>
                <input 
                  type="email" 
                  id="email"
                  name="email" 
                  value={form.email} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.email && touched.email ? 'input-error' : ''}
                  disabled={isSubmitting}
                />
                {errors.email && touched.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              {/* Empresa */}
              <div className="form-group">
                <label htmlFor="nombre_empresa">
                  Empresa <span className="required">*</span>
                </label>
                <p className="field-hint">2-100 caracteres</p>
                <input 
                  type="text" 
                  id="nombre_empresa"
                  name="nombre_empresa"  // ✅ Cambio
                  value={form.nombre_empresa} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.nombre_empresa && touched.nombre_empresa ? 'input-error' : ''}
                  disabled={isSubmitting}
                />
                {errors.nombre_empresa && touched.nombre_empresa && (
                  <span className="error-text">{errors.nombre_empresa}</span>
                )}
              </div>
            </div>

            {/* ========== COLUMNA 2 ========== */}
            <div className="form-column">
              
              {/* Contraseña */}
              <div className="form-group">
                <label htmlFor="contrasena">
                  Contraseña <span className="required">*</span>
                </label>
                <p className="field-hint">Mínimo 6 caracteres. Usa letras, números y símbolos</p>
                <input 
                  type="password" 
                  id="contrasena"
                  name="contrasena" 
                  value={form.contrasena} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.contrasena && touched.contrasena ? 'input-error' : ''}
                  disabled={isSubmitting}
                />
                {errors.contrasena && touched.contrasena && (
                  <span className="error-text">{errors.contrasena}</span>
                )}
                
                {/* Indicador de fortaleza */}
                {form.contrasena && (
                  <div className="password-strength">
                    <div 
                      className="strength-bar" 
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                    <span style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="form-group">
                <label htmlFor="confirmar_contrasena">
                  Confirmar Contraseña <span className="required">*</span>
                </label>
                <p className="field-hint">Debe coincidir con la contraseña</p>
                <input 
                  type="password" 
                  id="confirmar_contrasena"
                  name="confirmar_contrasena" 
                  value={form.confirmar_contrasena} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.confirmar_contrasena && touched.confirmar_contrasena ? 'input-error' : ''}
                  disabled={isSubmitting}
                />
                {errors.confirmar_contrasena && touched.confirmar_contrasena && (
                  <span className="error-text">{errors.confirmar_contrasena}</span>
                )}
              </div>
              
              {/* Apellido */}
              <div className="form-group">
                <label htmlFor="apellido">
                  Apellido <span className="required">*</span>
                </label>
                <p className="field-hint">2-100 caracteres. Solo letras y espacios</p>
                <input 
                  type="text" 
                  id="apellido"
                  name="apellido" 
                  value={form.apellido} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.apellido && touched.apellido ? 'input-error' : ''}
                  disabled={isSubmitting}
                />
                {errors.apellido && touched.apellido && (
                  <span className="error-text">{errors.apellido}</span>
                )}
              </div>
              
              {/* Teléfono */}
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <p className="field-hint">Opcional. Máximo 20 caracteres</p>
                <input 
                  type="tel" 
                  id="telefono"
                  name="telefono" 
                  value={form.telefono} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+54 381 123-4567"
                  className={errors.telefono && touched.telefono ? 'input-error' : ''}
                  disabled={isSubmitting}
                />
                {errors.telefono && touched.telefono && (
                  <span className="error-text">{errors.telefono}</span>
                )}
              </div>
            </div>
          </div>

          {/* ========== MENSAJES Y BOTONES ========== */}
          <div className="form-footer">
            {error && <div className="error-message">❌ {error}</div>}
            {success && <div className="success-message">✅ {success}</div>}
            
            <div className="buttons-container">
              <button 
                type="submit" 
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Administrador'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/login')} 
                className="btn-back"
                disabled={isSubmitting}
              >
                Volver al Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;