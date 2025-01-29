import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RegistrationForm from "../components/RegistrationForm";
import { useSelector } from "react-redux";

const SubmissionSuccess = ({ reference }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { caseReference, incidents } = location.state || {}; // Retrieve the case reference passed via state
    if (!caseReference || !incidents) {
        // Get the current date and time
        const currentDate = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false, // Change to true for 12-hour format
            timeZone: 'Asia/Jerusalem' // Set to Jerusalem timezone
        };
        const formattedDate = currentDate.toLocaleString('en-IL', options); // Format date for Israeli locale
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Invalid Navigation!</strong>
                    <span className="block sm:inline"> Please go back to the form.</span>
                </div>
                <p className="mt-4 text-gray-600">
                    Current date: <strong>{formattedDate}</strong>
                </p>
                <div className="mt-6">
                    <Link to="/" className="text-blue-500 hover:underline mr-4">
                        Go to Home Page
                    </Link>
                    <Link to="/categor-selection" className="text-blue-500 hover:underline">
                        Select Category
                    </Link>
                </div>
            </div>
        );
    }
    //return null; // Render nothing if caseReference and incidents are valid
    
    //const {user} = useAuthContext();
    const user = useSelector((state) => state.user.user);

    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    
    // Use useEffect for navigation when userId is present
  useEffect(() => {
    if (user?.user?.userId) {
      navigate(`/user-dashboard`);
    }
  }, [user.user, navigate]);

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Incident Submitted</h1>
        <p>Your reference number is: <strong>{caseReference}</strong></p>

        <div className="mt-6">
            {!user?.user && (        
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
