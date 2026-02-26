import PDFDocument from 'pdfkit';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const LOGO_PATH = path.join(__dirname, '..', '..', 'client', 'src', 'assets', 'Logo.png');

// ─────────────────────────────────────────────────────────────
// CHARTJS-NODE-CANVAS — instancia global
//
// ChartJSNodeCanvas crea un canvas virtual en Node.js usando la
// librería `canvas` (bindings de C++ a Cairo). Cada instancia
// reserva memoria para un canvas de las dimensiones dadas.
//
// BUENAS PRÁCTICAS:
//   ✅ Crear UNA sola instancia global (no una por request)
//      porque inicializar el canvas tiene costo de memoria.
//   ✅ backgroundColour: 'white' para que el PNG no sea transparente
//      (transparencia en PDF se ve mal, especialmente al imprimir).
//   ✅ width/height definen la resolución del PNG generado.
//      500x250 es suficiente para un PDF A4. No necesitás 1920x1080.
//
// MÉTODO PRINCIPAL:
//   chartJSNodeCanvas.renderToBuffer(configuration)
//     → Devuelve Promise<Buffer> con los bytes del PNG.
//     → Ese Buffer se pasa directamente a doc.image() de PDFKit.
// ─────────────────────────────────────────────────────────────
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 500,
  height: 250,
  backgroundColour: 'white'
});

// ─────────────────────────────────────────────────────────────
// CONSTANTES DE DISEÑO
// Centralizar los valores numéricos evita bugs de coordenadas.
// En PDFKit todo se mide en "puntos tipográficos" (pt):
//   1 pt = 1/72 pulgada
//   A4 = 595.28 x 841.89 pt
// ─────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',
  secondary: '#1565C0',
  accent: '#F57F17',
  dark: '#212121',
  gray: '#616161',
  lightGray: '#E0E0E0',
  ultraLightGray: '#F5F5F5',
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

const PAGE_WIDTH = 595.28;   // A4 en puntos
const PAGE_HEIGHT = 841.89;  // A4 en puntos
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);  // 495.28

// ─────────────────────────────────────────────────────────────
// SAFE_BOTTOM — el límite inferior del área de contenido.
//
// Este es el valor CRÍTICO para evitar páginas en blanco.
//
// El documento se crea con margins: { bottom: MARGIN (50) }
// Eso significa que el área válida de escritura es:
//   desde Y = MARGIN (50) hasta Y = PAGE_HEIGHT - MARGIN (791.89)
//
// Si escribís texto en Y > 791.89, PDFKit lo interpreta como
// "necesito más espacio" y automáticamente crea una página nueva.
// ESO es exactamente lo que causaba las páginas en blanco:
// el footer se escribía en Y = PAGE_HEIGHT - MARGIN + 10 = 801.89
// que está FUERA del área válida.
//
// FOOTER_Y = 771 deja 20pt de margen antes del SAFE_BOTTOM (791.89)
// ─────────────────────────────────────────────────────────────
const SAFE_BOTTOM = PAGE_HEIGHT - MARGIN;  // 791.89
const FOOTER_Y = SAFE_BOTTOM - 20;         // 771.89 — zona segura para el footer

