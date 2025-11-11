const PDFDocument = require('pdfkit');
const { PassThrough } = require('stream');


/**
 * 
 * @param {ReportData} reportData
 * @returns {PassThrough}
 */
function createPdfStream(reportData) {
    const doc = new PDFDocument();

    // Configurar márgenes
    doc.page.margins = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };

    // Crear un PassThrough stream para capturar los datos en memoria
    const passThroughStream = new PassThrough();

    // Pipe el PDF al PassThrough stream
    doc.pipe(passThroughStream);

    // Agregar contenido al PDF

    doc
        .font('Courier-Bold').text('id: ').font('Courier').text(reportData.id).text('\n')
        .font('Courier-Bold').text('#numero emergencia: ').font('Courier').text(reportData.emergencyId).text('\n')
        .font('Courier-Bold').text("médico:").font('Courier').text(reportData.medicName).text('\n')
        .font('Courier-Bold').text("paciente: ").font('Courier').text(reportData.patientName).text('\n')
        .font('Courier-Bold').text("fecha: ").font('Courier').text(reportData.date.toString()).text('\n')
        .font('Courier-Bold').text("ubicacion inicial: ").font('Courier').text(reportData.initialLocation).text('\n')
        .font('Courier-Bold').text('notas: ').font('Courier').text(reportData.notes).text('\n')

    // Finalizar el documento
    doc.end();

    return passThroughStream;
}



module.exports = {
    createPdfStream
}




/**
 * @typedef {Object} ReportData
 * @property {Number} id
 * @property {Number} emergencyId
 * @property {String} medicName
 * @property {String} patientName
 * @property {String} date
 * @property {String} initialLocation
 * @property {String} notes
 * 
 * 
 */

