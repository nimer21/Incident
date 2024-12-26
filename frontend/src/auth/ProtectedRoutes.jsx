import React, { useEffect, useState } from 'react'
import {Navigate} from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthContext from '../context/AuthContext';
import { useSelector } from 'react-redux';

export default function ProtectedRoutes({ children, allowedRoles }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  //const { user } = useAuthContext();
  const user = useSelector((state) => state.user.user);


  useEffect(() => {
    const checkAuth = async () => {
        try {
            // const response = await axios.get("http://localhost:5005/api/users/auth/check", {
            //     withCredentials: true, // Send cookies with the request
            // });
            // const user = response.data.user;
            
            // Check if user is null before accessing role
            if (user && allowedRoles.includes(user.role)) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Authentication check failed:", error);
            toast.error(error.message);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false); // Set loading to false when check completes
          }
    };

    checkAuth();
}, [allowedRoles, user]); // Add user to dependencies
 // Show a loading indicator while authentication is being checked
 if (isLoading) {
    return <div>Loading...!!!</div>;
  }

// Redirect to login if not authenticated
if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
}
// Render children if authenticated
return children;
}
