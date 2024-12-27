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
    //origin: "https://incident-ckmb455a3-nimer21s-projects.vercel.app",
    origin: process.env.FRONTEND_URL,
    //origin: '*', // Allow all origins (not recommended for production)
    credentials: true, // Allow credentials // Allow cookies to be sent with the request
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.options('*', cors(corsOptions)); // Allow preflight requests for all routes

// Use CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// Enable Cross-Origin Resource Sharing (CORS)
//app.use(cors());

// Preflight handling
//app.options('*', cors(corsOptions)); // Enable preflight across all routes
app.use(cookieParser()); // Add this line to parse cookies

app.use(bodyParser.json());
// Define your routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/users', userRoutes);


app.get('/health', (req, res) => {
    res.status(200).send('Backend is healthy');
  });
  
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});