// controllers/authController.js
import UserModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
  console.log('🔐 [LOGIN-CONTROLLER] Iniciando proceso de login...');

  const { usuario, contrasena, rol } = req.body;

  console.log('📦 [LOGIN-CONTROLLER] Datos recibidos:', {
    usuario,
    contrasena: '***OCULTA***',
    rol: rol || 'no especificado'
  });

  req.getConnection(async (err, conn) => {
    if (err) {
      console.error('❌ [LOGIN-CONTROLLER] Error de conexión a BD:', err);
      return res.status(500).json({ 
        message: 'Error al conectar con la base de datos',
        error: err.message 
      });
    }

    console.log('✅ [LOGIN-CONTROLLER] Conexión a BD establecida');
    console.log('🔍 [LOGIN-CONTROLLER] Buscando usuario en la base de datos...');
    
    UserModel.findByUsername(conn, usuario, async (err, results) => {
      if (err) {
        console.error('❌ [LOGIN-CONTROLLER] Error al buscar usuario:', err);
        return res.status(500).json({ 
          message: 'Error al verificar credenciales',
          error: err.message 
        });
      }

      if (!results || results.length === 0) {
        console.log('⚠️ [LOGIN-CONTROLLER] Usuario no encontrado:', usuario);
        return res.status(401).json({ 
          message: 'Usuario o contraseña incorrectos' 
        });
      }

      const user = results[0];
      console.log('✅ [LOGIN-CONTROLLER] Usuario encontrado:', {
        id: user.id,
        nombre_usuario: user.nombre_usuario,
        rol: user.rol,
        email: user.email
      });

      // Verificar si el rol coincide
      if (rol && user.rol !== rol) {
        console.log('⚠️ [LOGIN-CONTROLLER] Rol no coincide. Esperado:', rol, 'Actual:', user.rol);
        return res.status(403).json({ 
          message: `Este usuario no tiene permisos de ${rol}` 
        });
      }

      try {
        console.log('🔐 [LOGIN-CONTROLLER] Verificando contraseña...');
        
        const isPasswordValid = await bcrypt.compare(contrasena, user.password_hash);
        
        if (!isPasswordValid) {
          console.log('⚠️ [LOGIN-CONTROLLER] Contraseña incorrecta');
          return res.status(401).json({ 
            message: 'Usuario o contraseña incorrectos' 
          });
        }

        console.log('✅ [LOGIN-CONTROLLER] Contraseña correcta');

        // ✅ Actualizar último acceso
        UserModel.updateLastAccess(conn, user.id, (err) => {
          if (err) {
            console.warn('⚠️ [LOGIN-CONTROLLER] No se pudo actualizar último acceso:', err);
            // No retornar error, continuar con el login
          } else {
            console.log('✅ [LOGIN-CONTROLLER] Último acceso actualizado');
          }
        });

        console.log('🎫 [LOGIN-CONTROLLER] Generando token JWT...');

        const token = jwt.sign(
          { 
            id: user.id,
            usuario: user.nombre_usuario,
            rol: user.rol,
            email: user.email
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        console.log('✅ [LOGIN-CONTROLLER] Token generado exitosamente');

        // ✅ Datos del usuario (usando los campos correctos de la tabla)
        const userData = {
          id: user.id,
          usuario: user.nombre_usuario,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          empresa: user.empresa,
          telefono: user.telefono,
          rol: user.rol,
          imagen_url: user.imagen_url || null,
          ultimo_acceso: user.ultimo_acceso,
          created_at: user.created_at
        };

        console.log('🎉 [LOGIN-CONTROLLER] Login exitoso para:', userData.usuario);

        res.status(200).json({
          message: 'Login exitoso',
          token,
          user: userData
        });

      } catch (error) {
        console.error('❌ [LOGIN-CONTROLLER] Error al verificar contraseña:', error);
        return res.status(500).json({ 
          message: 'Error interno del servidor',
          error: error.message 
        });
      }
    });
  });
};

export { login };