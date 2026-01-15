class CropModel {

  static create(conn, cropData, callback) {
    console.log('🟡 [CROP-MODEL] create - Ejecutando...');
    console.log('📦 [CROP-MODEL] create - Datos:', cropData);

    const query = 'INSERT INTO crops SET ?';
    console.log('🔍 [CROP-MODEL] create - Query:', query);

    conn.query(query, [cropData], (err, result) => {
      if (err) {
        console.error('❌ [CROP-MODEL] create - Error:', err.code);
        console.error('❌ [CROP-MODEL] create - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [CROP-MODEL] create - Cosecha insertada correctamente');
        console.log('✅ [CROP-MODEL] create - Result:', result);
      }
      callback(err, result);
    });
  }

  static findByUser(conn, userId, callback) {
    console.log('🟡 [CROP-MODEL] findByUser - Ejecutando...');
    console.log('👤 [CROP-MODEL] findByUser - userId:', userId);

    const query = `
      SELECT * FROM crops
      WHERE usuario_creador_id = ?
      ORDER BY created_at DESC
    `;
    console.log('🔍 [CROP-MODEL] findByUser - Query:', query.trim());

    conn.query(query, [userId], (err, results) => {
      if (err) {
        console.error('❌ [CROP-MODEL] findByUser - Error:', err.code);
        console.error('❌ [CROP-MODEL] findByUser - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [CROP-MODEL] findByUser - Cosechas encontradas:', results.length);
      }
      callback(err, results);
    });
  }

  static findById(conn, id, callback) {
    console.log('🟡 [CROP-MODEL] findById - Ejecutando...');
    console.log('🆔 [CROP-MODEL] findById - id:', id);

    const query = 'SELECT * FROM crops WHERE id = ?';
    console.log('🔍 [CROP-MODEL] findById - Query:', query);

    conn.query(query, [id], (err, results) => {
      if (err) {
        console.error('❌ [CROP-MODEL] findById - Error:', err.code);
        console.error('❌ [CROP-MODEL] findById - SQL Message:', err.sqlMessage);
        return callback(err, null);
      }

      const crop = results[0] || null;
      console.log('✅ [CROP-MODEL] findById - Encontrada:', crop ? 'Sí' : 'No');
      callback(null, crop);
    });
  }

  static update(conn, id, updateData, callback) {
    console.log('🟡 [CROP-MODEL] update - Ejecutando...');
    console.log('🆔 [CROP-MODEL] update - id:', id);
    console.log('📦 [CROP-MODEL] update - Datos originales:', updateData);

    // Remover campos que no deben actualizarse
    delete updateData.id;
    delete updateData.usuario_creador_id;
    delete updateData.empresa;
    delete updateData.created_at;

    console.log('📦 [CROP-MODEL] update - Datos filtrados:', updateData);

    const query = 'UPDATE crops SET ? WHERE id = ?';
    console.log('🔍 [CROP-MODEL] update - Query:', query);

    conn.query(query, [updateData, id], (err, result) => {
      if (err) {
        console.error('❌ [CROP-MODEL] update - Error:', err.code);
        console.error('❌ [CROP-MODEL] update - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [CROP-MODEL] update - Filas afectadas:', result.affectedRows);
      }
      callback(err, result);
    });
  }

  static delete(conn, id, callback) {
    console.log('🟡 [CROP-MODEL] delete - Ejecutando...');
    console.log('🆔 [CROP-MODEL] delete - id:', id);

    const query = 'DELETE FROM crops WHERE id = ?';
    console.log('🔍 [CROP-MODEL] delete - Query:', query);

    conn.query(query, [id], (err, result) => {
      if (err) {
        console.error('❌ [CROP-MODEL] delete - Error:', err.code);
        console.error('❌ [CROP-MODEL] delete - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [CROP-MODEL] delete - Filas eliminadas:', result.affectedRows);
      }
      callback(err, result);
    });
  }
}

export default CropModel;
