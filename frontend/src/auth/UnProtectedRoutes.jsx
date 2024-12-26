import React, { Children } from 'react'
import { Navigate } from 'react-router-dom';

export default function UnProtectedRoutes({ children}) {
    //const navigate = useNavigate();
    const token = sessionStorage.getItem("authTokenJWT");
    if (token) {
      //navigate('/Login');
      return <Navigate to='/' replace/>
    }
  return children;
}