const reportService = {

  // ─────────────────────────────────────────────────────────
  // generatePDF — función principal
  //
  // CÓMO FUNCIONA PDFKIT (modelo mental):
  //
  // 1. PDFKit es un GENERADOR DE STREAMS.
  //    new PDFDocument() crea un Readable Stream.
  //    Cada vez que dibujás algo (texto, rect, imagen) PDFKit
  //    emite chunks de bytes binarios por el evento 'data'.
  //    Cuando llamás doc.end(), emite el evento 'end'.
  //
  // 2. EL CURSOR (doc.x, doc.y).
  //    PDFKit tiene un cursor que avanza automáticamente SOLO
  //    después de operaciones de TEXTO (.text(), .moveDown()).
  //    Para imágenes, rectángulos y líneas el cursor NO avanza
  //    solo. Tenés que moverlo manualmente con doc.y += altura.
  //
  // 3. PÁGINAS.
  //    PDFKit crea una nueva página automáticamente cuando el
  //    cursor supera el límite inferior. También podés forzarla
  //    con doc.addPage().
  //
  // 4. bufferPages: true.
  //    Por defecto PDFKit hace flush (envía al stream) de cada
  //    página apenas la termina. Con bufferPages: true las guarda
  //    en memoria. Esto permite usar doc.switchToPage(n) para
  //    volver a una página anterior. NECESARIO para el footer.
  //    IMPORTANTE: con bufferPages activo, doc.end() hace flush
  //    de todas las páginas juntas.
  //
  // 5. PATRÓN ASYNC/SYNC MIXTO.
  //    Las secciones de contenido son síncronas (header, tablas).
  //    Los gráficos son async (chartjs-node-canvas usa Promises).
  //    Por eso: primero ejecutamos todo lo síncrono, luego
  //    esperamos los gráficos con await, y al final llamamos
  //    doc.end() que dispara el evento 'end' y el callback.
  // ─────────────────────────────────────────────────────────
  generatePDF(reportData, callback) {
    console.log('🟡 [REPORT-SERVICE] generatePDF - Iniciando generacion...');
    console.log('🟡 [REPORT-SERVICE] Cosecha:', reportData.cosecha.nombre);
    console.log('🟡 [REPORT-SERVICE] Datos:', {
      trabajadores: reportData.trabajadores.length,
      tareas: reportData.tareas.length,
      mediciones: reportData.mediciones.length
    });

    try {
      console.log('📄 [REPORT-SERVICE] Creando PDFDocument (A4, bufferPages: true)...');
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        bufferPages: true,  // Necesario para switchToPage() en el footer
        info: {
          Title: `Reporte - ${reportData.cosecha.nombre}`,
          Author: `${reportData.administrador.nombre} ${reportData.administrador.apellido}`,
          Subject: 'Reporte de Cosecha - CropTrack'
        }
      });
      console.log('✅ [REPORT-SERVICE] PDFDocument creado');

      // Acumulamos los chunks del stream en un array
      const chunks = [];
      let chunkCount = 0;
      doc.on('data', (chunk) => {
        chunks.push(chunk);
        chunkCount++;
      });

      // Cuando doc.end() se llama, se emite 'end' y concatenamos
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log('✅ [REPORT-SERVICE] Stream finalizado');
        console.log('✅ [REPORT-SERVICE] Total chunks:', chunkCount);
        console.log('✅ [REPORT-SERVICE] PDF generado:', (pdfBuffer.length / 1024).toFixed(2), 'KB');
        callback(null, pdfBuffer);
      });

      doc.on('error', (err) => {
        console.error('❌ [REPORT-SERVICE] Error en stream:', err.message || err);
        callback(err, null);
      });

      // ── Secciones síncronas ──────────────────────────────
      console.log('📝 [REPORT-SERVICE] Agregando seccion: Header...');
      this._addHeader(doc, reportData);
      console.log('✅ [REPORT-SERVICE] Header agregado - doc.y:', doc.y.toFixed(2));

      console.log('📝 [REPORT-SERVICE] Agregando seccion: Resumen Ejecutivo...');
      this._addExecutiveSummary(doc, reportData);
      console.log('✅ [REPORT-SERVICE] Resumen Ejecutivo agregado - doc.y:', doc.y.toFixed(2));

      console.log('📝 [REPORT-SERVICE] Agregando seccion: Detalles del Cultivo...');
      this._addCropDetails(doc, reportData);
      console.log('✅ [REPORT-SERVICE] Detalles del Cultivo agregado - doc.y:', doc.y.toFixed(2));

      console.log('📝 [REPORT-SERVICE] Agregando seccion: Trabajadores...');
      this._addWorkersSection(doc, reportData);
      console.log('✅ [REPORT-SERVICE] Trabajadores agregado - doc.y:', doc.y.toFixed(2));

      console.log('📝 [REPORT-SERVICE] Agregando seccion: Tareas...');
      this._addTasksSection(doc, reportData);
      console.log('✅ [REPORT-SERVICE] Tareas agregado - doc.y:', doc.y.toFixed(2));

      console.log('📝 [REPORT-SERVICE] Agregando seccion: Mediciones...');
      this._addMeasurementsSection(doc, reportData);
      console.log('✅ [REPORT-SERVICE] Mediciones agregado - doc.y:', doc.y.toFixed(2));

      // ── Secciones async (gráficos) ───────────────────────
      console.log('📊 [REPORT-SERVICE] Iniciando secciones async (graficos)...');
      this._addAllCharts(doc, reportData)
        .then(() => {
          console.log('✅ [REPORT-SERVICE] Todos los graficos agregados - doc.y:', doc.y.toFixed(2));
          const { count } = doc.bufferedPageRange();
          console.log('📄 [REPORT-SERVICE] Total paginas antes de footer:', count);

          console.log('📝 [REPORT-SERVICE] Agregando footer a todas las paginas...');
          this._addFooter(doc, reportData);
          console.log('✅ [REPORT-SERVICE] Footer agregado');

          console.log('📄 [REPORT-SERVICE] Llamando doc.end()...');
          doc.end();
        })
        .catch((err) => {
          console.error('❌ [REPORT-SERVICE] Error en graficos:', err.message || err);
          console.log('⚠️ [REPORT-SERVICE] Continuando sin graficos, agregando footer...');
          this._addFooter(doc, reportData);
          doc.end();
        });

    } catch (err) {
      console.error('❌ [REPORT-SERVICE] Error critico:', err.message || err);
      console.error('❌ [REPORT-SERVICE] Stack:', err.stack);
      callback(err, null);
    }
  },

  // ─────────────────────────────────────────────────────────
  // _addHeader
  //
  // PDFKIT — operaciones usadas:
  //
  // doc.rect(x, y, ancho, alto).fill(color)
  //   Dibuja un rectángulo relleno. No mueve el cursor.
  //   Hay que mover doc.y manualmente si querés continuar abajo.
  //
  // doc.y = valor
  //   Posiciona el cursor explícitamente. Útil después de
  //   operaciones de dibujo que no mueven el cursor.
  //
  // doc.fontSize(n).fillColor(hex).font('nombre').text('txt', x, y, opts)
  //   Escribe texto. Mueve el cursor hacia abajo automáticamente.
  //   Si no pasás x,y usa la posición actual del cursor.
  //   opts.align: 'left' | 'center' | 'right'
  //   opts.width: ancho máximo antes de hacer word-wrap
  //
  // doc.moveDown(n)
  //   Mueve el cursor hacia abajo n líneas (basado en fontSize actual).
  //   Equivale a un "enter" en el documento.
  //
  // doc.moveTo(x1,y1).lineTo(x2,y2).strokeColor(hex).lineWidth(n).stroke()
  //   Dibuja una línea. No mueve el cursor.
  // ─────────────────────────────────────────────────────────
  _addHeader(doc, reportData) {
    console.log('   🔹 [REPORT-SERVICE] _addHeader - Inicio');
    const { administrador, cosecha } = reportData;

    // ── Bloque de marca: Logo + "CropTrack" ───────────────
    // Logo a la izquierda desde el top margin, "CropTrack" a su derecha
    // verticalmente centrado. La barra verde va DEBAJO de este bloque.
    const brandY = MARGIN;
    const logoSize = 44;
    const titleFontSize = 26;
    let logoDrawn = false;

    if (fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, MARGIN, brandY, { fit: [logoSize, logoSize] });
        logoDrawn = true;
        console.log('   🖼️ [REPORT-SERVICE] _addHeader - Logo insertado');
      } catch (e) {
        console.warn('   ⚠️ [REPORT-SERVICE] _addHeader - Logo no pudo insertarse:', e.message);
      }
    } else {
      console.warn('   ⚠️ [REPORT-SERVICE] _addHeader - Logo no encontrado en:', LOGO_PATH);
    }

    const titleX = logoDrawn ? MARGIN + logoSize + 10 : MARGIN;
    const titleW = logoDrawn ? CONTENT_WIDTH - logoSize - 10 : CONTENT_WIDTH;
    const titleY = brandY + Math.max(0, (logoSize - titleFontSize) / 2);

    doc.fontSize(titleFontSize).fillColor(COLORS.primary).font('Helvetica-Bold')
      .text('CropTrack', titleX, titleY, { width: titleW, align: logoDrawn ? 'left' : 'center' });

    // ── Barra decorativa DEBAJO del bloque logo+CropTrack ──
    const barY = brandY + logoSize + 6;
    doc.rect(MARGIN, barY, CONTENT_WIDTH, 6).fill(COLORS.primary);
    doc.rect(MARGIN, barY + 6, CONTENT_WIDTH, 2).fill(COLORS.primaryLight);
    doc.y = barY + 8 + 10;

    // ── Contenido original del header (sin cambios) ────────
    doc.fontSize(24).fillColor(COLORS.primary).font('Helvetica-Bold')
      .text(administrador.empresa.toUpperCase(), MARGIN, doc.y, { align: 'center' });

    doc.moveDown(0.2);
    doc.fontSize(12).fillColor(COLORS.gray).font('Helvetica')
      .text('REPORTE DE COSECHA', { align: 'center' });

    doc.moveDown(0.4);

    doc.fontSize(20).fillColor(COLORS.secondary).font('Helvetica-Bold')
      .text(cosecha.nombre, { align: 'center' });

    doc.moveDown(0.6);

    doc.fontSize(8.5).fillColor(COLORS.gray).font('Helvetica');
    const infoY = doc.y;

    doc.text(`Administrador: ${administrador.nombre} ${administrador.apellido}`, MARGIN, infoY);
    doc.text(`Email: ${administrador.email}`, MARGIN, doc.y);
    if (administrador.telefono) {
      doc.text(`Telefono: ${administrador.telefono}`, MARGIN, doc.y);
    }

    doc.fontSize(8.5).fillColor(COLORS.gray).font('Helvetica')
      .text(`Generado: ${this._formatDate(reportData.generado_en)}`, MARGIN, infoY, { align: 'right' });

    doc.y = Math.max(doc.y, infoY + 35);
    doc.moveDown(0.5);

    doc.moveTo(MARGIN, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y)
      .strokeColor(COLORS.lightGray).lineWidth(1).stroke();
    doc.moveDown(1);
    console.log('   🔹 [REPORT-SERVICE] _addHeader - Fin - doc.y:', doc.y.toFixed(2));
  },

  // ─────────────────────────────────────────────────────────
  // _addExecutiveSummary
  //
  // Dibuja 4 "cards" de estadísticas en una fila.
  // Como son rectángulos posicionados con coordenadas absolutas,
  // manejamos doc.y manualmente al final.
  // ─────────────────────────────────────────────────────────
  _addExecutiveSummary(doc, reportData) {
    console.log('   🔹 [REPORT-SERVICE] _addExecutiveSummary - Inicio');
    const { trabajadores, tareas, mediciones, cosecha } = reportData;

    this._addSectionTitle(doc, 'Resumen Ejecutivo');

    const cardWidth = (CONTENT_WIDTH - 18) / 4;
    const cardHeight = 50;
    const startY = doc.y;

    const cards = [
      { value: (trabajadores || []).length, label: 'Trabajadores', color: COLORS.primary },
      { value: (tareas || []).length, label: 'Tareas', color: COLORS.accent },
      { value: (mediciones || []).length, label: 'Mediciones', color: COLORS.secondary },
      { value: this._formatEstado(cosecha.estado), label: 'Estado', color: this._getEstadoColor(cosecha.estado) }
    ];

    cards.forEach((card, i) => {
      const x = MARGIN + i * (cardWidth + 6);

      doc.roundedRect(x, startY, cardWidth, cardHeight, 4).fill(COLORS.ultraLightGray);
      doc.rect(x, startY, cardWidth, 3).fill(card.color);

      const isText = typeof card.value === 'string' && card.value.length > 3;
      doc.fontSize(isText ? 11 : 18).fillColor(card.color).font('Helvetica-Bold')
        .text(`${card.value}`, x, startY + (isText ? 14 : 10), { width: cardWidth, align: 'center' });

      doc.fontSize(7).fillColor(COLORS.gray).font('Helvetica')
        .text(card.label.toUpperCase(), x, startY + 35, { width: cardWidth, align: 'center' });
    });

    // Avanzar el cursor manualmente porque solo dibujamos rectángulos
    doc.y = startY + cardHeight + 15;
    doc.moveDown(0.5);
    console.log('   🔹 [REPORT-SERVICE] _addExecutiveSummary - Fin - doc.y:', doc.y.toFixed(2));
  },

  // ─────────────────────────────────────────────────────────
  // _addCropDetails
  //
  // doc.image(src, x, y, opts)
  //   src puede ser: ruta de archivo (string) o Buffer de bytes.
  //   opts.width / opts.height: dimensiones en puntos.
  //   opts.fit: [ancho, alto] — escala manteniendo aspect ratio.
  //   IMPORTANTE: .image() NO mueve doc.y automáticamente.
  //   Hay que hacer doc.y += height + padding manualmente.
  // ─────────────────────────────────────────────────────────
  _addCropDetails(doc, reportData) {
    console.log('   🔹 [REPORT-SERVICE] _addCropDetails - Inicio');
    const { cosecha } = reportData;

    this._addSectionTitle(doc, 'Detalles del Cultivo');
    console.log('   🔹 [REPORT-SERVICE] _addCropDetails - Imagen:', cosecha.imagen_url || 'sin imagen');

    const imgResult = this._embedImage(doc, cosecha.imagen_url, { width: 150, height: 100 });
    if (imgResult) {
      doc.moveDown(0.5);
    }

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

      // Fila de la tabla: dibujamos el fondo y luego el texto
      doc.rect(MARGIN, y, CONTENT_WIDTH, 18).fill(bgColor);

      doc.fontSize(9).fillColor(COLORS.dark).font('Helvetica-Bold')
        .text(row[0], MARGIN + 5, y + 4, { width: colWidths[0] - 10 });

      doc.fontSize(9).fillColor(COLORS.gray).font('Helvetica')
        .text(row[1], MARGIN + colWidths[0] + 5, y + 4, { width: colWidths[1] - 10 });

      // Avanzar el cursor manualmente la altura de la fila
      doc.y = y + 18;
    });

    doc.moveDown(1.5);
    console.log('   🔹 [REPORT-SERVICE] _addCropDetails - Fin - doc.y:', doc.y.toFixed(2));
  },

  _addWorkersSection(doc, reportData) {
    console.log('   🔹 [REPORT-SERVICE] _addWorkersSection - Inicio');
    const { trabajadores } = reportData;
    console.log('   🔹 [REPORT-SERVICE] _addWorkersSection - Total trabajadores:', (trabajadores || []).length);

    this._addSectionTitle(doc, 'Trabajadores Asignados');

    if (!trabajadores || trabajadores.length === 0) {
      doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica-Oblique')
        .text('No hay trabajadores asignados a este cultivo.', MARGIN);
      doc.moveDown(1.5);
      return;
    }

    const colWidths = [
      CONTENT_WIDTH * 0.05,
      CONTENT_WIDTH * 0.30,
      CONTENT_WIDTH * 0.15,
      CONTENT_WIDTH * 0.30,
      CONTENT_WIDTH * 0.20
    ];
    this._drawTableHeader(doc, ['#', 'Nombre Completo', 'Rol', 'Email', 'Telefono'], colWidths);

    trabajadores.forEach((worker, i) => {
      this._checkPageBreak(doc, 20);
      const y = doc.y;
      const bgColor = i % 2 === 0 ? COLORS.white : COLORS.tableRowAlt;

      doc.rect(MARGIN, y, CONTENT_WIDTH, 18).fill(bgColor);
      doc.fontSize(8).fillColor(COLORS.dark).font('Helvetica');

      let x = MARGIN + 5;
      doc.text(`${i + 1}`, x, y + 4, { width: colWidths[0] - 10 });
      x += colWidths[0];
      doc.text(`${worker.nombre} ${worker.apellido}`, x, y + 4, { width: colWidths[1] - 10 });
      x += colWidths[1];
      doc.text(this._formatRol(worker.rol), x, y + 4, { width: colWidths[2] - 10 });
      x += colWidths[2];
      doc.text(worker.email || '-', x, y + 4, { width: colWidths[3] - 10 });
      x += colWidths[3];
      doc.text(worker.telefono || '-', x, y + 4, { width: colWidths[4] - 10 });

      doc.y = y + 18;
    });

    doc.moveDown(1.5);
    console.log('   🔹 [REPORT-SERVICE] _addWorkersSection - Fin - doc.y:', doc.y.toFixed(2));
  },

  _addTasksSection(doc, reportData) {
    console.log('   🔹 [REPORT-SERVICE] _addTasksSection - Inicio');
    const { tareas } = reportData;
    console.log('   🔹 [REPORT-SERVICE] _addTasksSection - Total tareas:', (tareas || []).length);

    this._addSectionTitle(doc, 'Tareas');

    if (!tareas || tareas.length === 0) {
      doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica-Oblique')
        .text('No hay tareas registradas para este cultivo.', MARGIN);
      doc.moveDown(1.5);
      return;
    }

    const grupos = this._groupBy(tareas, 'estado');
    const ordenEstados = ['pendiente', 'en_proceso', 'completada', 'cancelada'];

    ordenEstados.forEach((estado) => {
      const tareasGrupo = grupos[estado];
      if (!tareasGrupo || tareasGrupo.length === 0) return;

      // 80pt = subtítulo(~15) + moveDown(~5) + header(20) + 2 filas(36)
      // Evita que el subtítulo de grupo quede solo al final de una página.
      this._checkPageBreak(doc, 80);

      const color = COLORS.estados[estado] || COLORS.gray;
      doc.fontSize(11).fillColor(color).font('Helvetica-Bold')
        .text(`${this._formatEstado(estado)} (${tareasGrupo.length})`, MARGIN);
      doc.moveDown(0.3);

      const colWidths = [
        CONTENT_WIDTH * 0.25,
        CONTENT_WIDTH * 0.20,
        CONTENT_WIDTH * 0.15,
        CONTENT_WIDTH * 0.15,
        CONTENT_WIDTH * 0.15,
        CONTENT_WIDTH * 0.10
      ];
      this._drawTableHeader(doc, ['Titulo', 'Asignado a', 'Prioridad', 'F. Inicio', 'F. Limite', 'Imagen'], colWidths);

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
    console.log('   🔹 [REPORT-SERVICE] _addTasksSection - Fin - doc.y:', doc.y.toFixed(2));
  },

  _addMeasurementsSection(doc, reportData) {
    console.log('   🔹 [REPORT-SERVICE] _addMeasurementsSection - Inicio');
    const { mediciones } = reportData;
    console.log('   🔹 [REPORT-SERVICE] _addMeasurementsSection - Total mediciones:', (mediciones || []).length);

    this._addSectionTitle(doc, 'Mediciones');

    if (!mediciones || mediciones.length === 0) {
      doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica-Oblique')
        .text('No hay mediciones registradas para este cultivo.', MARGIN);
      doc.moveDown(1.5);
      return;
    }

    const grupos = this._groupBy(mediciones, 'tipo_medicion');

    Object.keys(grupos).forEach((tipo) => {
      const medicionesGrupo = grupos[tipo];
      if (!medicionesGrupo || medicionesGrupo.length === 0) return;

      // Idem tareas: 80pt para subtítulo + header + 2 filas mínimo.
      this._checkPageBreak(doc, 80);

      const unidad = medicionesGrupo[0].unidad || '';

      doc.fontSize(11).fillColor(COLORS.secondary).font('Helvetica-Bold')
        .text(`${tipo} (${unidad}) - ${medicionesGrupo.length} registros`, MARGIN);
      doc.moveDown(0.3);

      const colWidths = [
        CONTENT_WIDTH * 0.20,
        CONTENT_WIDTH * 0.15,
        CONTENT_WIDTH * 0.10,
        CONTENT_WIDTH * 0.30,
        CONTENT_WIDTH * 0.25
      ];
      this._drawTableHeader(doc, ['Fecha', 'Valor', 'Unidad', 'Observaciones', 'Asignado a'], colWidths);

      medicionesGrupo.forEach((med, i) => {
        this._checkPageBreak(doc, 20);
        const y = doc.y;
        const bgColor = i % 2 === 0 ? COLORS.white : COLORS.tableRowAlt;

        doc.rect(MARGIN, y, CONTENT_WIDTH, 18).fill(bgColor);
        doc.fontSize(7).fillColor(COLORS.dark).font('Helvetica');

        let x = MARGIN + 3;
        const asignadoA = med.usuario_nombre
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
        doc.text(asignadoA, x, y + 4, { width: colWidths[4] - 6 });

        doc.y = y + 18;
      });

      doc.moveDown(0.8);
    });

    doc.moveDown(1);
    console.log('   🔹 [REPORT-SERVICE] _addMeasurementsSection - Fin - doc.y:', doc.y.toFixed(2));
  },

  // ─────────────────────────────────────────────────────────
  // _addAllCharts — orquestador async de gráficos
  //
  // PATRÓN CLAVE: renderizar TODOS los buffers primero,
  // luego insertar en el PDF.
  //
  // ¿Por qué? chartjs-node-canvas.renderToBuffer() es async.
  // Si mezcláramos await con escritura al doc, PDFKit podría
  // estar en un estado inconsistente. Al separar las dos fases
  // (render → insert) el código es predecible y sin race conditions.
  // ─────────────────────────────────────────────────────────
  async _addAllCharts(doc, reportData) {
    console.log('   📊 [REPORT-SERVICE] _addAllCharts - Inicio');
    const { tareas, mediciones } = reportData;

    if (tareas && tareas.length > 0) {
      console.log('   📊 [REPORT-SERVICE] _addAllCharts - Generando graficos de tareas...');
      await this._addTaskCharts(doc, tareas);
      console.log('   📊 [REPORT-SERVICE] _addAllCharts - Graficos de tareas completados - doc.y:', doc.y.toFixed(2));
    } else {
      console.log('   📊 [REPORT-SERVICE] _addAllCharts - Sin tareas, omitiendo graficos de tareas');
    }

    if (mediciones && mediciones.length > 0) {
      console.log('   📊 [REPORT-SERVICE] _addAllCharts - Generando graficos de mediciones...');
      await this._addMeasurementCharts(doc, mediciones);
      console.log('   📊 [REPORT-SERVICE] _addAllCharts - Graficos de mediciones completados - doc.y:', doc.y.toFixed(2));
    } else {
      console.log('   📊 [REPORT-SERVICE] _addAllCharts - Sin mediciones, omitiendo graficos de mediciones');
    }

    console.log('   📊 [REPORT-SERVICE] _addAllCharts - Fin');
  },

  async _addTaskCharts(doc, tareas) {
    console.log('      📊 [REPORT-SERVICE] _addTaskCharts - Inicio - tareas:', tareas.length);
    // FASE 1: preparar datos
    const estadoGroups = this._groupBy(tareas, 'estado');
    const estadoLabels = [], estadoData = [], estadoColors = [];

    ['pendiente', 'en_proceso', 'completada', 'cancelada'].forEach(estado => {
      const count = (estadoGroups[estado] || []).length;
      if (count > 0) {
        estadoLabels.push(this._formatEstado(estado));
        estadoData.push(count);
        estadoColors.push(COLORS.estados[estado]);
      }
    });

    const prioridadGroups = this._groupBy(tareas, 'prioridad');
    const prioridadLabels = [], prioridadData = [], prioridadColors = [];

    ['baja', 'media', 'alta', 'urgente'].forEach(prio => {
      const count = (prioridadGroups[prio] || []).length;
      if (count > 0) {
        prioridadLabels.push(this._formatPrioridad(prio));
        prioridadData.push(count);
        prioridadColors.push(COLORS.prioridades[prio]);
      }
    });

    // FASE 2: renderizar buffers PNG (async)
    let doughnutBuffer = null;
    let barBuffer = null;

    try {
      if (estadoLabels.length > 0) {
        console.log('      📊 [REPORT-SERVICE] _addTaskCharts - Renderizando doughnut (estados):', estadoLabels);
        doughnutBuffer = await this._renderDoughnutChart(estadoLabels, estadoData, estadoColors, 'Distribucion por Estado');
        console.log('      ✅ [REPORT-SERVICE] _addTaskCharts - Doughnut renderizado:', (doughnutBuffer.length / 1024).toFixed(2), 'KB');
      }
    } catch (err) {
      console.error('      ❌ [REPORT-SERVICE] Error grafico estados:', err.message || err);
    }

    try {
      if (prioridadLabels.length > 0) {
        console.log('      📊 [REPORT-SERVICE] _addTaskCharts - Renderizando barras (prioridades):', prioridadLabels);
        barBuffer = await this._renderBarChart(prioridadLabels, prioridadData, prioridadColors, 'Distribucion por Prioridad');
        console.log('      ✅ [REPORT-SERVICE] _addTaskCharts - Barras renderizado:', (barBuffer.length / 1024).toFixed(2), 'KB');
      }
    } catch (err) {
      console.error('      ❌ [REPORT-SERVICE] Error grafico prioridades:', err.message || err);
    }

    if (!doughnutBuffer && !barBuffer) {
      console.log('      ⚠️ [REPORT-SERVICE] _addTaskCharts - Ningun grafico generado, saliendo');
      return;
    }

    // FASE 3: insertar en el PDF (síncrono a partir de aquí)
    // minContentBelow = 250: si no hay espacio para el título + al menos
    // un gráfico (220pt), el título salta a la página siguiente.
    this._addSectionTitle(doc, 'Analisis de Tareas', 250);

    if (doughnutBuffer) {
      this._checkPageBreak(doc, 240);
      // doc.image(Buffer, x, y, opts) — insertar PNG desde memoria
      doc.image(doughnutBuffer, MARGIN + 25, doc.y, { width: CONTENT_WIDTH - 50, height: 220 });
      doc.y += 230;  // Avanzar cursor manualmente
    }

    if (barBuffer) {
      this._checkPageBreak(doc, 240);
      doc.image(barBuffer, MARGIN + 25, doc.y, { width: CONTENT_WIDTH - 50, height: 220 });
      doc.y += 230;
    }

    doc.moveDown(0.5);
  },

  async _addMeasurementCharts(doc, mediciones) {
    console.log('      📊 [REPORT-SERVICE] _addMeasurementCharts - Inicio - mediciones:', mediciones.length);
    const grupos = this._groupBy(mediciones, 'tipo_medicion');
    console.log('      📊 [REPORT-SERVICE] _addMeasurementCharts - Tipos de medicion:', Object.keys(grupos));

    // FASE 1: renderizar todos los buffers antes de tocar el PDF
    const chartBuffers = [];
    for (const tipo of Object.keys(grupos)) {
      const medicionesGrupo = grupos[tipo];
      if (medicionesGrupo.length < 2) {
        console.log(`      ⚠️ [REPORT-SERVICE] _addMeasurementCharts - ${tipo}: solo ${medicionesGrupo.length} punto(s), omitiendo grafico`);
        continue;
      }

      try {
        console.log(`      📊 [REPORT-SERVICE] _addMeasurementCharts - Renderizando linea para: ${tipo} (${medicionesGrupo.length} puntos)`);
        const chartBuffer = await this._renderLineChart(medicionesGrupo, tipo);
        if (chartBuffer) {
          chartBuffers.push({ tipo, buffer: chartBuffer });
          console.log(`      ✅ [REPORT-SERVICE] _addMeasurementCharts - Linea ${tipo} renderizado:`, (chartBuffer.length / 1024).toFixed(2), 'KB');
        }
      } catch (err) {
        console.error(`      ❌ [REPORT-SERVICE] Error grafico ${tipo}:`, err.message || err);
      }
    }

    if (chartBuffers.length === 0) {
      console.log('      ⚠️ [REPORT-SERVICE] _addMeasurementCharts - Ningun grafico generado, saliendo');
      return;
    }

    // FASE 2: insertar en el PDF
    // minContentBelow = 250: idem Analisis de Tareas
    this._addSectionTitle(doc, 'Graficos de Mediciones', 250);

    for (const { tipo, buffer } of chartBuffers) {
      this._checkPageBreak(doc, 250);

      doc.fontSize(10).fillColor(COLORS.secondary).font('Helvetica-Bold')
        .text(`${tipo}`, MARGIN);
      doc.moveDown(0.3);

      doc.image(buffer, MARGIN, doc.y, { width: CONTENT_WIDTH, height: 220 });
      doc.y += 230;
      doc.moveDown(0.5);
    }
  },

  // ─────────────────────────────────────────────────────────
  // RENDER CHARTS — configuraciones de Chart.js
  //
  // CHARTJS-NODE-CANVAS — cómo funciona:
  //
  // renderToBuffer(configuration) recibe el mismo objeto de
  // configuración que usarías en el browser con new Chart(ctx, config).
  // Internamente crea un canvas de Node.js, renderiza el gráfico,
  // y devuelve un Buffer con los bytes PNG.
  //
  // OPCIONES IMPORTANTES para PDFs:
  //   responsive: false — SIEMPRE necesario en Node.js.
  //     En el browser Chart.js observa el tamaño del contenedor.
  //     En Node.js no hay DOM, así que responsive: true rompe todo.
  //
  //   animation: false — opcional pero recomendado.
  //     Las animaciones no tienen sentido en server-side rendering.
  //
  //   devicePixelRatio: 1 — para PDFs no necesitás @2x.
  //
  // TIPOS DE GRÁFICO:
  //   'doughnut' — circular con agujero. Ideal para distribuciones.
  //   'bar'      — barras. Con indexAxis: 'y' son barras horizontales.
  //   'line'     — línea temporal. Ideal para mediciones a lo largo del tiempo.
  //   'pie'      — circular sin agujero.
  //   'radar'    — comparación de múltiples dimensiones.
  // ─────────────────────────────────────────────────────────
  async _renderDoughnutChart(labels, data, colors, title) {
    const configuration = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: false,  // CRÍTICO en Node.js
        plugins: {
          title: {
            display: true,
            text: title,
            font: { size: 14, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'right',
            labels: { font: { size: 11 }, padding: 12 }
          }
        }
      }
    };
    return await chartJSNodeCanvas.renderToBuffer(configuration);
  },

  async _renderBarChart(labels, data, colors, title) {
    const configuration = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6
        }]
      },
      options: {
        indexAxis: 'y',    // Barras horizontales
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: { size: 14, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            title: { display: true, text: 'Cantidad' }
          }
        }
      }
    };
    return await chartJSNodeCanvas.renderToBuffer(configuration);
  },

  async _renderLineChart(mediciones, tipo) {
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
          tension: 0.3   // 0 = línea recta, 1 = muy curva
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
          legend: { display: true, position: 'bottom' }
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

  // ─────────────────────────────────────────────────────────
  // _addFooter — EL FIX PRINCIPAL
  //
  // PROBLEMA ORIGINAL:
  //   footerY = PAGE_HEIGHT - MARGIN + 10 = 841.89 - 50 + 10 = 801.89
  //   Escribir texto en Y = 801.89 supera SAFE_BOTTOM (791.89).
  //   PDFKit detecta "no hay espacio" y crea una página nueva.
  //   Como el loop itera 3 veces (3 páginas), crea 3 páginas extra.
  //   Resultado: el PDF tenía el doble de páginas, todas en blanco.
  //
  // SOLUCIÓN:
  //   footerY = SAFE_BOTTOM - 20 = 771.89
  //   Esto garantiza que el texto queda dentro del área válida.
  //
  // PATRÓN bufferPages + switchToPage:
  //   1. bufferPages: true retiene todas las páginas en memoria.
  //   2. doc.bufferedPageRange() devuelve { start, count }.
  //   3. doc.switchToPage(n) activa la página n (0-indexed).
  //   4. Escribimos el footer en esa página.
  //   5. Al final volvemos a la última página con switchToPage(count-1).
  //   6. doc.end() hace flush de todas las páginas.
  // ─────────────────────────────────────────────────────────
  _addFooter(doc, reportData) {
    const { count } = doc.bufferedPageRange();
    const totalPages = count;
    console.log('   🔻 [REPORT-SERVICE] _addFooter - Inicio - Total paginas:', totalPages);
    console.log('   🔻 [REPORT-SERVICE] _addFooter - FOOTER_Y:', FOOTER_Y, '- SAFE_BOTTOM:', SAFE_BOTTOM);

    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);

      // Línea separadora — dentro del área válida
      doc.moveTo(MARGIN, FOOTER_Y)
        .lineTo(PAGE_WIDTH - MARGIN, FOOTER_Y)
        .strokeColor(COLORS.lightGray)
        .lineWidth(0.5)
        .stroke();

      // Texto del footer — en coordenadas absolutas dentro del área válida
      doc.fontSize(7)
        .fillColor(COLORS.gray)
        .font('Helvetica')
        .text(
          `${reportData.administrador.empresa} | Pagina ${i + 1} de ${totalPages}`,
          MARGIN,
          FOOTER_Y + 5,
          {
            align: 'center',
            width: CONTENT_WIDTH,
            lineBreak: false  // Evita saltos de línea que podrían desbordarse
          }
        );
    }

    // ✅ Volver a la última página para que doc.end() cierre correctamente
    doc.switchToPage(totalPages - 1);
    console.log('   🔻 [REPORT-SERVICE] _addFooter - Fin - Volvio a pagina:', totalPages - 1);
  },

  // ─────────────────────────────────────────────────────────
  // UTILIDADES
  // ─────────────────────────────────────────────────────────

  // minContentBelow: espacio mínimo que debe haber para el contenido
  // que sigue al título. Si no entra el título + ese mínimo, salta
  // de página antes de dibujar el título (evita títulos huérfanos).
  _addSectionTitle(doc, title, minContentBelow = 60) {
    this._checkPageBreak(doc, 40 + minContentBelow);

    const y = doc.y;
    doc.rect(MARGIN, y, 5, 20).fill(COLORS.primary);
    doc.fontSize(14).fillColor(COLORS.dark).font('Helvetica-Bold')
      .text(title, MARGIN + 14, y + 2);

    doc.moveDown(0.3);
    doc.moveTo(MARGIN, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y)
      .strokeColor(COLORS.lightGray).lineWidth(0.5).stroke();
    doc.moveDown(0.6);
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
    console.log('   🖼️ [REPORT-SERVICE] _embedImage - URL:', imageUrl || 'null');
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
      console.log('   🖼️ [REPORT-SERVICE] _embedImage - No es URL valida de uploads, omitiendo');
      return false;
    }

    const relativePath = imageUrl.replace('/uploads/', '');
    const filePath = path.join(UPLOADS_DIR, relativePath);
    console.log('   🖼️ [REPORT-SERVICE] _embedImage - Ruta archivo:', filePath);

    if (!fs.existsSync(filePath)) {
      console.log('   ⚠️ [REPORT-SERVICE] _embedImage - Archivo no encontrado:', filePath);
      return false;
    }

    try {
      const { width = 120, height = 80 } = options;
      console.log('   🖼️ [REPORT-SERVICE] _embedImage - Insertando imagen:', width, 'x', height, 'en doc.y:', doc.y.toFixed(2));
      doc.image(filePath, MARGIN, doc.y, { width, height });
      doc.y += height + 5;  // Avanzar cursor manualmente
      console.log('   ✅ [REPORT-SERVICE] _embedImage - Imagen insertada - doc.y:', doc.y.toFixed(2));
      return true;
    } catch (err) {
      console.error('   ❌ [REPORT-SERVICE] _embedImage - Error:', err.message || err);
      return false;
    }
  },

  // ─────────────────────────────────────────────────────────
  // _checkPageBreak — control de salto de página
  //
  // Se llama ANTES de dibujar cualquier elemento que tenga
  // altura conocida. Si el espacio restante en la página es
  // menor que neededSpace, agrega una página nueva.
  //
  // Fórmula: doc.y + neededSpace > SAFE_BOTTOM - reserva_footer
  //   SAFE_BOTTOM = 791.89
  //   reserva_footer = 40 (espacio para la línea y texto del footer)
  //   Límite efectivo = 751.89
  // ─────────────────────────────────────────────────────────
  _checkPageBreak(doc, neededSpace) {
    const footerReserve = 40;
    const limit = SAFE_BOTTOM - footerReserve;
    if (doc.y + neededSpace > limit) {
      console.log('   📃 [REPORT-SERVICE] _checkPageBreak - SALTO DE PAGINA - doc.y:', doc.y.toFixed(2), '+ needed:', neededSpace, '> limit:', limit.toFixed(2));
      doc.addPage();
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
      planificado: 'Planificado', sembrado: 'Sembrado',
      en_crecimiento: 'En Crecimiento', maduro: 'Maduro',
      cosechado: 'Cosechado', cancelado: 'Cancelado',
      pendiente: 'Pendiente', en_proceso: 'En Proceso',
      completada: 'Completada'
    };
    return labels[estado] || estado || '-';
  },

  _getEstadoColor(estado) {
    const colors = {
      planificado: '#9E9E9E', sembrado: '#8BC34A',
      en_crecimiento: '#4CAF50', maduro: '#FF9800',
      cosechado: '#2E7D32', cancelado: '#F44336',
      pendiente: '#FFA726', en_proceso: '#42A5F5',
      completada: '#66BB6A'
    };
    return colors[estado] || COLORS.gray;
  },

  _formatPrioridad(prioridad) {
    const labels = { baja: 'Baja', media: 'Media', alta: 'Alta', urgente: 'Urgente' };
    return labels[prioridad] || prioridad || '-';
  },

  _formatRol(rol) {
    const labels = { administrador: 'Administrador', supervisor: 'Supervisor', trabajador: 'Trabajador' };
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
  }
};

export default reportService;