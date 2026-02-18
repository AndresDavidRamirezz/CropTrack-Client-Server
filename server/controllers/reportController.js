import ReportModel from '../models/reportModel.js';
import reportService from '../services/reportServices.js';

// GENERATE REPORT - Generar reporte PDF de una cosecha
const generateCropReport = (req, res) => {
  const { cropId } = req.params;

  if (!cropId) {
    return res.status(400).json({ error: 'ID de cosecha requerido' });
  }

  console.log('🟡 [REPORT-CONTROLLER] Generando reporte para cosecha:', cropId);

  req.getConnection((err, conn) => {
    if (err) {
      console.error('❌ [REPORT-CONTROLLER] Error de conexion BD:', err);
      return res.status(500).json({ error: 'Error de conexion con la base de datos' });
    }

    // 1. Obtener cosecha con datos del admin
    ReportModel.findCropWithCreator(conn, cropId, (err, cropData) => {
      if (err) {
        console.error('❌ [REPORT-CONTROLLER] Error al obtener cosecha:', err);
        return res.status(500).json({ error: 'Error al obtener datos de la cosecha' });
      }

      if (!cropData) {
        return res.status(404).json({ error: 'Cosecha no encontrada' });
      }

      // 2. Obtener trabajadores asignados a tareas del cultivo
      ReportModel.findWorkersByCrop(conn, cropId, (err, workers) => {
        if (err) {
          console.error('❌ [REPORT-CONTROLLER] Error al obtener trabajadores:', err);
          return res.status(500).json({ error: 'Error al obtener trabajadores' });
        }

        // 3. Obtener tareas del cultivo
        ReportModel.findTasksByCrop(conn, cropId, (err, tasks) => {
          if (err) {
            console.error('❌ [REPORT-CONTROLLER] Error al obtener tareas:', err);
            return res.status(500).json({ error: 'Error al obtener tareas' });
          }

          // 4. Obtener mediciones del cultivo
          ReportModel.findMeasurementsByCrop(conn, cropId, (err, measurements) => {
            if (err) {
              console.error('❌ [REPORT-CONTROLLER] Error al obtener mediciones:', err);
              return res.status(500).json({ error: 'Error al obtener mediciones' });
            }

            // Construir JSON estructurado del reporte
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

            console.log('📋 [REPORT-CONTROLLER] Datos del reporte:', {
              cosecha: reportData.cosecha.nombre,
              trabajadores: reportData.trabajadores.length,
              tareas: reportData.tareas.length,
              mediciones: reportData.mediciones.length
            });

            // Generar PDF
            reportService.generatePDF(reportData, (err, pdfBuffer) => {
              if (err) {
                console.error('❌ [REPORT-CONTROLLER] Error al generar PDF:', err);
                return res.status(500).json({ error: 'Error al generar el reporte PDF' });
              }

              const filename = `reporte-${cropData.nombre.replace(/\s+/g, '_')}-${Date.now()}.pdf`;

              console.log('✅ [REPORT-CONTROLLER] PDF generado:', filename, '- Tamanio:', pdfBuffer.length, 'bytes');

              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
              res.setHeader('Content-Length', pdfBuffer.length);
              res.send(pdfBuffer);
            });
          });
        });
      });
    });
  });
};

export { generateCropReport };
