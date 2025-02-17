import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import IncidentDetailsModal from "../components/IncidentDetailsModal";
import { useSelector } from "react-redux";

const UserDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const navigate = useNavigate();

  const { logout } = useAuthContext();
  const user = useSelector((state) => state.user.user);

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchIncidents = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${user.user.userId}/incidents`,
        { withCredentials: true }
      );
      setIncidents(response.data);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    }
  };

  useEffect(() => {
    if (user?.user) {
      fetchIncidents();
    } else {
      navigate("/login");
    }
  }, []);

  // Fetch details of a specific incident
  const handleViewIncident = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/incidents/get-incident/${id}`,
        {
          withCredentials: true, // Include cookies in requests
        }
      );
    //   // Clear the notification when the admin views the incident
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/incidents/${id}/clear-comment-notification`,
        {},
        { withCredentials: true }
    );
      setSelectedIncident(response.data);
      setModalOpen(true);
      // Fetch incidents again to update UI
      fetchIncidents();
    } catch (error) {
      console.error("Error fetching incident details:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleSubmitNewReport = () => {
    navigate(`/categor-selection`);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedIncident(null);
    setModalOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handleSubmitNewReport}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-red-600"
          >
            Submit new report
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Submitted Incidents</h2>
        {/* <div className="overflow-x-auto bg-white rounded-md shadow-md p-4"> */}
        {incidents.length > 0 ? (
          <table className="table-auto w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Case Reference</th>
                <th className="border p-2">Subject</th>
                <th className="border p-2">Category</th>
                <th className="border p-3">Severity</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr
                  key={incident._id}
                  className="hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <td className="border p-2">{incident.caseReference}</td>
                  <td className="border p-2">{incident.subject}</td>
                  <td className="border p-2">{incident.category}</td>
                  <td
                    className={`border p-3 text-${incident.severity.toLowerCase()}`}
                  >
                    {incident.severity}
                  </td>
                  <td className="border p-2">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border p-2">
                    {/* Show a notification badge if there is a new comment */}
                  {incident.hasNewComment && (
                    <span className="ml-2 inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                    )}
                    <button
                      onClick={() => handleViewIncident(incident._id)}
                      className="bg-blue-500 text-white px-3 py-1 ml-2 rounded transition duration-150 ease-in-out hover:bg-blue-600 relative"
                    >
                      View Details
                      {/* 🔴 Red dot for unread comments */}
                      {!incident.commentViewedBy?.some(view => view?.userId === user?.user?.userId) && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse">🔔</span>
                    )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No incidents reported yet.</p>
        )}
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

export default UserDashboard;
