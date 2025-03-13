const express = require('express');
const { getReport, createReport, updateReport } = require('../controllers/reportController');
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");


// Use :reportType as a dynamic route parameter
router.post('/create-report', authenticateToken(["super_admin","asset_safeguarding", "child_safeguarding", "youth_adult", "data_breach"]), createReport);
router.get('/:incidentId/:reportType', authenticateToken(["super_admin"]), getReport);
router.put('/:reportId', updateReport);



module.exports = router;