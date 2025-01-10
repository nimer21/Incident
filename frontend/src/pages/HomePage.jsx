import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Login, AddCircle } from '@mui/icons-material';


const HomePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const userId = sessionStorage.getItem("userId");

        if (userId) {
            // Redirect to category selection if user is logged in
            // navigate('/categor-selection');
            navigate(`/user-dashboard/${JSON.parse(userId)}`);
        }
    }, [navigate]); // Dependency array includes navigate to avoid warnings


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-green-100">
    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-8 text-center">
        Welcome to <span className="text-blue-600">Incident Reporting System</span>
    </h1>
    <p className="text-center text-gray-600 text-lg md:text-xl mb-10 px-6">
        Report incidents efficiently and stay connected with streamlined solutions.
    </p>
    <div className="flex flex-col md:flex-row gap-6">
        <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transform hover:scale-105 transition duration-300"
        >
            <span className="material-icons-outlined text-lg"><Login/></span>
            Login
        </button>
        <button
            onClick={() => navigate("/categor-selection")}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 transform hover:scale-105 transition duration-300"
        >
            <span className="material-icons-outlined text-lg"><AddCircle/></span>
            Submit Report
        </button>
    </div>
</div>
    );
};

export default HomePage;
