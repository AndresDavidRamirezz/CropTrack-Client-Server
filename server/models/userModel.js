class UserModel {

  // ==================== METODOS PARA ADMIN ====================

  static findByUsername(conn, nombre_usuario, callback) {
    console.log('🔍 [USER-MODEL] Buscando usuario:', nombre_usuario);
    conn.query(
      'SELECT * FROM users WHERE nombre_usuario = ?', 
      [nombre_usuario], 
      (err, results) => {
        if (err) {
          console.error('❌ [USER-MODEL] Error en findByUsername:', err);
        } else {
          console.log(`✅ [USER-MODEL] Búsqueda completada. Encontrados: ${results.length}`);
        }
        callback(err, results);
      }
    );
  }

  static findByEmail(conn, email, callback) {
    console.log('🔍 [USER-MODEL] Buscando email:', email);
    conn.query(
      'SELECT * FROM users WHERE email = ?', 
      [email], 
      (err, results) => {
        if (err) {
          console.error('❌ [USER-MODEL] Error en findByEmail:', err);
        } else {
          console.log(`✅ [USER-MODEL] Búsqueda completada. Encontrados: ${results.length}`);
        }
        callback(err, results);
      }
    );
  }

  static createAdmin(conn, userData, callback) {
    console.log('💾 [USER-MODEL] Insertando administrador...');
    conn.query(
      'INSERT INTO users SET ?', 
      [userData], 
      (err, results) => {
        if (err) {
          console.error('❌ [USER-MODEL] Error en createAdmin:', err);
        } else {
          console.log('✅ [USER-MODEL] Administrador insertado correctamente');
        }
        callback(err, results);
      }
    );
  }

  static findById(conn, id, callback) {
    console.log('🔍 [USER-MODEL] Buscando usuario por ID:', id);
    
    const query = 'SELECT * FROM users WHERE id = ?';
    
    conn.query(query, [id], (err, results) => {
      if (err) {
        console.error('❌ [USER-MODEL] Error en findById:', err);
        return callback(err, null);
      }
      
      console.log(`✅ [USER-MODEL] Búsqueda completada. Encontrados: ${results.length}`);
      callback(null, results);
    });
  }

  static updateLastAccess(conn, userId, callback) {
    console.log('🕐 [USER-MODEL] Actualizando último acceso para usuario:', userId);

    const query = 'UPDATE users SET ultimo_acceso = NOW() WHERE id = ?';

    conn.query(query, [userId], (err, result) => {
      if (err) {
        console.error('❌ [USER-MODEL] Error al actualizar último acceso:', err);
        return callback(err, null);
      }

      console.log('✅ [USER-MODEL] Último acceso actualizado');
      callback(null, result);
    });
  }

  // ==================== METODOS PARA WORKERS ====================

  static createWorker(conn, userData, callback) {
    console.log('💾 [USER-MODEL] Insertando usuario...');
    conn.query(
      'INSERT INTO users SET ?',
      [userData],
      (err, results) => {
        if (err) {
          console.error('❌ [USER-MODEL] Error en create:', err);
        } else {
          console.log('✅ [USER-MODEL] Usuario insertado correctamente');
        }
        callback(err, results);
      }
    );
  }
  
  static findWorkerByUsername(conn, nombre_usuario, callback) {
    console.log('🔍 [USER-MODEL] Buscando trabajador por username:', nombre_usuario);
    conn.query(
      'SELECT * FROM users WHERE nombre_usuario = ?',
      [nombre_usuario],
      (err, results) => {
        if (err) {
          console.error('❌ [USER-MODEL] Error en findWorkerByUsername:', err);
        } else {
          console.log(`✅ [USER-MODEL] Busqueda completada. Encontrados: ${results.length}`);
        }
        callback(err, results);
      }
    );
  }

  static findWorkerByEmail(conn, email, callback) {
    console.log('🔍 [USER-MODEL] Buscando trabajador por email:', email);
    conn.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (err, results) => {
        if (err) {
          console.error('❌ [USER-MODEL] Error en findWorkerByEmail:', err);
        } else {
          console.log(`✅ [USER-MODEL] Busqueda completada. Encontrados: ${results.length}`);
        }
        callback(err, results);
      }
    );
  }


  static findWorkerByEmpresa(conn, empresa, callback) {
    console.log('🔍 [USER-MODEL] Buscando usuarios de empresa:', empresa);
    const query = `
      SELECT id, nombre_usuario, nombre, apellido, email, empresa,
             telefono, rol, ultimo_acceso, created_at
      FROM users
      WHERE empresa = ? AND rol IN ('trabajador', 'supervisor')
      ORDER BY created_at DESC
    `;
    conn.query(query, [empresa], (err, results) => {
      if (err) {
        console.error('❌ [USER-MODEL] Error en findByEmpresa:', err);
      } else {
        console.log(`✅ [USER-MODEL] Usuarios encontrados: ${results.length}`);
      }
      callback(err, results);
    });
  }

  static findWorkerByIdSafe(conn, id, callback) {
    console.log('🔍 [USER-MODEL] Buscando usuario por ID (sin password):', id);
    const query = `
      SELECT id, nombre_usuario, nombre, apellido, email, empresa,
             telefono, rol, ultimo_acceso, created_at
      FROM users WHERE id = ?
    `;
    conn.query(query, [id], (err, results) => {
      if (err) {
        console.error('❌ [USER-MODEL] Error en findByIdSafe:', err);
        return callback(err, null);
      }
      const user = results[0] || null;
      console.log('✅ [USER-MODEL] Usuario encontrado:', user ? 'Si' : 'No');
      callback(null, user);
    });
  }

  static updateWorker(conn, id, updateData, callback) {
    console.log('📝 [USER-MODEL] Actualizando usuario:', id);
    console.log('📦 [USER-MODEL] Datos a actualizar:', {
      ...updateData,
      password_hash: updateData.password_hash ? '***' : undefined
    });

    // Remover campos que no deben actualizarse
    delete updateData.id;
    delete updateData.nombre_usuario;
    delete updateData.empresa;
    delete updateData.rol;
    delete updateData.created_at;

    const query = 'UPDATE users SET ? WHERE id = ?';
    conn.query(query, [updateData, id], (err, result) => {
      if (err) {
        console.error('❌ [USER-MODEL] Error en update:', err);
      } else {
        console.log('✅ [USER-MODEL] Filas afectadas:', result.affectedRows);
      }
      callback(err, result);
    });
  }

  static deleteWorker(conn, id, callback) {
    console.log('🗑️ [USER-MODEL] Eliminando usuario:', id);
    conn.query(
      'DELETE FROM users WHERE id = ?',
      [id],
      (err, result) => {
        if (err) {
          console.error('❌ [USER-MODEL] Error en delete:', err);
        } else {
          console.log('✅ [USER-MODEL] Filas eliminadas:', result.affectedRows);
        }
        callback(err, result);
      }
    );
  }

  static findWorkerByEmailExcludingId(conn, email, excludeId, callback) {
    console.log('🔍 [USER-MODEL] Buscando email excluyendo ID:', email, excludeId);
    conn.query(
      'SELECT * FROM users WHERE email = ? AND id != ?',
      [email, excludeId],
      (err, results) => {
        if (err) {
          console.error('❌ [USER-MODEL] Error en findByEmailExcludingId:', err);
        } else {
          console.log(`✅ [USER-MODEL] Búsqueda completada. Encontrados: ${results.length}`);
        }
        callback(err, results);
      }
    );
  }

}

export default UserModel;