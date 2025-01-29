import React, { useEffect, useState } from 'react'
import {Navigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

export default function ProtectedRoutes({ children, allowedRoles }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  //const { user } = useAuthContext();
  const user = useSelector((state) => state.user.user);
  //const authUser = JSON.parse(`${sessionStorage.getItem("authUser")}`);  


  useEffect(() => {
    const checkAuth = async () => {
        try {
            //console.log("allowedRoles: ", allowedRoles);
            //console.log("user.user:", user.user);
            // const response = await axios.get("http://localhost:5005/api/users/auth/check", {
            //     withCredentials: true, // Send cookies with the request
            // });
            // const user = response.data.user;
            
            // Check if user is null before accessing role | Ensure user state is available
            if (user.user && allowedRoles.includes(user?.user?.role)) {
            // if (authUser?.userId && allowedRoles.includes(authUser?.role)) {
            //console.log("User userId:", authUser.role);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            toast.error(error.message);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false); // Set loading to false when check completes
          }
    };

    checkAuth();
// }, [allowedRoles, authUser]); // Add user to dependencies
}, [allowedRoles, user]); // Add user to dependencies
 // Show a loading indicator while authentication is being checked
 if (isLoading) {
    return <div>Loading...!!! Protected</div>;
  }

// Redirect to login if not authenticated
if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
}
// Render children if authenticated
return children;
}
