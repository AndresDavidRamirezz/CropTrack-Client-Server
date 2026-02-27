import ReportModel from '../models/reportModel.js';
import reportService from '../services/reportServices.js';

// GENERATE REPORT - Generar reporte PDF de una cosecha
const generateCropReport = (req, res) => {
  const { cropId } = req.params;
  console.log('🟡 [REPORT-CONTROLLER] generateCropReport - Inicio');
  console.log('🆔 [REPORT-CONTROLLER] cropId recibido:', cropId, '- tipo:', typeof cropId);

  if (!cropId) {
    console.warn('⚠️ [REPORT-CONTROLLER] cropId vacio o undefined');
    return res.status(400).json({ error: 'ID de cosecha requerido' });
  }

  console.log('🔗 [REPORT-CONTROLLER] Solicitando conexion a BD...');

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [REPORT-CONTROLLER] Error de conexion BD:', err.code, err.message);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }
    console.log('✅ [REPORT-CONTROLLER] Conexion BD obtenida');

    // 1. Obtener cosecha con datos del admin
    console.log('📌 [REPORT-CONTROLLER] Paso 1/4 - Obteniendo cosecha con admin...');
    ReportModel.findCropWithCreator(conn, cropId, (err, cropData) => {
      if (err) {
        console.error('❌ [REPORT-CONTROLLER] Error al obtener cosecha:', err.code, err.message);
        return res.status(500).json({ error: 'Error al obtener datos de la cosecha' });
      }

      if (!cropData) {
        console.warn('⚠️ [REPORT-CONTROLLER] Cosecha no encontrada para id:', cropId);
        return res.status(404).json({ error: 'Cosecha no encontrada' });
      }
      console.log('✅ [REPORT-CONTROLLER] Cosecha encontrada:', cropData.nombre, '- Admin:', cropData.admin_nombre, cropData.admin_apellido);

      // 2. Obtener trabajadores asignados
      console.log('📌 [REPORT-CONTROLLER] Paso 2/4 - Obteniendo trabajadores...');
      ReportModel.findWorkersByCrop(conn, cropId, (err, workers) => {
        if (err) {
          console.error('❌ [REPORT-CONTROLLER] Error al obtener trabajadores:', err.code, err.message);
          return res.status(500).json({ error: 'Error al obtener trabajadores' });
        }
        console.log('✅ [REPORT-CONTROLLER] Trabajadores encontrados:', (workers || []).length);

        // 3. Obtener tareas del cultivo
        console.log('📌 [REPORT-CONTROLLER] Paso 3/4 - Obteniendo tareas...');
        ReportModel.findTasksByCrop(conn, cropId, (err, tasks) => {
          if (err) {
            console.error('❌ [REPORT-CONTROLLER] Error al obtener tareas:', err.code, err.message);
            return res.status(500).json({ error: 'Error al obtener tareas' });
          }
          console.log('✅ [REPORT-CONTROLLER] Tareas encontradas:', (tasks || []).length);

          // 4. Obtener mediciones del cultivo
          console.log('📌 [REPORT-CONTROLLER] Paso 4/4 - Obteniendo mediciones...');
          ReportModel.findMeasurementsByCrop(conn, cropId, (err, measurements) => {
            if (err) {
              console.error('❌ [REPORT-CONTROLLER] Error al obtener mediciones:', err.code, err.message);
              return res.status(500).json({ error: 'Error al obtener mediciones' });
            }
            console.log('✅ [REPORT-CONTROLLER] Mediciones encontradas:', (measurements || []).length);

            // Construir JSON estructurado del reporte
            console.log('📦 [REPORT-CONTROLLER] Construyendo reportData...');
            const reportData = {
              generado_en: new Date().toISOString(),
              cosecha: {
                id: cropData.id,
                nombre: cropData.nombre,
                tipo: cropData.tipo,
                variedad: cropData.variedad,
                area_hectareas: cropData.area_hectareas,
                ubicacion: cropData.ubicacion,
                fecha_siembra: cropData.fecha_siembra,
                fecha_cosecha_estimada: cropData.fecha_cosecha_estimada,
                fecha_cosecha_real: cropData.fecha_cosecha_real,
                estado: cropData.estado,
                notas: cropData.notas,
                imagen_url: cropData.imagen_url
              },
              administrador: {
                nombre: cropData.admin_nombre,
                apellido: cropData.admin_apellido,
                email: cropData.admin_email,
                empresa: cropData.admin_empresa,
                telefono: cropData.admin_telefono,
                imagen_url: cropData.admin_imagen_url
              },
              trabajadores: workers || [],
              tareas: tasks || [],
              mediciones: measurements || []
            };

            console.log('📋 [REPORT-CONTROLLER] Resumen reportData:', {
              cosecha: reportData.cosecha.nombre,
              estado: reportData.cosecha.estado,
              admin: `${reportData.administrador.nombre} ${reportData.administrador.apellido}`,
              empresa: reportData.administrador.empresa,
              trabajadores: reportData.trabajadores.length,
              tareas: reportData.tareas.length,
              mediciones: reportData.mediciones.length
            });

            // Generar PDF
            console.log('📄 [REPORT-CONTROLLER] Llamando a reportService.generatePDF...');
            const startTime = Date.now();

            reportService.generatePDF(reportData, (err, pdfBuffer) => {
              const elapsed = Date.now() - startTime;

              if (err) {
                console.error('❌ [REPORT-CONTROLLER] Error al generar PDF:', err.message || err);
                console.error('❌ [REPORT-CONTROLLER] Tiempo transcurrido antes del error:', elapsed, 'ms');
                return res.status(500).json({ error: 'Error al generar el reporte PDF' });
              }

              const safeName = cropData.nombre.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
              const filename = `reporte-${safeName}-${cropId}.pdf`;

              console.log('✅ [REPORT-CONTROLLER] PDF generado exitosamente');
              console.log('📊 [REPORT-CONTROLLER] Detalles:', {
                filename,
                tamanio: `${(pdfBuffer.length / 1024).toFixed(2)} KB`,
                tiempoGeneracion: `${elapsed} ms`
              });

              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
              res.setHeader('Content-Length', pdfBuffer.length);
              console.log('📤 [REPORT-CONTROLLER] Enviando respuesta al cliente...');
              res.send(pdfBuffer);
              console.log('✅ [REPORT-CONTROLLER] Respuesta enviada');
            });
          });
        });
      });
    });
  });
};

