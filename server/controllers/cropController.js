import CropModel from '../models/cropModel.js';
import multerService from '../services/multerService.js';

// CREATE - Crear nueva cosecha
const createCrop = (req, res) => {
  const cropData = {
    id: req.body.id,
    empresa: req.body.empresa,
    usuario_creador_id: req.body.usuario_creador_id,
    nombre: req.body.nombre,
    tipo: req.body.tipo,
    variedad: req.body.variedad || null,
    area_hectareas: req.body.area_hectareas || null,
    ubicacion: req.body.ubicacion || null,
    fecha_siembra: req.body.fecha_siembra || null,
    fecha_cosecha_estimada: req.body.fecha_cosecha_estimada || null,
    estado: req.body.estado || 'planificado',
    notas: req.body.notas || null
  };

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [CROP-CONTROLLER] Error de conexión BD:', err);
      return res.status(500).json({ error: 'Error de conexión con la base de datos' });
    }

    CropModel.create(conn, cropData, (err, result) => {
      if (err) {
        console.error('❌ [CROP-CONTROLLER] Error al crear cosecha:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al crear la cosecha' });
      }

      console.log('✅ [CROP-CONTROLLER] Cosecha creada con ID:', cropData.id);
      res.status(201).json({
        message: 'Cosecha creada correctamente',
        id: cropData.id
      });
    });
  });
};

// GET BY USER - Obtener cosechas de un usuario
const getCropsByUser = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [CROP-CONTROLLER] Error de conexión BD:', err);
      return res.status(500).json({ error: 'Error de conexión con la base de datos' });
    }

    CropModel.findByUser(conn, userId, (err, crops) => {
      if (err) {
        console.error('❌ [CROP-CONTROLLER] Error al obtener cosechas:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al obtener las cosechas' });
      }

      console.log(`✅ [CROP-CONTROLLER] ${crops.length} cosechas encontradas para usuario ${userId}`);
      res.status(200).json(crops);
    });
  });
};

// GET BY ID - Obtener una cosecha por ID
const getCropById = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID de cosecha requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [CROP-CONTROLLER] Error de conexión BD:', err);
      return res.status(500).json({ error: 'Error de conexión con la base de datos' });
    }

    CropModel.findById(conn, id, (err, crop) => {
      if (err) {
        console.error('❌ [CROP-CONTROLLER] Error al obtener cosecha:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al obtener la cosecha' });
      }

      if (!crop) {
        return res.status(404).json({ error: 'Cosecha no encontrada' });
      }

      console.log('✅ [CROP-CONTROLLER] Cosecha encontrada:', id);
      res.status(200).json(crop);
    });
  });
};

// UPDATE - Actualizar una cosecha
const updateCrop = (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (!id) {
    return res.status(400).json({ error: 'ID de cosecha requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [CROP-CONTROLLER] Error de conexión BD:', err);
      return res.status(500).json({ error: 'Error de conexión con la base de datos' });
    }

    CropModel.update(conn, id, updateData, (err, result) => {
      if (err) {
        console.error('❌ [CROP-CONTROLLER] Error al actualizar cosecha:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al actualizar la cosecha' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cosecha no encontrada' });
      }

      console.log('✅ [CROP-CONTROLLER] Cosecha actualizada:', id);
      res.status(200).json({ message: 'Cosecha actualizada correctamente' });
    });
  });
};

// DELETE - Eliminar una cosecha
const deleteCrop = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID de cosecha requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [CROP-CONTROLLER] Error de conexión BD:', err);
      return res.status(500).json({ error: 'Error de conexión con la base de datos' });
    }

    CropModel.delete(conn, id, (err, result) => {
      if (err) {
        console.error('❌ [CROP-CONTROLLER] Error al eliminar cosecha:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Error al eliminar la cosecha' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cosecha no encontrada' });
      }

      console.log('✅ [CROP-CONTROLLER] Cosecha eliminada:', id);
      res.status(200).json({ message: 'Cosecha eliminada correctamente' });
    });
  });
};

// UPLOAD IMAGE - Subir/actualizar imagen de cultivo
// Cloudinary usa public_id fijo = id del cultivo con overwrite:true,
// por lo que sobreescribe automáticamente sin necesidad de borrar la anterior.
const uploadImage = (req, res) => {
  const { id } = req.params;

  console.log('📸 [CROP-CONTROLLER] Subiendo imagen para cultivo:', id);

  if (!req.file) {
    return res.status(400).json({ error: 'No se proporciono ninguna imagen' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [CROP-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    const newImageUrl = req.file.path;

    CropModel.updateImageUrl(conn, id, newImageUrl, (err, result) => {
      if (err) {
        console.error('❌ [CROP-CONTROLLER] Error al actualizar imagen en BD:', err);
        return res.status(500).json({ error: 'Error al actualizar la imagen' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cultivo no encontrado' });
      }

      console.log('✅ [CROP-CONTROLLER] Imagen actualizada:', newImageUrl);
      res.status(200).json({
        message: 'Imagen actualizada correctamente',
        imagen_url: newImageUrl
      });
    });
  });
};

// DELETE IMAGE - Eliminar imagen de cultivo
const deleteImage = (req, res) => {
  const { id } = req.params;

  console.log('🗑️ [CROP-CONTROLLER] Eliminando imagen para cultivo:', id);

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [CROP-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    CropModel.getImageUrl(conn, id, (err, imageUrl) => {
      if (err) {
        console.error('❌ [CROP-CONTROLLER] Error al obtener imagen actual:', err);
        return res.status(500).json({ error: 'Error al obtener imagen actual' });
      }

      if (!imageUrl) {
        return res.status(404).json({ error: 'El cultivo no tiene imagen' });
      }

      CropModel.updateImageUrl(conn, id, null, (err, result) => {
        if (err) {
          console.error('❌ [CROP-CONTROLLER] Error al eliminar imagen en BD:', err);
          return res.status(500).json({ error: 'Error al eliminar la imagen' });
        }

        multerService.deleteFile(imageUrl).catch(deleteErr => {
          console.warn('⚠️ [CROP-CONTROLLER] No se pudo eliminar archivo:', deleteErr);
        });

        console.log('✅ [CROP-CONTROLLER] Imagen eliminada para cultivo:', id);
        res.status(200).json({ message: 'Imagen eliminada correctamente' });
      });
    });
  });
};

export {
  createCrop,
  getCropsByUser,
  getCropById,
  updateCrop,
  deleteCrop,
  uploadImage,
  deleteImage
};
