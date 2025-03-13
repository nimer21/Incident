import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import Spinner from "../components/Spinner";
import InitialReportView from "../components/InitialReportView";
import CaseClosureReportView from "../components/CaseClosureReportView";
import FullAssessmentView from "../components/FullAssessmentView";
import { toast } from "react-toastify";
import ActionPlanReportView from "../components/ActionPlanReportView";

const ReportPage = () => {
  const { incidentId } = useParams(); // Extract the incident ID
  const [reportType, setReportType] = useState(""); // Track selected report type
  const [report, setReport] = useState(null); // Store fetched report data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate for navigation

  const renderReport = () => {
    if (!report) return <p className="text-gray-500 text-center">No report to display.</p>;
    
    switch (reportType) {
      case "InitialReport":
        return <InitialReportView report={report} reportType={reportType} incidentId={incidentId} />;
      case "FullAssessment":
        return <FullAssessmentView report={report} reportType={reportType} incidentId={incidentId} />;
      case "ActionPlan":
        return <ActionPlanReportView report={report} reportType={reportType} incidentId={incidentId} />;
      case "CaseClosure":
        return <CaseClosureReportView report={report} reportType={reportType} incidentId={incidentId} />;
      default:
        return null;
    }
  };

  const fetchReportData = async (incidentId, reportType) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/reports/${incidentId}/${reportType}`,
        { withCredentials: true }
      );
      //console.log("Fetched report data:", response.data); // Log the fetched report data for debugging purposes
      return response.data.report; // Assuming the backend response contains a `report` object
    } catch (error) {
      console.error("Error fetching report data:", error);
      if (error.response && error.response.status === 404) {
        console.error("Error fetching report data===>:", error);
        toast.error(error.response?.data?.message) || "Report data not found."
        setError(error?.message || "Report not found.");
        return null; // Handle case where the report is not found
      }
      throw error; // Throw other errors to be handled globally
    }
  };

  useEffect(() => {
    if (reportType) {
      setLoading(true);
      setReport(null); // Clear the report area before fetching new data
      setError(null); // Clear the error message
      
      fetchReportData(incidentId, reportType)
        .then((data) => {
          if (data) {
            setReport(data);
          } else {
            setError("Report not found.");
          }
        })
        .catch((err) => {
          console.error("Error fetching report data: ", err);
          toast.error(err.response?.data?.message || err?.message || "Error fetching report data!");
          setError(err.response?.data?.message || "Failed to fetch report data.");
        })
        .finally(() => setLoading(false));
    }
  }, [incidentId, reportType]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Select Report Type</h1>
      
      <div className="flex justify-center mb-4">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="p-2 border border-gray-300 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>-- Select Report Type --</option>
          <option value="InitialReport">Initial Report</option>
          <option value="FullAssessment">Full Assessment</option>
          <option value="ActionPlan">Action Plan</option>
          <option value="CaseClosure">Case Closure</option>
          {/* Add other report types as needed */}
        </select>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button 
          onClick={() => navigate('/admin-dashboard')} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
        >
          Back to Dashboard
        </button>
        <button 
          onClick={() => navigate('/')} 
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition duration-200"
        >
          Home
        </button>
      </div>

      {loading && <Spinner />}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {renderReport()}

      {/* Render the ReportView component when report data is available */}
      {/* {report && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-lg">
          <ReportView report={report} reportType={reportType} incidentId={incidentId} />
        </div>
      )} */}

      
    </div>
  );
};

export default ReportPage;
