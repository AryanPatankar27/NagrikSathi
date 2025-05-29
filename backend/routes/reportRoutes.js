const express = require('express');
const upload=require('../services/upload');
const router = express.Router();
const {
  getAllReports,
  getReportById,
  updateReportStatus,
  submitExtensionReport,
  submitManualReport,
  submitManualReportWithFile,
  deleteReport,
  getReportsStats,
} = require('../controllers/reportController');

// GET routes
router.get('/all', getAllReports);
router.get('/stats', getReportsStats);
router.get('/:id', getReportById);

// POST routes
router.post('/extension', submitExtensionReport);
router.post('/submit', submitManualReport);
router.post('/submit-upload',upload.single('screenshot'), submitManualReportWithFile);

// PUT routes
router.put('/status/:id', updateReportStatus);

// DELETE routes
router.delete('/:id', deleteReport);

module.exports = router;