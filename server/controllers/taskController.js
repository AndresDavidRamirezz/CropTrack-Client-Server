import TaskModel from '../models/taskModel.js';
import multerService from '../services/multerService.js';

// CREATE - Crear nueva tarea
const createTask = (req, res) => {
  const taskData = {
    id: req.body.id,
    empresa: req.body.empresa,
    cultivo_id: req.body.cultivo_id || null,
    creado_por: req.body.creado_por,
    asignado_a: req.body.asignado_a || null,
    titulo: req.body.titulo,
    descripcion: req.body.descripcion || null,
    prioridad: req.body.prioridad || 'media',
    estado: req.body.estado || 'pendiente',
    fecha_inicio: req.body.fecha_inicio || null,
    fecha_limite: req.body.fecha_limite || null,
    observaciones: req.body.observaciones || null,
    imagen_url: req.body.imagen_url || null
  };

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [TASK-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    TaskModel.create(conn, taskData, (err, result) => {
      if (err) {
        console.error('❌ [TASK-CONTROLLER] Error al crear tarea:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al crear la tarea' });
      }

      console.log('✅ [TASK-CONTROLLER] Tarea creada con ID:', taskData.id);
      res.status(201).json({
        message: 'Tarea creada correctamente',
        id: taskData.id
      });
    });
  });
};

// GET BY USER - Obtener tareas creadas por un usuario
const getTasksByUser = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [TASK-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    TaskModel.findByUser(conn, userId, (err, tasks) => {
      if (err) {
        console.error('❌ [TASK-CONTROLLER] Error al obtener tareas:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al obtener las tareas' });
      }

      console.log(`✅ [TASK-CONTROLLER] ${tasks.length} tareas encontradas para usuario ${userId}`);
      res.status(200).json(tasks);
    });
  });
};

// GET BY ASSIGNEE - Obtener tareas asignadas a un usuario
const getTasksByAssignee = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [TASK-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    TaskModel.findByAssignee(conn, userId, (err, tasks) => {
      if (err) {
        console.error('❌ [TASK-CONTROLLER] Error al obtener tareas asignadas:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al obtener las tareas asignadas' });
      }

      console.log(`✅ [TASK-CONTROLLER] ${tasks.length} tareas asignadas a usuario ${userId}`);
      res.status(200).json(tasks);
    });
  });
};

// GET BY CROP - Obtener tareas de un cultivo
const getTasksByCrop = (req, res) => {
  const { cropId } = req.params;

  if (!cropId) {
    return res.status(400).json({ error: 'ID de cultivo requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [TASK-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    TaskModel.findByCrop(conn, cropId, (err, tasks) => {
      if (err) {
        console.error('❌ [TASK-CONTROLLER] Error al obtener tareas:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al obtener las tareas' });
      }

      console.log(`✅ [TASK-CONTROLLER] ${tasks.length} tareas encontradas para cultivo ${cropId}`);
      res.status(200).json(tasks);
    });
  });
};

// GET BY ID - Obtener una tarea por ID
const getTaskById = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID de tarea requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [TASK-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    TaskModel.findById(conn, id, (err, task) => {
      if (err) {
        console.error('❌ [TASK-CONTROLLER] Error al obtener tarea:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al obtener la tarea' });
      }

      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      console.log('✅ [TASK-CONTROLLER] Tarea encontrada:', id);
      res.status(200).json(task);
    });
  });
};

// UPDATE - Actualizar una tarea
const updateTask = (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (!id) {
    return res.status(400).json({ error: 'ID de tarea requerido' });
  }

  // Si el estado cambia a completada, agregar fecha_completada
  if (updateData.estado === 'completada' && !updateData.fecha_completada) {
    updateData.fecha_completada = new Date();
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [TASK-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    TaskModel.update(conn, id, updateData, (err, result) => {
      if (err) {
        console.error('❌ [TASK-CONTROLLER] Error al actualizar tarea:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al actualizar la tarea' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      console.log('✅ [TASK-CONTROLLER] Tarea actualizada:', id);
      res.status(200).json({ message: 'Tarea actualizada correctamente' });
    });
  });
};

// DELETE - Eliminar una tarea
const deleteTask = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID de tarea requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [TASK-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    TaskModel.delete(conn, id, (err, result) => {
      if (err) {
        console.error('❌ [TASK-CONTROLLER] Error al eliminar tarea:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al eliminar la tarea' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      console.log('✅ [TASK-CONTROLLER] Tarea eliminada:', id);
      res.status(200).json({ message: 'Tarea eliminada correctamente' });
    });
  });
};

// UPLOAD IMAGE - Subir/actualizar imagen de tarea
const uploadImage = (req, res) => {
  const { id } = req.params;

  console.log('📸 [TASK-CONTROLLER] Subiendo imagen para tarea:', id);

  if (!req.file) {
    return res.status(400).json({ error: 'No se proporciono ninguna imagen' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [TASK-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    TaskModel.getImageUrl(conn, id, (err, oldImageUrl) => {
      if (err) {
        console.error('❌ [TASK-CONTROLLER] Error al obtener imagen actual:', err);
      }

      const newImageUrl = req.file.path;

      TaskModel.updateImageUrl(conn, id, newImageUrl, (err, result) => {
        if (err) {
          console.error('❌ [TASK-CONTROLLER] Error al actualizar imagen en BD:', err);
          return res.status(500).json({ error: 'Error al actualizar la imagen' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        if (oldImageUrl) {
          multerService.deleteFile(oldImageUrl).catch(deleteErr => {
            console.warn('⚠️ [TASK-CONTROLLER] No se pudo eliminar imagen anterior:', deleteErr);
          });
        }

        console.log('✅ [TASK-CONTROLLER] Imagen actualizada:', newImageUrl);
        res.status(200).json({
          message: 'Imagen actualizada correctamente',
          imagen_url: newImageUrl
        });
      });
    });
  });
};

// DELETE IMAGE - Eliminar imagen de tarea
const deleteImage = (req, res) => {
  const { id } = req.params;

  console.log('🗑️ [TASK-CONTROLLER] Eliminando imagen para tarea:', id);

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [TASK-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    TaskModel.getImageUrl(conn, id, (err, imageUrl) => {
      if (err) {
        console.error('❌ [TASK-CONTROLLER] Error al obtener imagen actual:', err);
        return res.status(500).json({ error: 'Error al obtener imagen actual' });
      }

      if (!imageUrl) {
        return res.status(404).json({ error: 'La tarea no tiene imagen' });
      }

      TaskModel.updateImageUrl(conn, id, null, (err, result) => {
        if (err) {
          console.error('❌ [TASK-CONTROLLER] Error al eliminar imagen en BD:', err);
          return res.status(500).json({ error: 'Error al eliminar la imagen' });
        }

        multerService.deleteFile(imageUrl).catch(deleteErr => {
          console.warn('⚠️ [TASK-CONTROLLER] No se pudo eliminar archivo:', deleteErr);
        });

        console.log('✅ [TASK-CONTROLLER] Imagen eliminada para tarea:', id);
        res.status(200).json({ message: 'Imagen eliminada correctamente' });
      });
    });
  });
};

export {
  createTask,
  getTasksByUser,
  getTasksByAssignee,
  getTasksByCrop,
  getTaskById,
  updateTask,
  deleteTask,
  uploadImage,
  deleteImage
};
