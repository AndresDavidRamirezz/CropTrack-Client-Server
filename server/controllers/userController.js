import UserModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import multerService from '../services/multerService.js';

// CREATE - Crear nuevo trabajador/supervisor
const createUser = async (req, res) => {
  console.log('🚀 [USER-CONTROLLER] Iniciando creacion de usuario...');

  const {
    usuario,
    contrasena,
    nombre,
    apellido,
    email,
    empresa,
    telefono,
    rol
  } = req.body;

  console.log('📦 [USER-CONTROLLER] Datos recibidos:', {
    usuario,
    contrasena: '***OCULTA***',
    nombre,
    apellido,
    email,
    empresa,
    telefono: telefono || 'no proporcionado',
    rol
  });

  // Validar que el rol sea trabajador o supervisor (no admin)
  if (rol === 'administrador') {
    console.log('❌ [USER-CONTROLLER] Intento de crear administrador rechazado');
    return res.status(400).json({
      message: 'No se puede crear un administrador desde este endpoint'
    });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [USER-CONTROLLER] Error de conexion a BD:', err);
      return res.status(500).json({
        message: 'Error al conectar con la base de datos',
        error: err.message
      });
    }

    console.log('✅ [USER-CONTROLLER] Conexion a BD establecida');
    console.log('🔍 [USER-CONTROLLER] Verificando si usuario existe...');

    UserModel.findWorkerByUsername(conn, usuario, async (err, userResult) => {
      if (err) {
        console.error('❌ [USER-CONTROLLER] Error al verificar usuario:', err);
        return res.status(500).json({
          message: 'Error al verificar usuario existente',
          error: err.message
        });
      }

      if (userResult.length > 0) {
        console.log('⚠️ [USER-CONTROLLER] El usuario ya existe:', usuario);
        return res.status(400).json({
          message: 'El nombre de usuario ya esta en uso'
        });
      }

      console.log('✅ [USER-CONTROLLER] Usuario disponible');
      console.log('🔍 [USER-CONTROLLER] Verificando si email existe...');

      UserModel.findWorkerByEmail(conn, email, async (err, emailResult) => {
        if (err) {
          console.error('❌ [USER-CONTROLLER] Error al verificar email:', err);
          return res.status(500).json({
            message: 'Error al verificar email existente',
            error: err.message
          });
        }

        if (emailResult.length > 0) {
          console.log('⚠️ [USER-CONTROLLER] El email ya existe:', email);
          return res.status(400).json({
            message: 'El email ya esta registrado'
          });
        }

        console.log('✅ [USER-CONTROLLER] Email disponible');

        try {
          console.log('🔐 [USER-CONTROLLER] Encriptando contrasena...');

          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

          console.log('✅ [USER-CONTROLLER] Contrasena encriptada correctamente');

          const userData = {
            id: req.body.id,
            nombre_usuario: usuario,
            password_hash: hashedPassword,
            nombre: nombre,
            apellido: apellido,
            email: email.toLowerCase(),
            empresa: empresa,
            telefono: telefono || null,
            rol: rol
          };

          console.log('📝 [USER-CONTROLLER] Datos preparados para insertar:', {
            ...userData,
            password_hash: '***HASH_OCULTO***'
          });

          console.log('💾 [USER-CONTROLLER] Insertando en base de datos...');

          UserModel.createWorker(conn, userData, (err, result) => {
            if (err) {
              console.error('❌ [USER-CONTROLLER] Error al insertar:', err);
              return res.status(500).json({
                message: 'Error al crear el usuario',
                error: err.message
              });
            }

            console.log('✅ [USER-CONTROLLER] Usuario creado exitosamente');
            console.log('🎉 [USER-CONTROLLER] ID del nuevo usuario:', userData.id);

            res.status(201).json({
              message: 'Usuario creado correctamente',
              userId: userData.id,
              usuario: userData.nombre_usuario
            });
          });

        } catch (hashError) {
          console.error('❌ [USER-CONTROLLER] Error al encriptar contrasena:', hashError);
          return res.status(500).json({
            message: 'Error interno del servidor al procesar la contrasena',
            error: hashError.message
          });
        }
      });
    });
  });
};

// GET BY EMPRESA - Obtener usuarios (workers) de una empresa
const getUsersByEmpresa = (req, res) => {
  const { empresa } = req.params;

  if (!empresa) {
    return res.status(400).json({ error: 'Nombre de empresa requerido' });
  }

  console.log('🔍 [USER-CONTROLLER] Buscando usuarios de empresa:', empresa);

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [USER-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    UserModel.findWorkerByEmpresa(conn, empresa, (err, users) => {
      if (err) {
        console.error('❌ [USER-CONTROLLER] Error al obtener usuarios:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al obtener los usuarios' });
      }

      console.log(`✅ [USER-CONTROLLER] ${users.length} usuarios encontrados para empresa ${empresa}`);
      res.status(200).json(users);
    });
  });
};

// GET BY ID - Obtener un usuario por ID
const getUserById = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  console.log('🔍 [USER-CONTROLLER] Buscando usuario por ID:', id);

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [USER-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    UserModel.findWorkerByIdSafe(conn, id, (err, user) => {
      if (err) {
        console.error('❌ [USER-CONTROLLER] Error al obtener usuario:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al obtener el usuario' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      console.log('✅ [USER-CONTROLLER] Usuario encontrado:', id);
      res.status(200).json(user);
    });
  });
};

