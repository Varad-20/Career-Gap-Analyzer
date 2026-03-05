const fs = require('fs');
const path = require('path');

/**
 * Extract text from PDF using pdf-parse
 * Falls back gracefully if extraction fails
 */
const extractTextFromPDF = async (filePath) => {
    try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return { success: true, text: data.text };
    } catch (error) {
        console.error('PDF extraction error:', error.message);
        return { success: false, text: '' };
    }
};

/**
 * Delete a file from disk
 */
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (error) {
        console.error('File delete error:', error.message);
    }
};

module.exports = { extractTextFromPDF, deleteFile };
