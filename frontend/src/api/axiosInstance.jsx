// axiosInstance.jsx
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { clearUser } from '../redux/slices/userSlice';
import store from '../redux/store'; // Import your Redux store
// Use import.meta.env for Vite or process.env for Create React App
const apiUrl = import.meta.env.VITE_API_URL; // For Vite
// const apiUrl = process.env.REACT_APP_API_URL; // For Create React App

const axiosInstance = axios.create({
    //baseURL: "http://localhost:5005", // Adjust base URL as necessary
    baseURL: apiUrl, // Adjust base URL as necessary
    //timeout: 1000,
    withCredentials: true, // Ensure cookies are sent with requests
});

axios.interceptors.request.use((config) => {
    const token = document.cookie.split("; ").find((row) => row.startsWith("authToken="))?.split("=")[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        // Handle token expiry
        //toast.error("Session expired. Please login again.");
        //logout(); // Trigger logout logic
        sessionStorage.removeItem("authUser");
        sessionStorage.clear();
        //store.dispatch(clearUser());
        //useDispatch(clearUser());
        //window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
  

export default axiosInstance;