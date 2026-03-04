import { v4 as uuidv4 } from 'uuid';

class CropWorkerModel {

  static findByCrop(conn, cropId, callback, rol = null) {
    console.log('🟡 [CROP-WORKER-MODEL] findByCrop - cropId:', cropId, '- rol:', rol || 'todos');

    const params = [cropId];
    let roleFilter = '';
    if (rol) {
      roleFilter = 'AND u.rol = ?';
      params.push(rol);
    }

    const query = `
      SELECT u.id, u.nombre, u.apellido, u.rol, u.imagen_url
      FROM crop_workers cw
      INNER JOIN users u ON cw.usuario_id = u.id
      WHERE cw.cultivo_id = ? ${roleFilter}
      ORDER BY u.nombre
    `;

    conn.query(query, params, (err, results) => {
      if (err) {
        console.error('❌ [CROP-WORKER-MODEL] findByCrop - Error:', err.code);
        return callback(err, null);
      }
      console.log('✅ [CROP-WORKER-MODEL] findByCrop - Workers encontrados:', results.length);
      callback(null, results);
    });
  }

  static setByCrop(conn, cropId, userIds, callback) {
    console.log('🟡 [CROP-WORKER-MODEL] setByCrop - cropId:', cropId, 'userIds:', userIds);

    // Primero eliminar los existentes
    const deleteQuery = 'DELETE FROM crop_workers WHERE cultivo_id = ?';

    conn.query(deleteQuery, [cropId], (err) => {
      if (err) {
        console.error('❌ [CROP-WORKER-MODEL] setByCrop - Error en DELETE:', err.code);
        return callback(err, null);
      }

      // Si no hay userIds, terminamos
      if (!userIds || userIds.length === 0) {
        console.log('✅ [CROP-WORKER-MODEL] setByCrop - Workers limpiados (array vacio)');
        return callback(null, { message: 'Workers actualizados', count: 0 });
      }

      // Insertar los nuevos
      const values = userIds.map(userId => [uuidv4(), cropId, userId]);
      const insertQuery = 'INSERT INTO crop_workers (id, cultivo_id, usuario_id) VALUES ?';

      conn.query(insertQuery, [values], (err, result) => {
        if (err) {
          console.error('❌ [CROP-WORKER-MODEL] setByCrop - Error en INSERT:', err.code);
          return callback(err, null);
        }
        console.log('✅ [CROP-WORKER-MODEL] setByCrop - Workers insertados:', result.affectedRows);
        callback(null, { message: 'Workers actualizados', count: result.affectedRows });
      });
    });
  }

  static deleteByCrop(conn, cropId, callback) {
    console.log('🟡 [CROP-WORKER-MODEL] deleteByCrop - cropId:', cropId);

    const query = 'DELETE FROM crop_workers WHERE cultivo_id = ?';

    conn.query(query, [cropId], (err, result) => {
      if (err) {
        console.error('❌ [CROP-WORKER-MODEL] deleteByCrop - Error:', err.code);
        return callback(err, null);
      }
      console.log('✅ [CROP-WORKER-MODEL] deleteByCrop - Eliminados:', result.affectedRows);
      callback(null, result);
    });
  }
}

export default CropWorkerModel;
