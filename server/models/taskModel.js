class TaskModel {

  static create(conn, taskData, callback) {
    console.log('🟡 [TASK-MODEL] create - Ejecutando...');
    console.log('📦 [TASK-MODEL] create - Datos:', taskData);

    const query = 'INSERT INTO tasks SET ?';
    console.log('🔍 [TASK-MODEL] create - Query:', query);

    conn.query(query, [taskData], (err, result) => {
      if (err) {
        console.error('❌ [TASK-MODEL] create - Error:', err.code);
        console.error('❌ [TASK-MODEL] create - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [TASK-MODEL] create - Tarea insertada correctamente');
        console.log('✅ [TASK-MODEL] create - Result:', result);
      }
      callback(err, result);
    });
  }

  static findByUser(conn, userId, callback) {
    console.log('🟡 [TASK-MODEL] findByUser - Ejecutando...');
    console.log('👤 [TASK-MODEL] findByUser - userId:', userId);

    const query = `
      SELECT t.*, c.nombre as cultivo_nombre
      FROM tasks t
      LEFT JOIN crops c ON t.cultivo_id = c.id
      WHERE t.creado_por = ?
      ORDER BY t.created_at DESC
    `;
    console.log('🔍 [TASK-MODEL] findByUser - Query:', query.trim());

    conn.query(query, [userId], (err, results) => {
      if (err) {
        console.error('❌ [TASK-MODEL] findByUser - Error:', err.code);
        console.error('❌ [TASK-MODEL] findByUser - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [TASK-MODEL] findByUser - Tareas encontradas:', results.length);
      }
      callback(err, results);
    });
  }

  static findByAssignee(conn, userId, callback) {
    console.log('🟡 [TASK-MODEL] findByAssignee - Ejecutando...');
    console.log('👤 [TASK-MODEL] findByAssignee - userId:', userId);

    const query = `
      SELECT t.*, c.nombre as cultivo_nombre
      FROM tasks t
      LEFT JOIN crops c ON t.cultivo_id = c.id
      WHERE t.asignado_a = ?
      ORDER BY t.fecha_limite ASC, t.prioridad DESC
    `;
    console.log('🔍 [TASK-MODEL] findByAssignee - Query:', query.trim());

    conn.query(query, [userId], (err, results) => {
      if (err) {
        console.error('❌ [TASK-MODEL] findByAssignee - Error:', err.code);
        console.error('❌ [TASK-MODEL] findByAssignee - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [TASK-MODEL] findByAssignee - Tareas asignadas encontradas:', results.length);
      }
      callback(err, results);
    });
  }

  static findByCrop(conn, cropId, callback) {
    console.log('🟡 [TASK-MODEL] findByCrop - Ejecutando...');
    console.log('🌱 [TASK-MODEL] findByCrop - cropId:', cropId);

    const query = `
      SELECT * FROM tasks
      WHERE cultivo_id = ?
      ORDER BY fecha_limite ASC
    `;
    console.log('🔍 [TASK-MODEL] findByCrop - Query:', query.trim());

    conn.query(query, [cropId], (err, results) => {
      if (err) {
        console.error('❌ [TASK-MODEL] findByCrop - Error:', err.code);
        console.error('❌ [TASK-MODEL] findByCrop - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [TASK-MODEL] findByCrop - Tareas encontradas:', results.length);
      }
      callback(err, results);
    });
  }

  static findById(conn, id, callback) {
    console.log('🟡 [TASK-MODEL] findById - Ejecutando...');
    console.log('🆔 [TASK-MODEL] findById - id:', id);

    const query = `
      SELECT t.*, c.nombre as cultivo_nombre
      FROM tasks t
      LEFT JOIN crops c ON t.cultivo_id = c.id
      WHERE t.id = ?
    `;
    console.log('🔍 [TASK-MODEL] findById - Query:', query.trim());

    conn.query(query, [id], (err, results) => {
      if (err) {
        console.error('❌ [TASK-MODEL] findById - Error:', err.code);
        console.error('❌ [TASK-MODEL] findById - SQL Message:', err.sqlMessage);
        return callback(err, null);
      }

      const task = results[0] || null;
      console.log('✅ [TASK-MODEL] findById - Encontrada:', task ? 'Si' : 'No');
      callback(null, task);
    });
  }

  static update(conn, id, updateData, callback) {
    console.log('🟡 [TASK-MODEL] update - Ejecutando...');
    console.log('🆔 [TASK-MODEL] update - id:', id);
    console.log('📦 [TASK-MODEL] update - Datos originales:', updateData);

    // Remover campos que no deben actualizarse
    delete updateData.id;
    delete updateData.creado_por;
    delete updateData.empresa;
    delete updateData.created_at;

    console.log('📦 [TASK-MODEL] update - Datos filtrados:', updateData);

    const query = 'UPDATE tasks SET ? WHERE id = ?';
    console.log('🔍 [TASK-MODEL] update - Query:', query);

    conn.query(query, [updateData, id], (err, result) => {
      if (err) {
        console.error('❌ [TASK-MODEL] update - Error:', err.code);
        console.error('❌ [TASK-MODEL] update - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [TASK-MODEL] update - Filas afectadas:', result.affectedRows);
      }
      callback(err, result);
    });
  }

  static updateImageUrl(conn, id, imagenUrl, callback) {
    console.log('📸 [TASK-MODEL] Actualizando imagen para tarea:', id);
    const query = 'UPDATE tasks SET imagen_url = ? WHERE id = ?';
    conn.query(query, [imagenUrl, id], (err, result) => {
      if (err) {
        console.error('❌ [TASK-MODEL] Error en updateImageUrl:', err);
      } else {
        console.log('✅ [TASK-MODEL] Imagen actualizada. Filas afectadas:', result.affectedRows);
      }
      callback(err, result);
    });
  }

  static getImageUrl(conn, id, callback) {
    console.log('🔍 [TASK-MODEL] Obteniendo imagen URL para tarea:', id);
    conn.query('SELECT imagen_url FROM tasks WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('❌ [TASK-MODEL] Error en getImageUrl:', err);
        return callback(err, null);
      }
      const url = results[0]?.imagen_url || null;
      callback(null, url);
    });
  }

  static delete(conn, id, callback) {
    console.log('🟡 [TASK-MODEL] delete - Ejecutando...');
    console.log('🆔 [TASK-MODEL] delete - id:', id);

    const query = 'DELETE FROM tasks WHERE id = ?';
    console.log('🔍 [TASK-MODEL] delete - Query:', query);

    conn.query(query, [id], (err, result) => {
      if (err) {
        console.error('❌ [TASK-MODEL] delete - Error:', err.code);
        console.error('❌ [TASK-MODEL] delete - SQL Message:', err.sqlMessage);
      } else {
        console.log('✅ [TASK-MODEL] delete - Filas eliminadas:', result.affectedRows);
      }
      callback(err, result);
    });
  }
}

export default TaskModel;