// UPDATE - Actualizar un usuario
const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (!id) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  console.log('📝 [USER-CONTROLLER] Actualizando usuario:', id);
  console.log('📦 [USER-CONTROLLER] Datos recibidos:', {
    ...updateData,
    contrasena: updateData.contrasena ? '***OCULTA***' : undefined
  });

  req.getConnection(async (err, conn) => {
    if (err) {
      console.error('❌ [USER-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    // Si se cambia el email, verificar que no exista en otro usuario
    if (updateData.email) {
      UserModel.findWorkerByEmailExcludingId(conn, updateData.email, id, async (err, emailResult) => {
        if (err) {
          console.error('❌ [USER-CONTROLLER] Error al verificar email:', err);
          return res.status(500).json({ error: 'Error al verificar email' });
        }

        if (emailResult.length > 0) {
          console.log('⚠️ [USER-CONTROLLER] El email ya esta en uso por otro usuario');
          return res.status(400).json({ message: 'El email ya esta registrado por otro usuario' });
        }

        await processUpdate(conn, id, updateData, res);
      });
    } else {
      await processUpdate(conn, id, updateData, res);
    }
  });
};

// Funcion auxiliar para procesar la actualizacion
const processUpdate = async (conn, id, updateData, res) => {
  try {
    // Si se envia contrasena, hashearla
    if (updateData.contrasena) {
      console.log('🔐 [USER-CONTROLLER] Hasheando nueva contrasena...');
      const saltRounds = 10;
      updateData.password_hash = await bcrypt.hash(updateData.contrasena, saltRounds);
      delete updateData.contrasena;
      console.log('✅ [USER-CONTROLLER] Contrasena hasheada');
    }

    UserModel.updateWorker(conn, id, updateData, (err, result) => {
      if (err) {
        console.error('❌ [USER-CONTROLLER] Error al actualizar usuario:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al actualizar el usuario' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      console.log('✅ [USER-CONTROLLER] Usuario actualizado:', id);

      // Obtener el usuario actualizado para devolverlo
      UserModel.findWorkerByIdSafe(conn, id, (err, user) => {
        if (err) {
          console.error('❌ [USER-CONTROLLER] Error al obtener usuario actualizado:', err);
          return res.status(200).json({ message: 'Usuario actualizado correctamente' });
        }

        res.status(200).json({
          message: 'Usuario actualizado correctamente',
          user: user
        });
      });
    });
  } catch (error) {
    console.error('❌ [USER-CONTROLLER] Error en processUpdate:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// DELETE - Eliminar un usuario
const deleteUser = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  console.log('🗑️ [USER-CONTROLLER] Eliminando usuario:', id);

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [USER-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    UserModel.deleteWorker(conn, id, (err, result) => {
      if (err) {
        console.error('❌ [USER-CONTROLLER] Error al eliminar usuario:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al eliminar el usuario' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      console.log('✅ [USER-CONTROLLER] Usuario eliminado:', id);
      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    });
  });
};

// UPLOAD IMAGE - Subir/actualizar imagen de usuario
// Cloudinary usa public_id fijo = id del usuario con overwrite:true,
// por lo que sobreescribe automáticamente sin necesidad de borrar la anterior.
const uploadImage = (req, res) => {
  const { id } = req.params;

  console.log('📸 [USER-CONTROLLER] Subiendo imagen para usuario:', id);

  if (!req.file) {
    return res.status(400).json({ error: 'No se proporciono ninguna imagen' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [USER-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    const newImageUrl = req.file.path;

    UserModel.updateImageUrl(conn, id, newImageUrl, (err, result) => {
      if (err) {
        console.error('❌ [USER-CONTROLLER] Error al actualizar imagen en BD:', err);
        return res.status(500).json({ error: 'Error al actualizar la imagen' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      console.log('✅ [USER-CONTROLLER] Imagen actualizada:', newImageUrl);
      res.status(200).json({
        message: 'Imagen actualizada correctamente',
        imagen_url: newImageUrl
      });
    });
  });
};

// DELETE IMAGE - Eliminar imagen de usuario
const deleteImage = (req, res) => {
  const { id } = req.params;

  console.log('🗑️ [USER-CONTROLLER] Eliminando imagen para usuario:', id);

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [USER-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    UserModel.getImageUrl(conn, id, (err, imageUrl) => {
      if (err) {
        console.error('❌ [USER-CONTROLLER] Error al obtener imagen actual:', err);
        return res.status(500).json({ error: 'Error al obtener imagen actual' });
      }

      if (!imageUrl) {
        return res.status(404).json({ error: 'El usuario no tiene imagen' });
      }

      UserModel.updateImageUrl(conn, id, null, (err, result) => {
        if (err) {
          console.error('❌ [USER-CONTROLLER] Error al eliminar imagen en BD:', err);
          return res.status(500).json({ error: 'Error al eliminar la imagen' });
        }

        multerService.deleteFile(imageUrl).catch(deleteErr => {
          console.warn('⚠️ [USER-CONTROLLER] No se pudo eliminar archivo:', deleteErr);
        });

        console.log('✅ [USER-CONTROLLER] Imagen eliminada para usuario:', id);
        res.status(200).json({ message: 'Imagen eliminada correctamente' });
      });
    });
  });
};

export {
  createUser,
  getUsersByEmpresa,
  getUserById,
  updateUser,
  deleteUser,
  uploadImage,
  deleteImage
};
