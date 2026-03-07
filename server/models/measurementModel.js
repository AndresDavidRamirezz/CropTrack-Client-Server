class MeasurementModel {

  static create(conn, measurementData, callback) {
    console.log('🟡 [MEASUREMENT-MODEL] create - Ejecutando...');
    console.log('📦 [MEASUREMENT-MODEL] create - Datos:', measurementData);

    const query = 'INSERT INTO measurements SET ?';
    console.log('🔍 [MEASUREMENT-MODEL] create - Query:', query);

    conn.query(query, [measurementData], (err, result) => {
      if (err) {
        console.error('❌ [MEASUREMENT-MODEL] create - Error:', err.code);
        console.error('❌ [MEASUREMENT-MODEL] create - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [MEASUREMENT-MODEL] create - Medicion insertada correctamente');
        console.log('✅ [MEASUREMENT-MODEL] create - Result:', result);
      }
      callback(err, result);
    });
  }

  static findByCropAssociation(conn, userId, callback) {
    console.log('🟡 [MEASUREMENT-MODEL] findByCropAssociation - Ejecutando...');
    console.log('👤 [MEASUREMENT-MODEL] findByCropAssociation - userId:', userId);

    const query = `
      SELECT DISTINCT m.*, c.nombre as cultivo_nombre,
             u.nombre as asignado_nombre, u.apellido as asignado_apellido
      FROM measurements m
      LEFT JOIN crops c ON m.cultivo_id = c.id
      LEFT JOIN users u ON m.usuario_id = u.id
      WHERE c.usuario_creador_id = ?
         OR c.id IN (SELECT cultivo_id FROM crop_workers WHERE usuario_id = ?)
      ORDER BY c.nombre ASC, m.fecha_medicion DESC
    `;
    console.log('🔍 [MEASUREMENT-MODEL] findByCropAssociation - Query:', query.trim());

    conn.query(query, [userId, userId], (err, results) => {
      if (err) {
        console.error('❌ [MEASUREMENT-MODEL] findByCropAssociation - Error:', err.code);
        console.error('❌ [MEASUREMENT-MODEL] findByCropAssociation - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [MEASUREMENT-MODEL] findByCropAssociation - Mediciones encontradas:', results.length);
      }
      callback(err, results);
    });
  }

  static findByCrop(conn, cropId, callback) {
    console.log('🟡 [MEASUREMENT-MODEL] findByCrop - Ejecutando...');
    console.log('🌱 [MEASUREMENT-MODEL] findByCrop - cropId:', cropId);

    const query = `
      SELECT * FROM measurements
      WHERE cultivo_id = ?
      ORDER BY fecha_medicion DESC
    `;
    console.log('🔍 [MEASUREMENT-MODEL] findByCrop - Query:', query.trim());

    conn.query(query, [cropId], (err, results) => {
      if (err) {
        console.error('❌ [MEASUREMENT-MODEL] findByCrop - Error:', err.code);
        console.error('❌ [MEASUREMENT-MODEL] findByCrop - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [MEASUREMENT-MODEL] findByCrop - Mediciones encontradas:', results.length);
      }
      callback(err, results);
    });
  }

  static findById(conn, id, callback) {
    console.log('🟡 [MEASUREMENT-MODEL] findById - Ejecutando...');
    console.log('🆔 [MEASUREMENT-MODEL] findById - id:', id);

    const query = `
      SELECT m.*, c.nombre as cultivo_nombre
      FROM measurements m
      LEFT JOIN crops c ON m.cultivo_id = c.id
      WHERE m.id = ?
    `;
    console.log('🔍 [MEASUREMENT-MODEL] findById - Query:', query.trim());

    conn.query(query, [id], (err, results) => {
      if (err) {
        console.error('❌ [MEASUREMENT-MODEL] findById - Error:', err.code);
        console.error('❌ [MEASUREMENT-MODEL] findById - SQL Message:', err.sqlMessage);
        return callback(err, null);
      }

      const measurement = results[0] || null;
      console.log('✅ [MEASUREMENT-MODEL] findById - Encontrada:', measurement ? 'Si' : 'No');
      callback(null, measurement);
    });
  }

  static update(conn, id, updateData, callback) {
    console.log('🟡 [MEASUREMENT-MODEL] update - Ejecutando...');
    console.log('🆔 [MEASUREMENT-MODEL] update - id:', id);
    console.log('📦 [MEASUREMENT-MODEL] update - Datos originales:', updateData);

    // Remover campos que no deben actualizarse
    delete updateData.id;
    delete updateData.created_at;

    console.log('📦 [MEASUREMENT-MODEL] update - Datos filtrados:', updateData);

    const query = 'UPDATE measurements SET ? WHERE id = ?';
    console.log('🔍 [MEASUREMENT-MODEL] update - Query:', query);

    conn.query(query, [updateData, id], (err, result) => {
      if (err) {
        console.error('❌ [MEASUREMENT-MODEL] update - Error:', err.code);
        console.error('❌ [MEASUREMENT-MODEL] update - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [MEASUREMENT-MODEL] update - Filas afectadas:', result.affectedRows);
      }
      callback(err, result);
    });
  }

  static delete(conn, id, callback) {
    console.log('🟡 [MEASUREMENT-MODEL] delete - Ejecutando...');
    console.log('🆔 [MEASUREMENT-MODEL] delete - id:', id);

    const query = 'DELETE FROM measurements WHERE id = ?';
    console.log('🔍 [MEASUREMENT-MODEL] delete - Query:', query);

    conn.query(query, [id], (err, result) => {
      if (err) {
        console.error('❌ [MEASUREMENT-MODEL] delete - Error:', err.code);
        console.error('❌ [MEASUREMENT-MODEL] delete - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [MEASUREMENT-MODEL] delete - Filas eliminadas:', result.affectedRows);
      }
      callback(err, result);
    });
  }
}

export default MeasurementModel;
