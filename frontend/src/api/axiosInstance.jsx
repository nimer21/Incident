const axiosInstance = axios.create({
    //baseURL: "http://localhost:5005", // Adjust base URL as necessary
    baseURL: process.env.REACT_APP_API_URL, // Adjust base URL as necessary
    withCredentials: true, // Ensure cookies are sent with requests
});

export default axiosInstance;

/**
 * const response = await axiosInstance.post("/api/users/login", {
    username,
    password,
});

 */
