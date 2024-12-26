import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-6">Welcome to Incident Reporting System</h1>
            <div className="flex gap-4">
                <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                >
                    Login
                </button>
                <button
                    onClick={() => navigate("/categor-selection")}
                    className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
                >
                    Submit Report
                </button>
            </div>
        </div>
    );
};

export default HomePage;
