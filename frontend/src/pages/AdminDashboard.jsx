import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthContext from "../context/AuthContext";
import IncidentDetailsModal from "../components/IncidentDetailsModal";
import { toast } from "react-toastify";
import CreateUserModal from "../components/CreateUserModal";
import { Menu, MenuSeparator } from "@headlessui/react";
import TaskAssignmentModal from "../components/TaskAssignmentModal";
import Spinner from "../components/Spinner";
import { Link, useNavigate } from "react-router-dom";
import CaseClosureModal from "../components/CaseClosureModal";
import InitialReportModal from "../components/InitialReportModal";
import FullAssessmentModal from "../components/FullAssessmentModal";
import ActionPlanReportModal from "../components/ActionPlanReportModal";

const severityColors = {
  Low: "text-green-600",
  Medium: "text-orange-500",
  High: "text-red-600",
};

const AdminDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState();
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { logout, user } = useAuthContext();
  const [selectedSeverity, setSelectedSeverity] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalOpenTaskAssignment, setModalOpenTaskAssignment] = useState(false);
  const [tasks, setTasks] = useState({}); // Track assigned tasks

  //const token = sessionStorage.getItem("token");

  // Replace the existing report modal state and handlers with:
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedIncidentForReport, setSelectedIncidentForReport] =
    useState(null);
  const [reportData, setReportData] = useState(null);
  const navigate = useNavigate(); // Initialize navigate for navigation

  // Handle report selection
  const handleReportSelection = async (
    incidentId,
    caseReference,
    reportType
  ) => {
    setSelectedReportType(reportType);
    setSelectedIncidentForReport({ id: incidentId, caseReference });

    try {
      console.log("incidentId, reportType", incidentId, reportType);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/reports/${incidentId}/${reportType}`,
        { withCredentials: true }
      );
      setReportData(response.data.report || null); // Null if no data exists
      setIsReportModalOpen(true);
    } catch (error) {
      if (error.response?.status === 404) {
        // If no data exists (If no existing report), show empty placeholders (open modal with empty form)
        setReportData(null);
        setIsReportModalOpen(true);
      } else {
        console.error("Error fetching report data:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch report data."
        );
      }
    }
  };

  const fetchIncidentsWithTasks = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/incidents/get-incidents`,
        {
          //params: { search, category, page: 1, limit: 10 },
          params: { search, category, page, limit: 10 },
          //headers: { Authorization: `Bearer ${token}` },
          withCredentials: true, // Include cookies in requests
        }
      );

      // const response = await axios.get(
      //     `http://localhost:5005/api/incidents/get-incidents?search=${searchTerm}&category=${category}&page=${page}&limit=10`
      // );

      setIncidents(response?.data.incidentsWithTasks);
      setTotalPages(response.data.pages); // Use this for pagination control
      setStats({
        total: response.data.total,
        newReports: response.data.newReports || 0,
        activeReminders: response.data.newComments || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch incidents", error);
      setLoading(false);
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
      // Update severity logic here
      //console.log(`Incident ${incidentId} severity changed to ${severity}`);
      toast.success(`Incident severity changed to ${severity}`);
    } catch (error) {
      console.error("Error updating incident Severity:", error);
      toast.error(error?.response?.data?.message);
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
    // Update the incident list to remove the "New" badge | Update the list and active reminders count
  //   setIncidents((prevIncidents) =>
  //     prevIncidents.map((incident) =>
  //         incident._id === id ? { ...incident, hasNewComment: false } : incident
  //     )
  // );

  // Reduce the activeReminders count
//   setStats((prevStats) => ({
//     ...prevStats,
//     activeReminders: Math.max(prevStats.activeReminders - 1, 0),
// }));
      // Fetch updated incident details
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
    const isNewIncident = !incident.viewedBy?.some(
      (view) => view?.userId === user?.user?.userId
    );

//      // ✅ Add a red dot 🔴 for **unread comments**
// const hasNewComments = !incident.commentViewedBy?.some(
//   (view) => view?.userId === user?.user?.userId
// );

    return `hover:bg-gray-50 transition duration-150 ease-in-out
      ${isNewIncident ? "bg-blue-50" : ""}`;

    // return `hover:bg-gray-50 transition duration-150 ease-in-out
    // ${isNewIncident ? "bg-blue-50" : ""}
    // ${hasNewComments ? "border-l-4 border-red-500" : ""}`; // Adds red left border for new comments
  };

  // const handleOpenTaskAssignmentModal = (incidentId) => {
  const handleOpenTaskAssignmentModal = (incident) => {
    //console.log("handleOpenTaskAssignmentModal: ", incident, user?.user.role);
    // Only allow task assignment for "Conflict of Interest" if user is Super Admin
    if (incident.category === "Conflict of Interest" && user?.user.role !== "super_admin") {
      toast.error("Only Super Admin can assign tasks for Conflict of Interest cases.");
      return;
  }
    setSelectedIncident(incident?._id);
    setModalOpenTaskAssignment(true);
  };

  const handleTaskAssigned = (incidentId, taskDetails) => {
    setTasks((prevTasks) => ({
      ...prevTasks,
      [incidentId]: { ...taskDetails },
    }));
    //console.log("Task assigned:", taskDetails);
    toast.success(
      `Task assigned to ${taskDetails.assignedToName} By ${
        taskDetails.assignedByName
      } with deadline ${new Date(
        taskDetails.task.deadline
      ).toLocaleDateString()}`
    );
    // Update the incident's status to "Task Assigned"
    //handleEscalation(incidentId, "Task Assigned");
    // Update the incident's tasks array with the new task details
    // await updateTasks(incidentId, taskDetails);
  };

  const handleCloseModal = () => {
    setSelectedIncident(null);
    setModalOpen(false);
    setModalOpenTaskAssignment(false);
  };

  // Sort logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    fetchIncidentsWithTasks();
  }, [search, category, page, tasks]);

  if (loading) {
    // return <divv>Loading...</divv>;
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <div className="flex gap-4">
    <button
      className="bg-blue-500 text-white py-2 px-4 rounded"
      onClick={() => navigate('/admin-tasks')} // Navigate to the tasks page
    >
      View All Assigned Tasks
    </button>
        <button
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-150 shadow-sm"
          onClick={() => {
            logout();
          }}
        >
          Logout
        </button>
      </div>
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
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Categories</option>
            <option value="Asset Safeguarding">Asset Safeguarding</option>
            <option value="Child Safeguarding">Child Safeguarding</option>
            <option value="Youth & Adult">Youth & Adult</option>
            <option value="Data Breach">Data Breach</option>
          </select>
        </div>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => setIsModalOpen(true)}
        >
          Create User
        </button>
      </div>
      {/* Modal Integration */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {/* Table Section */}
      <table className="table-auto w-full text-left border-collapse bg-white shadow rounded border border-gray-3004">
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
            <th className="border p-2">Assign</th>
            {/* <th className="border p-2">Severity</th> */}
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidents?.map((incident) => (
            <tr
              key={incident._id}
              // className="hover:bg-gray-100 transition duration-150 ease-in-out"
              className={getRowClassName(incident)}
            >
              <td className="border p-2">{incident.caseReference}</td>
              <td className="border p-2 whitespace-nowrap text-ellipsis overflow-hidden max-w-52">
                {incident.subject}
              </td>
              <td className="border p-2">{incident.category}</td>
              <td className="border p-2">
                {new Date(incident.createdAt).toLocaleDateString()}
              </td>
              <td className="border p-2">
                {/* Task Assignment Button */}
                {incident.tasks?.length > 0 ? ( //  && incident.tasks[0]
                  <>
                    {/* <div>Assigned to: {tasks[incident._id].assignee}</div>
                    <div>Deadline: {tasks[incident._id].deadline}</div> */}
                    {/* <div>Assigned to: {incident.tasks[0].assignedToName || "Unknown"}</div> */}
                    <div>
                      Assigned to:{" "}
                      {incident.tasks[0].assignedTo.username || "Unknown"}
                    </div>
                    <div>
                      Deadline:{" "}
                      {new Date(
                        incident.tasks[0].deadline
                      ).toLocaleDateString()}
                    </div>
                  </>
                ) : (
                  <button
                    // onClick={() => handleOpenTaskAssignmentModal(incident._id)}
                    onClick={() => handleOpenTaskAssignmentModal(incident)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition duration-150"
                  >
                    Assign Task
                  </button>
                )}
              </td>
              <td className="border p-2">
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() => handleViewIncident(incident._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-150 shadow-sm relative"
                  >
                    View
                    {/* 🔴 Red dot for unread comments */}
                      {!incident.commentViewedBy?.some(view => view?.userId === user?.user?.userId) && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse">🔔</span>
                    )}
                  </button>
                  {/* Show a notification badge if there is a new comment */}
                  {/* {!incident.commentViewedBy?.some(view => view?.userId === user?.user?.userId) && (
                    <span className="ml-2 inline-block text-white text-xs px-2 py-1 rounded-full">
                      🔔
                    </span>
                    )} */}

                   {/* 🔴 Red dot for unread comments
                   {hasNewComments && (
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )} */}
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
                    } shadow-sm`}
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

                  {/* // Replace the existing report modal JSX with: */}

                  {/* Assessment Reports Dropdown */}
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded transition duration-150 shadow-sm">
                      Assessment Reports ▼
                    </Menu.Button>
                    <Menu.Items
                      anchor="bottom"
                      transition
                      className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-300 rounded shadow-lg z-10 transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                    >
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? "bg-gray-100" : ""
                            } px-4 py-2 w-full text-left`}
                            onClick={(e) =>
                              handleReportSelection(
                                incident._id,
                                incident.caseReference,
                                "InitialReport"
                              )
                            }
                          >
                            Initial Report
                          </button>
                        )}
                      </Menu.Item>
                      <MenuSeparator className="my-1 h-px bg-black" />
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? "bg-gray-100" : ""
                            } px-4 py-2 w-full text-left`}
                            onClick={() =>
                              handleReportSelection(
                                incident._id,
                                incident.caseReference,
                                "FullAssessment"
                              )
                            }
                          >
                            Full Assessment
                          </button>
                        )}
                      </Menu.Item>
                      <MenuSeparator className="my-1 h-px bg-black" />
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? "bg-gray-100" : ""
                            } px-4 py-2 w-full text-left`}
                            onClick={() =>
                              handleReportSelection(
                                incident._id,
                                incident.caseReference,
                                "ActionPlan"
                              )
                            }
                          >
                            Action Plan
                          </button>
                        )}
                      </Menu.Item>
                      <MenuSeparator className="my-1 h-px bg-black" />
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? "bg-gray-100" : ""
                            } px-4 py-2 w-full text-left`}
                            onClick={() =>
                              handleReportSelection(
                                incident._id,
                                incident.caseReference,
                                "CaseClosure"
                              )
                            }
                          >
                            Case Closure
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                  <Link
                    to={`/report-page/${incident._id}`}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-150 shadow-sm"
                  >
                    Report Page
                  </Link>
                  <Link
                  to={`/audit-log/${incident._id}`}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition duration-150"
                  >
                    View Audit Log
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Task Assignment Modal */}
      <TaskAssignmentModal
        isOpen={modalOpenTaskAssignment}
        onClose={handleCloseModal}
        onTaskAssigned={handleTaskAssigned}
        incidentId={selectedIncident}
      />

      {isReportModalOpen && (
        <>
          {selectedReportType === "InitialReport" && (
            <InitialReportModal
              isOpen={isReportModalOpen}
              onClose={() => {
                setIsReportModalOpen(false);
                setSelectedReportType("");
                setSelectedIncidentForReport(null);
                setReportData(null);
              }}
              incidentId={selectedIncidentForReport?.id}
              caseReference={selectedIncidentForReport?.caseReference}
              reportData={reportData}
            />
          )}
          {selectedReportType === "CaseClosure" && (
            <CaseClosureModal
              isOpen={isReportModalOpen}
              onClose={() => {
                setIsReportModalOpen(false);
                setSelectedReportType("");
                setSelectedIncidentForReport(null);
                setReportData(null);
              }}
              incidentId={selectedIncidentForReport?.id}
              caseReference={selectedIncidentForReport?.caseReference}
              reportData={reportData}
            />
          )}
          {selectedReportType === "FullAssessment" && (
            <FullAssessmentModal
              isOpen={isReportModalOpen}
              onClose={() => {
                setIsReportModalOpen(false);
                setSelectedReportType("");
                setSelectedIncidentForReport(null);
                setReportData(null);
              }}
              incidentId={selectedIncidentForReport?.id}
              caseReference={selectedIncidentForReport?.caseReference}
              reportData={reportData}
            />
          )}
          {selectedReportType === "ActionPlan" && (
            <ActionPlanReportModal
              isOpen={isReportModalOpen}
              onClose={() => {
                setIsReportModalOpen(false);
                setSelectedReportType("");
                setSelectedIncidentForReport(null);
                setReportData(null);
              }}
              incidentId={selectedIncidentForReport?.id}
              caseReference={selectedIncidentForReport?.caseReference}
              reportData={reportData}
            />
          )}
          {/* Add similar conditions for other report types */}
        </>
      )}

      {/* Pagination */}

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

export default AdminDashboard;
