import PDFDocument from 'pdfkit';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Configuracion del canvas para graficos
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 500,
  height: 250,
  backgroundColour: 'white'
});

// Colores del tema
const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  secondary: '#1565C0',
  accent: '#F57F17',
  dark: '#212121',
  gray: '#616161',
  lightGray: '#E0E0E0',
  white: '#FFFFFF',
  tableHeader: '#2E7D32',
  tableHeaderText: '#FFFFFF',
  tableRowAlt: '#F5F5F5',
  estados: {
    pendiente: '#FFA726',
    en_proceso: '#42A5F5',
    completada: '#66BB6A',
    cancelada: '#EF5350'
  },
  prioridades: {
    baja: '#66BB6A',
    media: '#FFA726',
    alta: '#EF5350',
    urgente: '#D32F2F'
  }
};

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

const reportService = {

  generatePDF(reportData, callback) {
    console.log('🟡 [REPORT-SERVICE] generatePDF - Iniciando generacion...');

    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        info: {
          Title: `Reporte - ${reportData.cosecha.nombre}`,
          Author: `${reportData.administrador.nombre} ${reportData.administrador.apellido}`,
          Subject: 'Reporte de Cosecha - CropTrack'
        }
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log('✅ [REPORT-SERVICE] generatePDF - PDF generado, tamanio:', pdfBuffer.length, 'bytes');
        callback(null, pdfBuffer);
      });
      doc.on('error', (err) => {
        console.error('❌ [REPORT-SERVICE] generatePDF - Error en stream:', err);
        callback(err, null);
      });

      // Construir secciones del PDF
      this._addHeader(doc, reportData);
      this._addCropDetails(doc, reportData);
      this._addWorkersSection(doc, reportData);
      this._addTasksSection(doc, reportData);
      this._addMeasurementsSection(doc, reportData);

      // Generar graficos es async, lo hacemos al final
      this._addMeasurementCharts(doc, reportData).then(() => {
        this._addFooter(doc, reportData);
        doc.end();
      }).catch((err) => {
        console.error('❌ [REPORT-SERVICE] Error generando graficos:', err);
        // Terminar el PDF aun sin graficos
        this._addFooter(doc, reportData);
        doc.end();
      });

    } catch (err) {
      console.error('❌ [REPORT-SERVICE] generatePDF - Error critico:', err);
      callback(err, null);
    }
  },

  // === HEADER ===
  _addHeader(doc, reportData) {
    const { administrador, cosecha } = reportData;

    // Linea decorativa superior
    doc.rect(MARGIN, MARGIN, CONTENT_WIDTH, 4).fill(COLORS.primary);
    doc.moveDown(0.5);

    // Empresa
    doc.y = MARGIN + 15;
    doc.fontSize(22).fillColor(COLORS.primary).font('Helvetica-Bold')
      .text(administrador.empresa.toUpperCase(), MARGIN, doc.y, { align: 'center' });

    // Subtitulo
    doc.fontSize(14).fillColor(COLORS.dark).font('Helvetica')
      .text('Reporte de Cosecha', { align: 'center' });

    doc.moveDown(0.3);

    // Nombre de la cosecha
    doc.fontSize(18).fillColor(COLORS.secondary).font('Helvetica-Bold')
      .text(cosecha.nombre, { align: 'center' });

    doc.moveDown(0.5);

    // Info del administrador y fecha
    doc.fontSize(9).fillColor(COLORS.gray).font('Helvetica');
    const infoY = doc.y;

    doc.text(`Administrador: ${administrador.nombre} ${administrador.apellido}`, MARGIN, infoY);
    doc.text(`Email: ${administrador.email}`, MARGIN, doc.y);
    if (administrador.telefono) {
      doc.text(`Telefono: ${administrador.telefono}`, MARGIN, doc.y);
    }

    doc.text(`Fecha de generacion: ${this._formatDate(reportData.generado_en)}`, MARGIN, infoY, { align: 'right' });

    doc.y = Math.max(doc.y, infoY + 35);
    doc.moveDown(0.5);

    // Linea separadora
    doc.moveTo(MARGIN, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y)
      .strokeColor(COLORS.lightGray).lineWidth(1).stroke();
    doc.moveDown(1);
  },

  // === DETALLES DEL CULTIVO ===
  _addCropDetails(doc, reportData) {
    const { cosecha } = reportData;

    this._addSectionTitle(doc, 'Detalles del Cultivo');

    // Imagen del cultivo si existe
    const imgResult = this._embedImage(doc, cosecha.imagen_url, { width: 150, height: 100 });
    if (imgResult) {
      doc.moveDown(0.5);
    }

    // Tabla de detalles
    const details = [
      ['Nombre', cosecha.nombre],
      ['Tipo', cosecha.tipo],
      ['Variedad', cosecha.variedad || '-'],
      ['Area (hectareas)', cosecha.area_hectareas ? `${cosecha.area_hectareas} ha` : '-'],
      ['Ubicacion', cosecha.ubicacion || '-'],
      ['Fecha de Siembra', this._formatDate(cosecha.fecha_siembra)],
      ['Fecha Cosecha Estimada', this._formatDate(cosecha.fecha_cosecha_estimada)],
      ['Fecha Cosecha Real', this._formatDate(cosecha.fecha_cosecha_real)],
      ['Estado', this._formatEstado(cosecha.estado)],
      ['Notas', cosecha.notas || '-']
    ];

    const colWidths = [CONTENT_WIDTH * 0.35, CONTENT_WIDTH * 0.65];
    details.forEach((row, i) => {
      this._checkPageBreak(doc, 20);
      const y = doc.y;
      const bgColor = i % 2 === 0 ? COLORS.tableRowAlt : COLORS.white;

      doc.rect(MARGIN, y, CONTENT_WIDTH, 18).fill(bgColor);
      doc.fontSize(9).fillColor(COLORS.dark).font('Helvetica-Bold')
        .text(row[0], MARGIN + 5, y + 4, { width: colWidths[0] - 10 });
      doc.fontSize(9).fillColor(COLORS.gray).font('Helvetica')
        .text(row[1], MARGIN + colWidths[0] + 5, y + 4, { width: colWidths[1] - 10 });
      doc.y = y + 18;
    });

    doc.moveDown(1.5);
  },

  // === TRABAJADORES ===
  _addWorkersSection(doc, reportData) {
    const { trabajadores } = reportData;

    this._addSectionTitle(doc, 'Trabajadores Involucrados');

    if (!trabajadores || trabajadores.length === 0) {
      doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica-Oblique')
        .text('No hay trabajadores asignados a tareas de este cultivo.', MARGIN);
      doc.moveDown(1.5);
      return;
    }

    // Header de tabla
    const colWidths = [CONTENT_WIDTH * 0.05, CONTENT_WIDTH * 0.35, CONTENT_WIDTH * 0.35, CONTENT_WIDTH * 0.25];
    this._drawTableHeader(doc, ['#', 'Nombre', 'Apellido', 'Rol'], colWidths);

    // Filas
    trabajadores.forEach((worker, i) => {
      this._checkPageBreak(doc, 20);
      const y = doc.y;
      const bgColor = i % 2 === 0 ? COLORS.white : COLORS.tableRowAlt;

      doc.rect(MARGIN, y, CONTENT_WIDTH, 18).fill(bgColor);
      doc.fontSize(8).fillColor(COLORS.dark).font('Helvetica');

      let x = MARGIN + 5;
      doc.text(`${i + 1}`, x, y + 4, { width: colWidths[0] - 10 });
      x += colWidths[0];
      doc.text(worker.nombre, x, y + 4, { width: colWidths[1] - 10 });
      x += colWidths[1];
      doc.text(worker.apellido, x, y + 4, { width: colWidths[2] - 10 });
      x += colWidths[2];
      doc.text(this._formatRol(worker.rol), x, y + 4, { width: colWidths[3] - 10 });

      doc.y = y + 18;
    });

    doc.moveDown(1.5);
  },

  // === TAREAS ===
  _addTasksSection(doc, reportData) {
    const { tareas } = reportData;

    this._addSectionTitle(doc, 'Tareas');

    if (!tareas || tareas.length === 0) {
      doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica-Oblique')
        .text('No hay tareas registradas para este cultivo.', MARGIN);
      doc.moveDown(1.5);
      return;
    }

    // Agrupar por estado
    const grupos = this._groupBy(tareas, 'estado');
    const ordenEstados = ['pendiente', 'en_proceso', 'completada', 'cancelada'];

    ordenEstados.forEach((estado) => {
      const tareasGrupo = grupos[estado];
      if (!tareasGrupo || tareasGrupo.length === 0) return;

      this._checkPageBreak(doc, 60);

      // Subtitulo del grupo
      const color = COLORS.estados[estado] || COLORS.gray;
      doc.fontSize(11).fillColor(color).font('Helvetica-Bold')
        .text(`${this._formatEstado(estado)} (${tareasGrupo.length})`, MARGIN);
      doc.moveDown(0.3);

      // Header de tabla
      const colWidths = [
        CONTENT_WIDTH * 0.25,
        CONTENT_WIDTH * 0.20,
        CONTENT_WIDTH * 0.15,
        CONTENT_WIDTH * 0.15,
        CONTENT_WIDTH * 0.15,
        CONTENT_WIDTH * 0.10
      ];
      this._drawTableHeader(doc, ['Titulo', 'Asignado a', 'Prioridad', 'F. Inicio', 'F. Limite', 'Imagen'], colWidths);

      // Filas
      tareasGrupo.forEach((tarea, i) => {
        this._checkPageBreak(doc, 20);
        const y = doc.y;
        const bgColor = i % 2 === 0 ? COLORS.white : COLORS.tableRowAlt;

        doc.rect(MARGIN, y, CONTENT_WIDTH, 18).fill(bgColor);
        doc.fontSize(7).fillColor(COLORS.dark).font('Helvetica');

        let x = MARGIN + 3;
        const asignado = tarea.asignado_nombre
          ? `${tarea.asignado_nombre} ${tarea.asignado_apellido}`
          : 'Sin asignar';

        doc.text(this._truncate(tarea.titulo, 30), x, y + 4, { width: colWidths[0] - 6 });
        x += colWidths[0];
        doc.text(asignado, x, y + 4, { width: colWidths[1] - 6 });
        x += colWidths[1];
        doc.text(this._formatPrioridad(tarea.prioridad), x, y + 4, { width: colWidths[2] - 6 });
        x += colWidths[2];
        doc.text(this._formatDate(tarea.fecha_inicio), x, y + 4, { width: colWidths[3] - 6 });
        x += colWidths[3];
        doc.text(this._formatDate(tarea.fecha_limite), x, y + 4, { width: colWidths[4] - 6 });
        x += colWidths[4];
        doc.text(tarea.imagen_url ? 'Si' : 'No', x, y + 4, { width: colWidths[5] - 6 });

        doc.y = y + 18;
      });

      doc.moveDown(0.8);
    });

    doc.moveDown(1);
  },

  // === MEDICIONES (tabla) ===
  _addMeasurementsSection(doc, reportData) {
    const { mediciones } = reportData;

    this._addSectionTitle(doc, 'Mediciones');

    if (!mediciones || mediciones.length === 0) {
      doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica-Oblique')
        .text('No hay mediciones registradas para este cultivo.', MARGIN);
      doc.moveDown(1.5);
      return;
    }

    // Agrupar por tipo_medicion
    const grupos = this._groupBy(mediciones, 'tipo_medicion');

    Object.keys(grupos).forEach((tipo) => {
      const medicionesGrupo = grupos[tipo];
      if (!medicionesGrupo || medicionesGrupo.length === 0) return;

      this._checkPageBreak(doc, 60);

      const unidad = medicionesGrupo[0].unidad || '';

      // Subtitulo del grupo
      doc.fontSize(11).fillColor(COLORS.secondary).font('Helvetica-Bold')
        .text(`${tipo} (${unidad}) - ${medicionesGrupo.length} registros`, MARGIN);
      doc.moveDown(0.3);

      // Header de tabla
      const colWidths = [
        CONTENT_WIDTH * 0.20,
        CONTENT_WIDTH * 0.15,
        CONTENT_WIDTH * 0.10,
        CONTENT_WIDTH * 0.30,
        CONTENT_WIDTH * 0.25
      ];
      this._drawTableHeader(doc, ['Fecha', 'Valor', 'Unidad', 'Observaciones', 'Registrado por'], colWidths);

      // Filas
      medicionesGrupo.forEach((med, i) => {
        this._checkPageBreak(doc, 20);
        const y = doc.y;
        const bgColor = i % 2 === 0 ? COLORS.white : COLORS.tableRowAlt;

        doc.rect(MARGIN, y, CONTENT_WIDTH, 18).fill(bgColor);
        doc.fontSize(7).fillColor(COLORS.dark).font('Helvetica');

        let x = MARGIN + 3;
        const registradoPor = med.usuario_nombre
          ? `${med.usuario_nombre} ${med.usuario_apellido}`
          : '-';

        doc.text(this._formatDate(med.fecha_medicion), x, y + 4, { width: colWidths[0] - 6 });
        x += colWidths[0];
        doc.text(`${med.valor}`, x, y + 4, { width: colWidths[1] - 6 });
        x += colWidths[1];
        doc.text(med.unidad, x, y + 4, { width: colWidths[2] - 6 });
        x += colWidths[2];
        doc.text(this._truncate(med.observaciones || '-', 35), x, y + 4, { width: colWidths[3] - 6 });
        x += colWidths[3];
        doc.text(registradoPor, x, y + 4, { width: colWidths[4] - 6 });

        doc.y = y + 18;
      });

      doc.moveDown(0.8);
    });

    doc.moveDown(1);
  },

  // === GRAFICOS DE MEDICIONES ===
  async _addMeasurementCharts(doc, reportData) {
    const { mediciones } = reportData;
    if (!mediciones || mediciones.length === 0) return;

    const grupos = this._groupBy(mediciones, 'tipo_medicion');

    for (const tipo of Object.keys(grupos)) {
      const medicionesGrupo = grupos[tipo];
      if (medicionesGrupo.length < 2) continue; // Necesitamos al menos 2 puntos para un grafico

      this._checkPageBreak(doc, 300);

      doc.fontSize(11).fillColor(COLORS.secondary).font('Helvetica-Bold')
        .text(`Grafico: ${tipo}`, MARGIN);
      doc.moveDown(0.3);

      try {
        const chartBuffer = await this._renderChart(medicionesGrupo, tipo);
        if (chartBuffer) {
          doc.image(chartBuffer, MARGIN, doc.y, { width: CONTENT_WIDTH, height: 220 });
          doc.y += 230;
        }
      } catch (err) {
        console.error(`❌ [REPORT-SERVICE] Error generando grafico para ${tipo}:`, err);
        doc.fontSize(8).fillColor(COLORS.gray).font('Helvetica-Oblique')
          .text('No se pudo generar el grafico para este tipo de medicion.', MARGIN);
      }

      doc.moveDown(1);
    }
  },

  async _renderChart(mediciones, tipo) {
    const labels = mediciones.map(m => this._formatDate(m.fecha_medicion));
    const data = mediciones.map(m => parseFloat(m.valor));
    const unidad = mediciones[0].unidad || '';

    const configuration = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${tipo} (${unidad})`,
          data,
          borderColor: COLORS.primary,
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: COLORS.primary,
          pointRadius: 4,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: `${tipo} a lo largo del tiempo`,
            font: { size: 14 }
          },
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Fecha' },
            ticks: { maxRotation: 45 }
          },
          y: {
            title: { display: true, text: `${tipo} (${unidad})` },
            beginAtZero: false
          }
        }
      }
    };

    return await chartJSNodeCanvas.renderToBuffer(configuration);
  },

  // === FOOTER ===
  _addFooter(doc, reportData) {
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);

      // Linea inferior
      doc.moveTo(MARGIN, PAGE_HEIGHT - 35)
        .lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 35)
        .strokeColor(COLORS.lightGray).lineWidth(0.5).stroke();

      doc.fontSize(7).fillColor(COLORS.gray).font('Helvetica')
        .text(
          `CropTrack - ${reportData.administrador.empresa} | Pagina ${i + 1} de ${totalPages}`,
          MARGIN,
          PAGE_HEIGHT - 30,
          { align: 'center', width: CONTENT_WIDTH }
        );
    }
  },

  // === UTILIDADES ===

  _addSectionTitle(doc, title) {
    this._checkPageBreak(doc, 40);

    const y = doc.y;
    doc.rect(MARGIN, y, 4, 18).fill(COLORS.primary);
    doc.fontSize(14).fillColor(COLORS.dark).font('Helvetica-Bold')
      .text(title, MARGIN + 12, y + 1);
    doc.moveDown(0.8);
  },

  _drawTableHeader(doc, columns, colWidths) {
    const y = doc.y;
    doc.rect(MARGIN, y, CONTENT_WIDTH, 20).fill(COLORS.tableHeader);

    doc.fontSize(8).fillColor(COLORS.tableHeaderText).font('Helvetica-Bold');
    let x = MARGIN + 3;
    columns.forEach((col, i) => {
      doc.text(col, x, y + 5, { width: colWidths[i] - 6 });
      x += colWidths[i];
    });

    doc.y = y + 20;
  },

  _embedImage(doc, imageUrl, options = {}) {
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) return false;

    const relativePath = imageUrl.replace('/uploads/', '');
    const filePath = path.join(UPLOADS_DIR, relativePath);

    if (!fs.existsSync(filePath)) {
      console.log('⚠️ [REPORT-SERVICE] Imagen no encontrada:', filePath);
      return false;
    }

    try {
      const { width = 120, height = 80 } = options;
      doc.image(filePath, MARGIN, doc.y, { width, height });
      doc.y += height + 5;
      return true;
    } catch (err) {
      console.error('❌ [REPORT-SERVICE] Error embebiendo imagen:', err);
      return false;
    }
  },

  _formatDate(dateString) {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '-';
    }
  },

  _formatEstado(estado) {
    const labels = {
      planificado: 'Planificado',
      sembrado: 'Sembrado',
      en_crecimiento: 'En Crecimiento',
      maduro: 'Maduro',
      cosechado: 'Cosechado',
      cancelado: 'Cancelado',
      pendiente: 'Pendiente',
      en_proceso: 'En Proceso',
      completada: 'Completada'
    };
    return labels[estado] || estado || '-';
  },

  _formatPrioridad(prioridad) {
    const labels = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta',
      urgente: 'Urgente'
    };
    return labels[prioridad] || prioridad || '-';
  },

  _formatRol(rol) {
    const labels = {
      administrador: 'Administrador',
      supervisor: 'Supervisor',
      trabajador: 'Trabajador'
    };
    return labels[rol] || rol || '-';
  },

  _truncate(text, maxLength) {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  },

  _groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = item[key] || 'Sin clasificar';
      if (!groups[value]) groups[value] = [];
      groups[value].push(item);
      return groups;
    }, {});
  },

  _checkPageBreak(doc, neededSpace) {
    if (doc.y + neededSpace > PAGE_HEIGHT - MARGIN - 40) {
      doc.addPage();
    }
  }
};

export default reportService;
