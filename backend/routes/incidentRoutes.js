const express = require('express');
const router = express.Router();
const { reportIncident, getIncidents, getIncidentById, updateIncidentSeverity, addCommentsIncident, fileUploadIncident, getIncidentsByRole, assignIncidentTasks, updateEscalationStatus } = require('../controllers/incidentController');
const { registerUser } = require('../controllers/incidentController');
const upload = require('../middleware/fileUpload');
const authenticateToken = require("../middleware/authMiddleware");

router.post('/report', upload.single('fileAttachment'), reportIncident);
router.get("/get-incidents", authenticateToken(["super_admin","asset_safeguarding", "child_safeguarding", "youth_adult", "data_breach"]), getIncidents);
router.get("/get-incident/:id",authenticateToken(["super_admin","user", "data_breach"]), getIncidentById);
//router.get("/get-incidents-role-based", authenticateToken(["super_admin","asset_safeguarding", "child_safeguarding", "youth_adult", "data_breach"]), getIncidentsByRole);
router.put("/:id/severity", authenticateToken(["super_admin"]), updateIncidentSeverity);
router.post("/:id/comments",authenticateToken(["super_admin","user"]), addCommentsIncident);
router.post("/upload",upload.single("file"),authenticateToken(["super_admin","user"]), fileUploadIncident);

router.post("/:incidentId/tasks", authenticateToken(["super_admin"]), assignIncidentTasks);
router.patch("/:incidentId/escalate", updateEscalationStatus);

router.get("/get-incident/:id",authenticateToken(["super_admin","user", "data_breach"]), getIncidentById);

module.exports = router;