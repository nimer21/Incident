const express = require('express');
const router = express.Router();
const { getIncidentByUser, loginUser, logoutUser, registerUser, authenticate, createSystemUsers } = require('../controllers/incidentController');
const authenticateToken = require('../middleware/authMiddleware');


router.post('/register', registerUser);
// Get all incidents for a user
router.get('/:userId/incidents',authenticateToken(["user"]), getIncidentByUser); // Get incidents for a user
// POST: User Login
router.post("/login",loginUser);
router.post("/logout",logoutUser);
router.get("/auth/check",authenticateToken(["super_admin","user"]), authenticate);
// Route to create system users
router.post("/create-user",authenticateToken(["super_admin"]), createSystemUsers);

module.exports = router;