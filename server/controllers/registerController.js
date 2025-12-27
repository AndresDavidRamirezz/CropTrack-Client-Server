// controllers/registerController.js
import UserModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const createAdmin = async (req, res) => {
  console.log('🚀 [REGISTER-CONTROLLER] Iniciando registro de administrador...');

  // ✅ Cambio: Recibir con los nombres de la API
  const { 
    usuario,           // En lugar de nombre_usuario
    contrasena,        // En lugar de password
    nombre, 
    apellido, 
    email, 
    nombre_empresa,    // En lugar de empresa
    telefono,
    rol
  } = req.body;

  console.log('📦 [REGISTER-CONTROLLER] Datos recibidos:', {
    usuario,
    contrasena: '***OCULTA***',
    nombre,
    apellido,
    email,
    nombre_empresa,
    telefono: telefono || 'no proporcionado',
    rol
  });

  // ✅ Validación con los nombres correctos
  if (!nombre || !apellido || !usuario || !email || !contrasena || !rol || !nombre_empresa) {
    console.log('❌ [REGISTER-CONTROLLER] Faltan campos obligatorios');
    return res.status(400).json({ 
      message: 'Todos los campos obligatorios deben estar completos' 
    });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [REGISTER-CONTROLLER] Error de conexión a BD:', err);
      return res.status(500).json({ 
        message: 'Error al conectar con la base de datos',
        error: err.message 
      });
    }

    console.log('✅ [REGISTER-CONTROLLER] Conexión a BD establecida');
    console.log('🔍 [REGISTER-CONTROLLER] Verificando si usuario existe...');
    
    // ✅ Pasar 'usuario' que se convertirá a 'nombre_usuario' en el modelo
    UserModel.findByUsername(conn, usuario, async (err, userResult) => {
      if (err) {
        console.error('❌ [REGISTER-CONTROLLER] Error al verificar usuario:', err);
        return res.status(500).json({ 
          message: 'Error al verificar usuario existente',
          error: err.message 
        });
      }

      if (userResult.length > 0) {
        console.log('⚠️ [REGISTER-CONTROLLER] El usuario ya existe:', usuario);
        return res.status(400).json({ 
          message: 'El nombre de usuario ya está en uso' 
        });
      }

      console.log('✅ [REGISTER-CONTROLLER] Usuario disponible');
      console.log('🔍 [REGISTER-CONTROLLER] Verificando si email existe...');
      
      UserModel.findByEmail(conn, email, async (err, emailResult) => {
        if (err) {
          console.error('❌ [REGISTER-CONTROLLER] Error al verificar email:', err);
          return res.status(500).json({ 
            message: 'Error al verificar email existente',
            error: err.message 
          });
        }

        if (emailResult.length > 0) {
          console.log('⚠️ [REGISTER-CONTROLLER] El email ya existe:', email);
          return res.status(400).json({ 
            message: 'El email ya está registrado' 
          });
        }

        console.log('✅ [REGISTER-CONTROLLER] Email disponible');

        try {
          console.log('🔐 [REGISTER-CONTROLLER] Encriptando contraseña...');
          
          const saltRounds = 10;
          // ✅ Hashear 'contrasena'
          const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
          
          console.log('✅ [REGISTER-CONTROLLER] Contraseña encriptada correctamente');

          // ✅ Mapear nombres de API a nombres de BD
          const adminData = {
            id: req.body.id,
            nombre_usuario: usuario,      // Mapeo: usuario -> nombre_usuario
            password_hash: hashedPassword,
            nombre: nombre,
            apellido: apellido,
            email: email.toLowerCase(),
            empresa: nombre_empresa,       // Mapeo: nombre_empresa -> empresa
            telefono: telefono || null,
            rol: rol || 'administrador'
          };

          console.log('📝 [REGISTER-CONTROLLER] Datos preparados para insertar:', {
            ...adminData,
            password_hash: '***HASH_OCULTO***'
          });

          console.log('💾 [REGISTER-CONTROLLER] Insertando en base de datos...');
          
          UserModel.createAdmin(conn, adminData, (err, result) => {
            if (err) {
              console.error('❌ [REGISTER-CONTROLLER] Error al insertar:', err);
              return res.status(500).json({ 
                message: 'Error al crear el administrador',
                error: err.message 
              });
            }

            console.log('✅ [REGISTER-CONTROLLER] Administrador creado exitosamente');
            console.log('🎉 [REGISTER-CONTROLLER] ID del nuevo usuario:', adminData.id);

            res.status(201).json({ 
              message: 'Administrador registrado correctamente',
              userId: adminData.id,
              usuario: adminData.nombre_usuario  // Devolver como 'usuario'
            });
          });

        } catch (hashError) {
          console.error('❌ [REGISTER-CONTROLLER] Error al encriptar contraseña:', hashError);
          return res.status(500).json({ 
            message: 'Error interno del servidor al procesar la contraseña',
            error: hashError.message 
          });
        }
      });
    });
  });
};

export { createAdmin };