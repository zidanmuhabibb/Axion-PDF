const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for memory storage (for processing PDFs in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint to merge multiple PDFs
app.post('/api/merge', upload.array('pdfFiles'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Tidak ada file yang diunggah.');
        }

        // Create a new PDFDocument
        const mergedPdf = await PDFDocument.create();

        // Loop through all uploaded files
        for (const file of req.files) {
            const pdfDoc = await PDFDocument.load(file.buffer);
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await mergedPdf.save();

        // Send the generated PDF back to the client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="hasil_gabungan.pdf"');
        res.setHeader('Content-Length', pdfBytes.length);
        res.end(pdfBytes);

    } catch (error) {
        console.error('Error merging PDFs:', error);
        res.status(500).send('Terjadi kesalahan saat menggabungkan PDF.');
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
    console.log(`Buka http://localhost:${port} di browser HP atau Komputer Anda.`);
});
