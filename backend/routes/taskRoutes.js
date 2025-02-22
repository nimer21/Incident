const express = require('express');
const { fetchAssignedTasks, updateTaskStatus } = require('../controllers/incidentController');
const authenticateToken = require("../middleware/authMiddleware");
const { fetchAllTasks } = require('../controllers/taskController');
const router = express.Router();

router.get('/assigned', authenticateToken(["data_breach", "super_admin", "asset_safeguarding", "child_safeguarding", "youth_adult"]), fetchAssignedTasks); // Get incidents for a user
router.patch('/:taskId', updateTaskStatus); // Get incidents for a user
router.get('/all', fetchAllTasks);

module.exports = router;