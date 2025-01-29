const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const incidentRoutes = require('./routes/incidentRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reportRoutes = require('./routes/reportRoutes');
const cookieParser = require('cookie-parser');
const path = require("path");

require('dotenv').config();

const app = express();
connectDB();

// CORS options
var corsOptions = {
    origin: process.env.FRONTEND_URL,
    //origin: '*', // Allow all origins (not recommended for production)
    credentials: true, // Allow credentials // Allow cookies to be sent with the request
    //methods: ['GET', 'POST',  'PUT', 'DELETE', 'OPTIONS'],
    //allowedHeaders: ['Content-Type', 'Authorization'],
};
//app.options('*', cors(corsOptions)); // Allow preflight requests for all routes

// Use CORS middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable Cross-Origin Resource Sharing (CORS)
//app.use(cors());

// Preflight handling
//app.options('*', cors(corsOptions)); // Enable preflight across all routes
app.use(cookieParser()); // Add this line to parse cookies

//app.use(bodyParser.json());
// Define your routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

// Serve static files from 'backend/uploads' folder
//app.use("/backend/uploads", express.static("backend/uploads"));
//If you are running the server from a different location, use an absolute path for better reliability:
//app.use("/backend/uploads", express.static("/absolute/path/to/Incident/backend/uploads"));

// Serve static files from the uploads folder
app.use("/backend/uploads", express.static(path.join(__dirname, "/uploads")));

app.get("/", (req, res) => {
    res.send("Incident Management API is running.");
  });
  
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    //console.log("Serving static files from:", path.join(__dirname, "/uploads"));
});

// Export the app (important for Vercel)
module.exports = app;