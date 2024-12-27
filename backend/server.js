const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const incidentRoutes = require('./routes/incidentRoutes');
const userRoutes = require('./routes/userRoutes');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();
connectDB();

// CORS options
var corsOptions = {
    //origin: "http://localhost:5173",
    origin: "https://incident-ckmb455a3-nimer21s-projects.vercel.app",
    //origin: process.env.FRONTEND_URL,
    //origin: '*', // Allow all origins (not recommended for production)
    credentials: true, // Allow credentials
};
// Use CORS middleware
app.use(cors(corsOptions));

// Enable Cross-Origin Resource Sharing (CORS)
//app.use(cors());

// Preflight handling
//app.options('*', cors(corsOptions)); // Enable preflight across all routes
app.use(cookieParser()); // Add this line to parse cookies

app.use(bodyParser.json());
app.use('/api/incidents', incidentRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});