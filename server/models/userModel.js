class UserModel {

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

}

export default UserModel;