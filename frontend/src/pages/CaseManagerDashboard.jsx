import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import IncidentDetailsModal from "../components/IncidentDetailsModal";
import { Link } from "react-router-dom";

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

  const fetchIncidentsWithTasks = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/incidents/get-incidents`, {
        //params: { search, category, page: 1, limit: 10 },
        params: { search, page, limit: 10 },
        withCredentials: true, // Send cookies for authentication
      });
       // Filter out "Conflict of Interest" cases for Case Managers
       const filteredCases = response?.data.incidentsWithTasks.filter(
        (incident) => incident.category !== "Conflict of Interest"
    );
      //setIncidents(response?.data.incidentsWithTasks);
      setIncidents(filteredCases);
      setTotalPages(response.data.pages); // Use this for pagination control
      setStats({
        total: response.data.total,
        newReports: response.data.newReports || 0,
        activeReminders: response.data.newComments || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      setLoading(false);
    }
  };

  const handleViewIncident = async (id) => {
    try {
      // Mark incident as viewed
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/incidents/${id}/mark-viewed`,
        {},
        { withCredentials: true }
      );
      // Clear the notification when the admin views the incident
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/incidents/${id}/clear-comment-notification`,
        {},
        { withCredentials: true }
    );
    // Update the UI to remove "new comment" notifications
    setIncidents((prevIncidents) =>
      prevIncidents.map((incident) =>
        incident._id === id ? { ...incident, commentViewedBy: [...incident.commentViewedBy, { userId: user?.user?.userId }] } : incident
      )
    );

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/incidents/get-incident/${id}`,
        {
          withCredentials: true, // Include cookies in requests
        }
      );
      setSelectedIncident(response.data);
      setModalOpen(true);
      // Refresh incidents data to update new reports count
      fetchIncidentsWithTasks();
    } catch (error) {
      console.error("Error fetching incident details:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  // Update table row styling to highlight new incidents
  const getRowClassName = (incident) => {
    const isNew = !incident.viewedBy?.some(
      view => view?.userId === user?.user?.userId
    );
    return `hover:bg-gray-50 transition duration-150 ease-in-out
      ${isNew ? 'bg-blue-50' : ''}`;
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

  useEffect(() => {
      fetchIncidentsWithTasks();
    }, [search, page]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
<div className="min-h-screen bg-gray-50 p-6">
  {/* Header Section */}
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-4xl font-extrabold text-gray-800">Case Manager Dashboard</h1>
    <div className="flex items-center space-x-4">
      <button
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
        onClick={() => logout()}
      >
        Logout
      </button>
      <Link
        to="/tasks"
        className="text-blue-600 hover:underline font-semibold transition"
      >
        View My Tasks
      </Link>
    </div>
  </div>

  {/* Statistics Section */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Number of Reports</h2>
      <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
    </div>
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">New Reports</h2>
      <p className="text-3xl font-bold text-green-700">{stats.newReports}</p>
    </div>
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Active Reminders</h2>
      <p className="text-3xl font-bold text-yellow-600">{stats.activeReminders}</p>
    </div>
  </div>

  {/* Search and Filter Section */}
  <div className="mb-6">
    <div className="flex items-center space-x-4">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  </div>

  {/* Table Section */}
  <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
    <table className="table-auto w-full text-left border-collapse">
      <thead>
        <tr className="bg-blue-100">
          <th className="border p-3 text-gray-700 font-semibold">
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
          <th className="border p-3 text-gray-700 font-semibold">
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
          <th className="border p-3 text-gray-700 font-semibold">
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
          <th className="border p-3 text-gray-700 font-semibold">
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
          <th className="border p-3 text-gray-700 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {incidents?.map((incident) => (
          <tr
            key={incident._id}
            // className="hover:bg-gray-50 transition duration-150 ease-in-out"
            className={getRowClassName(incident)}
          >
            <td className="border p-3">{incident.caseReference}</td>
            <td className="border p-3 whitespace-nowrap text-ellipsis overflow-hidden max-w-52">{incident.subject}</td>
            <td className="border p-3">{incident.category}</td>
            <td className="border p-3">
              {new Date(incident.createdAt).toLocaleDateString()}
            </td>
            <td className="border p-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewIncident(incident._id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg shadow transition duration-150 relative"
                >
                  View
                  {/* 🔴 Red dot for unread comments */}
                  {!incident.commentViewedBy?.some(view => view?.userId === user?.user?.userId) && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse">🔔</span>
                    )}
                </button>
                {/* Show a notification badge if there is a new comment */}
                {incident.hasNewComment && (
                    <span className="ml-2 inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                    )}
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
  </div>

  {/* Pagination Section */}
  <div className="mt-6 flex justify-between items-center">
    <button
      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
      disabled={page === 1}
      className={`px-4 py-2 rounded-lg shadow ${
        page === 1
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      Previous
    </button>
    <span className="text-gray-700 font-semibold">Page {page}</span>
    <button
      onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
      disabled={page === totalPages}
      className={`px-4 py-2 rounded-lg shadow ${
        page === totalPages
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-blue-500 text-white hover:bg-blue-600"
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
