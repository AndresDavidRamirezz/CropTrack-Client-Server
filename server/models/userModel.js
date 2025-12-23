class UserModel {

	// Buscar usuario para login (incluye contraseña)
  static findForLogin(conn, usuario, callback) {
    conn.query(
      'SELECT id, usuario, contrasena, nombre, apellido, email, nombre_empresa, rol FROM user WHERE usuario = ?', 
      [usuario], 
      callback
    );
  }
  
}

export default UserModel;