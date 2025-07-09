import PDFDocument from 'pdfkit';
import fs from 'fs';

export async function generatePrescriptionPDF(prescription, doctor, patient, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Medical Prescription', { align: 'center' });
    doc.moveDown();

    // Doctor Info
    doc.fontSize(12).text(`Doctor: ${doctor.name}`);
    doc.text(`Specialization: ${doctor.specialization || ''}`);
    doc.text(`Qualifications: ${doctor.qualifications || ''}`);
    doc.text(`Email: ${doctor.email}`);
    doc.moveDown();

    // Patient Info
    doc.fontSize(12).text(`Patient: ${patient.name}`);
    doc.text(`Email: ${patient.email}`);
    if (patient.dob) doc.text(`DOB: ${new Date(patient.dob).toLocaleDateString()}`);
    doc.moveDown();

    // Prescription Info
    doc.fontSize(14).text('Prescription Details:', { underline: true });
    doc.moveDown(0.5);
    if (prescription.notes) {
      doc.fontSize(12).text(`Notes: ${prescription.notes}`);
      doc.moveDown(0.5);
    }
    if (Array.isArray(prescription.medicines) && prescription.medicines.length > 0) {
      doc.fontSize(12).text('Medicines:');
      prescription.medicines.forEach((med, idx) => {
        doc.text(`${idx + 1}. ${med.name} - ${med.dosage} - ${med.instructions}`);
      });
      doc.moveDown(0.5);
    }
    doc.text(`Date: ${new Date(prescription.date).toLocaleDateString()}`);
    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', (err) => reject(err));
  });
} 