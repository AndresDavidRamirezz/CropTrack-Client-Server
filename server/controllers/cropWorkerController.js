import CropWorkerModel from '../models/cropWorkerModel.js';

export const getCropWorkers = (req, res) => {
  const { cropId } = req.params;

  if (!cropId) {
    return res.status(400).json({ error: 'cropId es requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [CROP-WORKER-CTRL] Error de conexion:', err);
      return res.status(500).json({ error: 'Error de conexion a la base de datos' });
    }

    const rol = req.query.rol || null;

    CropWorkerModel.findByCrop(conn, cropId, (err, workers) => {
      if (err) {
        console.error('❌ [CROP-WORKER-CTRL] Error al obtener workers:', err);
        return res.status(500).json({ error: 'Error al obtener los trabajadores de la cosecha' });
      }

      res.json(workers);
    }, rol);
  });
};

export const setCropWorkers = (req, res) => {
  const { cropId } = req.params;
  const { workerIds } = req.body;

  if (!cropId) {
    return res.status(400).json({ error: 'cropId es requerido' });
  }

  if (!Array.isArray(workerIds)) {
    return res.status(400).json({ error: 'workerIds debe ser un array' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [CROP-WORKER-CTRL] Error de conexion:', err);
      return res.status(500).json({ error: 'Error de conexion a la base de datos' });
    }

    CropWorkerModel.setByCrop(conn, cropId, workerIds, (err, result) => {
      if (err) {
        console.error('❌ [CROP-WORKER-CTRL] Error al setear workers:', err);
        return res.status(500).json({ error: 'Error al asignar los trabajadores a la cosecha' });
      }

      res.json(result);
    });
  });
};
