import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import CategorySelection from "./components/CategorySelection";
import UserDashboard from "./pages/UserDashboard";
import IncidentReportForm from "./components/IncidentReportForm";
import SubmissionSuccess from "./pages/SubmissionSuccess";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoutes from "./auth/ProtectedRoutes";
import Unauthorized from "./pages/Unauthorized";
import useAuthContext, { AuthProvider } from "./context/AuthContext";
import { useSelector } from "react-redux";
import CaseManagerDashboard from "./pages/CaseManagerDashboard";

const App = () => {
  const user = useSelector((state) => state.user.user);
  const PrivateRoute = ({ children }) => {
    //const { user } = useAuthContext();
    
    //console.log("user useSelector", user);
    // Redirect authenticated users based on their role
    if (user) {
      return user?.role === "super_admin" ? (
          <Navigate to="/admin-dashboard" />
      ) : 
      user?.role === "user" ? (
        <Navigate to="/user-dashboard" />
      ): (
        <Navigate to="/casemanager-dashboard" />
      );
  }
  // Render the login component if unauthenticated
  return children;
};

  return (
    <div>
      <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar:false
      closeOnClick:true
      pauseOnHover:true
      theme="colored"
      transition:Zoom
      draggable={false}      
      />
    {/* <Router> */}
    <AuthProvider> {/* AuthProvider inside Redux Provider */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<PrivateRoute><LoginPage /></PrivateRoute>} />
        <Route path="/categor-selection" element={<CategorySelection />} />
        <Route path="/incident-form" element={<IncidentReportForm />} />
        <Route path="/submission-success" element={<SubmissionSuccess />} />
        <Route path="/user-dashboard" element={
            <ProtectedRoutes allowedRoles={["user"]}>
                <UserDashboard />
            </ProtectedRoutes>
        } />
        <Route path="/casemanager-dashboard" element={<CaseManagerDashboard user={user} />} />
        <Route path="/admin-dashboard" element={
            <ProtectedRoutes allowedRoles={["super_admin"]}>
                <AdminDashboard />
            </ProtectedRoutes>
        } />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthProvider>
    {/* </Router> */}
    </div>
  );
};

export default App;
