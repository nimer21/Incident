import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AuditLogPage = () => {
  const { incidentId } = useParams(); // Extract incident ID from URL
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caseReference, setCaseReference] = useState(""); // Store Case Reference

  const navigate = useNavigate(); // Initialize navigate for navigation

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/incidents/audit/${incidentId}`,
          { withCredentials: true }
        );
        console.log("***= ",response.data);

        setAuditLogs(response.data);

        // Extract Case Reference from the first audit log if available
        if (response.data?.length > 0) {
          setCaseReference(response.data[0].caseReference || "N/A");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        setError("Failed to load audit logs.");
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [incidentId]);

  if (loading) return <p>Loading audit logs...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Audit Log</h1>

      {/* 🆕 Display Case Reference */}
      <h2 className="text-xl font-semibold text-center mb-4">
        Case Reference: {caseReference}
      </h2>

      <div className="flex justify-between mb-4">
      <button
        onClick={() => window.print()} // Print button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Print Audit Log
      </button>
      <button 
          onClick={() => navigate('/admin-dashboard')} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
        >
          Back to Dashboard
        </button>
        </div>

      

      <table className="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Action</th>
            <th className="p-2 border">Details</th>
          </tr>
        </thead>
        <tbody>
          {auditLogs.length > 0 ? (
            auditLogs?.map((log) => (
            <tr key={log._id} className="border hover:bg-gray-50">
              <td className="p-2 border">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="p-2 border">{log.performedBy?.username || "Unknown"}</td>
              <td className="p-2 border">{log.performedByRole}</td>
              <td className="p-2 border">{log.action}</td>
              <td className="p-2 border">{log.details}</td>
            </tr>
          ))
        ) : (
            <tr>
                  <td colSpan="4" className="p-2 text-center">No audit logs found</td>
                </tr>
              )}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogPage;
