class ReportModel {

  static findCropWithCreator(conn, cropId, callback) {
    console.log('🟡 [REPORT-MODEL] findCropWithCreator - Ejecutando...');
    console.log('🆔 [REPORT-MODEL] findCropWithCreator - cropId:', cropId);

    const query = `
      SELECT
        c.*,
        u.nombre AS admin_nombre,
        u.apellido AS admin_apellido,
        u.email AS admin_email,
        u.empresa AS admin_empresa,
        u.telefono AS admin_telefono,
        u.imagen_url AS admin_imagen_url
      FROM crops c
      INNER JOIN users u ON c.usuario_creador_id = u.id
      WHERE c.id = ?
    `;
    console.log('🔍 [REPORT-MODEL] findCropWithCreator - Query:', query.trim());

    conn.query(query, [cropId], (err, results) => {
      if (err) {
        console.error('❌ [REPORT-MODEL] findCropWithCreator - Error:', err.code);
        console.error('❌ [REPORT-MODEL] findCropWithCreator - SQL Message:', err.sqlMessage);
        return callback(err, null);
      }

      const crop = results[0] || null;
      console.log('✅ [REPORT-MODEL] findCropWithCreator - Encontrada:', crop ? 'Si' : 'No');
      callback(null, crop);
    });
  }

  static findWorkersByCrop(conn, cropId, callback) {
    console.log('🟡 [REPORT-MODEL] findWorkersByCrop - Ejecutando...');
    console.log('🌱 [REPORT-MODEL] findWorkersByCrop - cropId:', cropId);

    const query = `
      SELECT DISTINCT
        u.id,
        u.nombre,
        u.apellido,
        u.rol,
        u.email,
        u.telefono,
        u.imagen_url
      FROM crop_workers cw
      INNER JOIN users u ON cw.usuario_id = u.id
      WHERE cw.cultivo_id = ?
      ORDER BY u.rol, u.apellido, u.nombre
    `;
    console.log('🔍 [REPORT-MODEL] findWorkersByCrop - Query:', query.trim());

    conn.query(query, [cropId], (err, results) => {
      if (err) {
        console.error('❌ [REPORT-MODEL] findWorkersByCrop - Error:', err.code);
        console.error('❌ [REPORT-MODEL] findWorkersByCrop - SQL Message:', err.sqlMessage);
        return callback(err, null);
      }

      console.log('✅ [REPORT-MODEL] findWorkersByCrop - Trabajadores encontrados:', results.length);
      callback(null, results);
    });
  }

  static findTasksByCrop(conn, cropId, callback) {
    console.log('🟡 [REPORT-MODEL] findTasksByCrop - Ejecutando...');
    console.log('🌱 [REPORT-MODEL] findTasksByCrop - cropId:', cropId);

    const query = `
      SELECT
        t.*,
        u.nombre AS asignado_nombre,
        u.apellido AS asignado_apellido
      FROM tasks t
      LEFT JOIN users u ON t.asignado_a = u.id
      WHERE t.cultivo_id = ?
      ORDER BY t.fecha_inicio ASC, t.created_at ASC
    `;
    console.log('🔍 [REPORT-MODEL] findTasksByCrop - Query:', query.trim());

    conn.query(query, [cropId], (err, results) => {
      if (err) {
        console.error('❌ [REPORT-MODEL] findTasksByCrop - Error:', err.code);
        console.error('❌ [REPORT-MODEL] findTasksByCrop - SQL Message:', err.sqlMessage);
        return callback(err, null);
      }

      console.log('✅ [REPORT-MODEL] findTasksByCrop - Tareas encontradas:', results.length);
      callback(null, results);
    });
  }

  static findMeasurementsByCrop(conn, cropId, callback) {
    console.log('🟡 [REPORT-MODEL] findMeasurementsByCrop - Ejecutando...');
    console.log('🌱 [REPORT-MODEL] findMeasurementsByCrop - cropId:', cropId);

    const query = `
      SELECT
        m.*,
        u.nombre AS usuario_nombre,
        u.apellido AS usuario_apellido
      FROM measurements m
      LEFT JOIN users u ON m.usuario_id = u.id
      WHERE m.cultivo_id = ?
      ORDER BY m.fecha_medicion ASC
    `;
    console.log('🔍 [REPORT-MODEL] findMeasurementsByCrop - Query:', query.trim());

    conn.query(query, [cropId], (err, results) => {
      if (err) {
        console.error('❌ [REPORT-MODEL] findMeasurementsByCrop - Error:', err.code);
        console.error('❌ [REPORT-MODEL] findMeasurementsByCrop - SQL Message:', err.sqlMessage);
        return callback(err, null);
      }

      console.log('✅ [REPORT-MODEL] findMeasurementsByCrop - Mediciones encontradas:', results.length);
      callback(null, results);
    });
  }
}

export default ReportModel;