// GET REPORT DATA - Retorna la estructura de datos del reporte como JSON
const getCropReportData = (req, res) => {
  const { cropId } = req.params;
  console.log('🟡 [REPORT-CONTROLLER] getCropReportData - Inicio');
  console.log('🆔 [REPORT-CONTROLLER] cropId recibido:', cropId);

  if (!cropId) {
    return res.status(400).json({ error: 'ID de cosecha requerido' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [REPORT-CONTROLLER] Error de conexion BD:', err.code, err.message);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    ReportModel.findCropWithCreator(conn, cropId, (err, cropData) => {
      if (err) return res.status(500).json({ error: 'Error al obtener datos de la cosecha' });
      if (!cropData) return res.status(404).json({ error: 'Cosecha no encontrada' });

      ReportModel.findWorkersByCrop(conn, cropId, (err, workers) => {
        if (err) return res.status(500).json({ error: 'Error al obtener trabajadores' });

        ReportModel.findTasksByCrop(conn, cropId, (err, tasks) => {
          if (err) return res.status(500).json({ error: 'Error al obtener tareas' });

          ReportModel.findMeasurementsByCrop(conn, cropId, (err, measurements) => {
            if (err) return res.status(500).json({ error: 'Error al obtener mediciones' });

            const reportData = {
              generado_en: new Date().toISOString(),
              cosecha: {
                id: cropData.id,
                nombre: cropData.nombre,
                tipo: cropData.tipo,
                variedad: cropData.variedad,
                area_hectareas: cropData.area_hectareas,
                ubicacion: cropData.ubicacion,
                fecha_siembra: cropData.fecha_siembra,
                fecha_cosecha_estimada: cropData.fecha_cosecha_estimada,
                fecha_cosecha_real: cropData.fecha_cosecha_real,
                estado: cropData.estado,
                notas: cropData.notas,
                imagen_url: cropData.imagen_url
              },
              administrador: {
                nombre: cropData.admin_nombre,
                apellido: cropData.admin_apellido,
                email: cropData.admin_email,
                empresa: cropData.admin_empresa,
                telefono: cropData.admin_telefono,
                imagen_url: cropData.admin_imagen_url
              },
              trabajadores: workers || [],
              tareas: tasks || [],
              mediciones: measurements || []
            };

            console.log('✅ [REPORT-CONTROLLER] getCropReportData - Enviando JSON');
            res.status(200).json(reportData);
          });
        });
      });
    });
  });
};

export { generateCropReport, getCropReportData };
