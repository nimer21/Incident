// axiosInstance.jsx
import axios from 'axios';
// Use import.meta.env for Vite or process.env for Create React App
const apiUrl = import.meta.env.VITE_API_URL; // For Vite
// const apiUrl = process.env.REACT_APP_API_URL; // For Create React App

const axiosInstance = axios.create({
    //baseURL: "http://localhost:5005", // Adjust base URL as necessary
    baseURL: apiUrl, // Adjust base URL as necessary
    timeout: 1000,
    withCredentials: true, // Ensure cookies are sent with requests
});

export default axiosInstance;