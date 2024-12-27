import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import IncidentDetailsModal from "../components/IncidentDetailsModal";

const severityColors = {
  Low: "text-green-600",
  Medium: "text-orange-500",
  High: "text-red-600",
};

const CaseManagerDashboard = ({ user }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { logout } = useAuthContext();
  
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState();
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  const [selectedSeverity, setSelectedSeverity] = useState({});

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/incidents/get-incidents`, {
          //params: { search, category, page: 1, limit: 10 },
          params: { search, page, limit: 10 },
          withCredentials: true, // Send cookies for authentication
        });
        setIncidents(response.data.incidents);
        setTotalPages(response.data.pages); // Use this for pagination control
        setStats({
          total: response.data.total,
          newReports: response.data.newReports || 0,
          activeReminders: response.data.activeReminders || 0,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching incidents:", error);
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [search, page]);

  const handleViewIncident = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/incidents/get-incident/${id}`,
        {
          withCredentials: true, // Include cookies in requests
        }
      );
      setSelectedIncident(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching incident details:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleSeverityChange = async (incidentId, severity) => {
    setSelectedSeverity((prev) => ({ ...prev, [incidentId]: severity }));
    //await updateSeverity(incidentId, severity); // Backend API call
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/incidents/${incidentId}/severity`,
        { severity },
        {
          withCredentials: true, // Include cookies in requests
        }
      );
    } catch (error) {
      console.error("Error updating incident Severity:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  // Sort logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

    // Close modal
    const handleCloseModal = () => {
      setSelectedIncident(null);
      setModalOpen(false);
    };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Case Manager Dashboard</h1>
        <button
          className="bg-red-500 text-white py-2 px-4 rounded"
          onClick={() => {
            logout();
          }}
        >
          Logout
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Number of Reports</h2>
          <p>{stats.total}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">New Reports</h2>
          <p>{stats.newReports}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Active Reminders</h2>
          <p>{stats.activeReminders}</p>
        </div>
      </div>
      <div className="flex justify-between items-center">
      
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded"
        />        
        </div>
      </div>     
      {/* Table Section */}
      <table className="table-auto w-full text-left border-collapse bg-white shadow rounded border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">
            <button
                onClick={() => handleSort("_id")}
                className="flex items-center space-x-1 hover:text-blue-500"
              >
                <span>Reference</span>
                {sortConfig.key === "_id" && (
                  <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </button>
            </th>
            <th className="border p-2">
            <button
                onClick={() => handleSort("subject")}
                className="flex items-center space-x-1 hover:text-blue-500"
              >
                <span>Subject</span>
                {sortConfig.key === "subject" && (
                  <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </button>
            </th>
            <th className="border p-2">
            <button
                onClick={() => handleSort("category")}
                className="flex items-center space-x-1 hover:text-blue-500"
              >
                <span>Category</span>
                {sortConfig.key === "category" && (
                  <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </button>
            </th>
            <th className="border p-2">
            <button
                onClick={() => handleSort("createdAt")}
                className="flex items-center space-x-1 hover:text-blue-500"
              >
                <span>Date</span>
                {sortConfig.key === "createdAt" && (
                  <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                )}
              </button>
            </th>
            {/* <th className="border p-2">Severity</th> */}
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidents?.map((incident) => (
            <tr key={incident._id}
            className="hover:bg-gray-100 transition duration-150 ease-in-out">
              <td className="border p-2">{incident.caseReference}</td>
              <td className="border p-2">{incident.subject}</td>
              <td className="border p-2">{incident.category}</td>
              <td className="border p-2">
                {new Date(incident.createdAt).toLocaleDateString()}
              </td>
              <td className="border p-2">
              <div className="flex space-x-2 items-center">
                <button
                  onClick={() => handleViewIncident(incident._id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-150"
                >
                  View
                </button>
                {/* Severity Dropdown */}
                <select
                  value={selectedSeverity[incident._id] || incident.severity}
                  onChange={(e) =>
                    handleSeverityChange(incident._id, e.target.value)
                  }
                  className={`rounded px-2 py-1 border ${
                    severityColors[
                      selectedSeverity[incident._id] || incident.severity
                    ]
                  }`}
                >
                  <option value="Low" className="text-green-600">
                    Low
                  </option>
                  <option value="Medium" className="text-orange-500">
                    Medium
                  </option>
                  <option value="High" className="text-red-600">
                    High
                  </option>
                </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1} // Disable if on the first page
          className={`px-4 py-2 ${
            page === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
          }`}
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() =>
            setPage((prev) => (prev < totalPages ? prev + 1 : prev))
          }
          disabled={page === totalPages} // Disable if on the last page
          className={`px-4 py-2 ${
            page === totalPages ? "bg-gray-300" : "bg-blue-500 text-white"
          }`}
        >
          Next
        </button>
      </div>

      {/* Modal for Incident Details */}
      {modalOpen && selectedIncident && (
        <IncidentDetailsModal
          selectedIncident={selectedIncident}
          setSelectedIncident={setSelectedIncident}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CaseManagerDashboard;
