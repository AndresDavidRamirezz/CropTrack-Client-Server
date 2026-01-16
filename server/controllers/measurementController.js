import MeasurementModel from '../models/measurementModel.js';

// CREATE - Crear nueva medicion
const createMeasurement = (req, res) => {
  const measurementData = {
    id: req.body.id,
    cultivo_id: req.body.cultivo_id,
    usuario_id: req.body.usuario_id,
    tipo_medicion: req.body.tipo_medicion,
    valor: req.body.valor,
    unidad: req.body.unidad,
    fecha_medicion: req.body.fecha_medicion || new Date(),
    observaciones: req.body.observaciones || null,
    imagen_url: req.body.imagen_url || null
  };

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [MEASUREMENT-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    MeasurementModel.create(conn, measurementData, (err, result) => {
      if (err) {
        console.error('❌ [MEASUREMENT-CONTROLLER] Error al crear medicion:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al crear la medicion' });
      }

      console.log('✅ [MEASUREMENT-CONTROLLER] Medicion creada con ID:', measurementData.id);
      res.status(201).json({
        message: 'Medicion creada correctamente',
        id: measurementData.id
      });
    });
  });
};

// GET BY USER - Obtener mediciones de un usuario
const getMeasurementsByUser = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [MEASUREMENT-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    MeasurementModel.findByUser(conn, userId, (err, measurements) => {
      if (err) {
        console.error('❌ [MEASUREMENT-CONTROLLER] Error al obtener mediciones:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al obtener las mediciones' });
      }

      console.log(`✅ [MEASUREMENT-CONTROLLER] ${measurements.length} mediciones encontradas para usuario ${userId}`);
      res.status(200).json(measurements);
    });
  });
};

// GET BY CROP - Obtener mediciones de un cultivo
const getMeasurementsByCrop = (req, res) => {
  const { cropId } = req.params;

  if (!cropId) {
    return res.status(400).json({ error: 'ID de cultivo requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [MEASUREMENT-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    MeasurementModel.findByCrop(conn, cropId, (err, measurements) => {
      if (err) {
        console.error('❌ [MEASUREMENT-CONTROLLER] Error al obtener mediciones:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al obtener las mediciones' });
      }

      console.log(`✅ [MEASUREMENT-CONTROLLER] ${measurements.length} mediciones encontradas para cultivo ${cropId}`);
      res.status(200).json(measurements);
    });
  });
};

// GET BY ID - Obtener una medicion por ID
const getMeasurementById = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID de medicion requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [MEASUREMENT-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    MeasurementModel.findById(conn, id, (err, measurement) => {
      if (err) {
        console.error('❌ [MEASUREMENT-CONTROLLER] Error al obtener medicion:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al obtener la medicion' });
      }

      if (!measurement) {
        return res.status(404).json({ error: 'Medicion no encontrada' });
      }

      console.log('✅ [MEASUREMENT-CONTROLLER] Medicion encontrada:', id);
      res.status(200).json(measurement);
    });
  });
};

// UPDATE - Actualizar una medicion
const updateMeasurement = (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (!id) {
    return res.status(400).json({ error: 'ID de medicion requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [MEASUREMENT-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    MeasurementModel.update(conn, id, updateData, (err, result) => {
      if (err) {
        console.error('❌ [MEASUREMENT-CONTROLLER] Error al actualizar medicion:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al actualizar la medicion' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Medicion no encontrada' });
      }

      console.log('✅ [MEASUREMENT-CONTROLLER] Medicion actualizada:', id);
      res.status(200).json({ message: 'Medicion actualizada correctamente' });
    });
  });
};

// DELETE - Eliminar una medicion
const deleteMeasurement = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID de medicion requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [MEASUREMENT-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    MeasurementModel.delete(conn, id, (err, result) => {
      if (err) {
        console.error('❌ [MEASUREMENT-CONTROLLER] Error al eliminar medicion:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al eliminar la medicion' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Medicion no encontrada' });
      }

      console.log('✅ [MEASUREMENT-CONTROLLER] Medicion eliminada:', id);
      res.status(200).json({ message: 'Medicion eliminada correctamente' });
    });
  });
};

export {
  createMeasurement,
  getMeasurementsByUser,
  getMeasurementsByCrop,
  getMeasurementById,
  updateMeasurement,
  deleteMeasurement
};
