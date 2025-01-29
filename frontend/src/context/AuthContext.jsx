import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "../redux/slices/userSlice";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state) => state.user.user);
  const [authUser, setAuthUser] = useState(null);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Hook to dispatch actions

  // Check token expiration and remove it if session ended
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
  let sessionTimer;

  const startSessionTimer = () => {
    //console.log("Starting session timer...");
    sessionTimer = setTimeout(() => {
      //toast.success("Session expired, logging out...📤"); //
      //logout();
      console.log("logouting due to session timer...sessionTimer= ", sessionTimer);
    }, sessionTimeout);
  };

  useEffect(() => {
    // Simulate checking session/token (can be replaced with actual API logic)
    setTimeout(() => {
      setIsLoading(false);
    }, 500); // Simulated delay
  }, [user]);

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
      // Extract user data from response | Fetch user data after login
      const { message, user } = response.data;
      const userData = { userId: user._id, role: user.role };
      setAuthUser(userData); // Set user details after login
      dispatch(setUser(userData)); // Store user in Redux // Update Redux store
      // Store user data in session storage for persistent login | Store user object as a string in sessionStorage
      sessionStorage.setItem("authUser", JSON.stringify(userData));
      toast.success(message);
      startSessionTimer();
      // Navigate based on role
      // if (user.role === "super_admin") {
      //   navigate("/admin-dashboard");
      // } else if (user.role === "user") {
      //   navigate(`/user-dashboard`);
      // } else {
      //   navigate("/"); // Default or error handling
      // }
    } catch (error) {
      toast.error(error.response?.data?.error || error?.message || "Unknown error"); //
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
      dispatch(clearUser()); // Clear Redux store
      setAuthUser(null); // Clear user details on logout
      sessionStorage.removeItem("authUser");
      //navigate("/"); // Navigate after clearing user
      navigate("/login", { replace: true });
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
      toast.success(responseLogout.data.message);
    } catch (error) {
      console.error("Logout error:", error.response.data.message);
      toast.error(error.response.data.message);
      navigate("/"); // Navigate in case of error as well
      if (error.response.status === 401) {
      sessionStorage.removeItem("authUser");
      sessionStorage.clear();
      navigate("/login");        
      }
    }
  };

  useEffect(() => {
   
    if (!authUser) {      
      // Retrieve the user object from sessionStorage
        const storedUser = JSON.parse(sessionStorage.getItem("authUser"));

      if (storedUser) {
        //console.log("storedUser: ", storedUser); // Access user properties
        setAuthUser(storedUser);
      } else {
        //console.log('No user found in sessionStorage');
      }
    }
  }, []);

  /**Suggested Approach for Automatic Logout
   * To enhance user experience and security, implement a token expiration check on the frontend:
   * const decodeToken = (token) => {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.exp * 1000; // Convert to milliseconds
};
const token = sessionStorage.getItem("authToken");
const tokenExpiration = decodeToken(token);

// Check token expiration
const isExpired = Date.now() > tokenExpiration;
if (isExpired) {
  alert("Your session has expired. Logging out.");
  logout(); // Trigger logout logic
}

   */

  return (
    <AuthContext.Provider value={{ user, isLoading, errors, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuthContext() {
  return useContext(AuthContext);
}
