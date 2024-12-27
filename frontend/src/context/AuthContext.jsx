import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "../redux/slices/userSlice";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  //const [user, setUser] = useState(null);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Hook to dispatch actions

  // Check token expiration and remove it if session ended
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
  let sessionTimer;

  const startSessionTimer = () => {
    console.log("Starting session timer...");
    sessionTimer = setTimeout(() => {
      console.log("Session expired, logging out...");
      toast.success("Session expired, logging out...📤"); //
      logout();
      //navigate("/");
      /**
       * Check Navigation Logic:
Ensure that navigation happens after the logout process is complete.
You may want to navigate only after confirming that the logout was successful.
       */
    }, sessionTimeout);
  };

  useEffect(() => {
    const resetSessionTimer = () => {
      if (sessionTimer) clearTimeout(sessionTimer);
      startSessionTimer(); // Restart timer on activity
    };

    window.addEventListener("mousemove", resetSessionTimer);
    window.addEventListener("keydown", resetSessionTimer);

    return () => {
      window.removeEventListener("mousemove", resetSessionTimer);
      window.removeEventListener("keydown", resetSessionTimer);
    };
  }, []);

  /*
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/users/auth/check", {
          withCredentials: true, // Include cookies
        });
        //setUser(response.data.user); // Set user details from the server
        dispatch(setUser(response.data.user._id)); // Store user in Redux
      } catch (error) {
        console.error("Error fetching user data:", error.response?.data || error.message);
        toast.error(error.response?.data.message || error.message);
        //setUser(null); // Clear user state if not authenticated
        dispatch(clearUser()); // Clear Redux store
      }
    };
  
    // const authToken = document.cookie.split("; ").find(row => row.startsWith("authToken="));
    // if (authToken) {
    //   fetchUserData(); // Fetch user data if token exists
    // }
    //if (user) {
      fetchUserData(); // Fetch user data if token exists
    //}
  }, [dispatch]);//dispatch
  */

  const login = async ({ ...data }) => {
    setErrors([]);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        data,
        {
          withCredentials: true, // Include cookies in requests
        }
      );
      // Extract user data from response
      const { message, user } = response.data;
      // Fetch user data after login
      //setUser(user); // Set user details after login
      //dispatch(setUser(user)); // Update Redux store
      const userData = { userId: user._id, role: user.role };
      dispatch(setUser(userData)); // Store user in Redux
      //dispatch(setUser(response.data.user._id)); // Store user in Redux
      toast.success(message);
      startSessionTimer();
      // Navigate based on role
      if (user.role === "super_admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "user") {
        navigate(`/user-dashboard`);
      } else {
        navigate("/"); // Default or error handling
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Unknown error"); //
      //setErrors(error.response?.data?.error+ ": " + error.response.status);
      console.error(error);

      if (error.message == "Network Error") {
        setErrors(["خطأ في الاتصال بالسيرفر"]);
        toast.error("تأكد من الاتصال بالإنترنت"); //
      }
    }
  };

  const register = async ({ ...data }) => {
    setErrors([]);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        data
      );
      toast.success(response.data.message);
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.error);
      setErrors(error.response.data.error + ": " + error.response.status);
    }
  };

  const logout = async () => {
    try {
      //const token = sessionStorage.getItem("token");

      const responseLogout = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/logout`,
        {}, // No request body
        {
          withCredentials: true, // Include cookies in requests
          // headers: {
          //   "Content-Type": "application/json", // Optional if the server requires it
          //   // Authorization: `Bearer ${token}` // Include if your server still validates tokens for logout
          // },
        }
      );
      //console.log('Logout successful:', responseLogout.data.message);
      toast.success(responseLogout.data.message);
      //setUser(null); // Clear user details on logout
      dispatch(clearUser()); // Clear Redux store
      navigate("/"); // Navigate after clearing user
    } catch (error) {
      console.error("Logout error:", error.response.data.message);
      toast.error(error.response.data.message);
      navigate("/"); // Navigate in case of error as well
    }
  };

  return (
    <AuthContext.Provider value={{ errors, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuthContext() {
  return useContext(AuthContext);
}
