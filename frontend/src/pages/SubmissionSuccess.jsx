import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RegistrationForm from "../components/RegistrationForm";
import { useSelector } from "react-redux";

const SubmissionSuccess = ({ reference }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { caseReference, incidents } = location.state || {}; // Retrieve the case reference passed via state
    if (!caseReference || !incidents) {
        return <p>Invalid navigation. Please go back to the form.</p>;
    }
    //const {user} = useAuthContext();
    const user = useSelector((state) => state.user.user);

    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    
    // Use useEffect for navigation when userId is present
  useEffect(() => {
    if (user?.userId) {
      navigate(`/user-dashboard`);
    }
  }, [user, navigate]);

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Incident Submitted</h1>
        <p>Your reference number is: <strong>{caseReference}</strong></p>

        <div className="mt-6">
            {!user && (        
            <div className="flex gap-4 *items-center justify-center">
                <button
                //disabled={userId ? true : false}
                onClick={() => setShowRegistrationForm(true)}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
                Register for an Account
            </button>
            <button
                onClick={() => navigate("/", { replace: true })} // Redirect if no caseReference
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
                Back To Home
            </button>
            </div>
            )}            
        </div>

        {showRegistrationForm && (
            <RegistrationForm incidents={incidents} />
        )}
    </div>
);
};

export default SubmissionSuccess;
