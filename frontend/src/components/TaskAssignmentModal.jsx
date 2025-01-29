import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const TaskAssignmentModal = ({ isOpen, onClose, onTaskAssigned, incidentId }) => {
    const initialTaskState = {
        title: "",
        description: "",
        assignedTo: "", // Initially empty; should match a valid user ID when selected
        deadline: "",
        accessLevel: "read-only",
      };
  const [task, setTask] = useState(initialTaskState);
  const [users, setUsers] = useState([]); // State to hold users for selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // State for error messages

  // Fetch users when the modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/api/users");
        setUsers(response.data); // Ensure correct data extraction
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users.");
      }
    };

    if (isOpen) {
      fetchUsers();
    } else {
        // Reset form when modal is closed
        setTask(initialTaskState);
        setError(""); // Clear any previous errors
      }
  }, [isOpen]); // Dependency array includes isOpen

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error state before making the request

    // Prepare task data
    const taskData = {
      title: task.title,
      description: task.description, // No need to sanitize this input as it's just a text field
      assignedTo: task.assignedTo, // This should be a valid user ID
      deadline: (new Date(task.deadline)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }), // Ensure deadline is a Date object
      accessLevel: task.accessLevel,
    };

    try {
      // Make API request to assign the task
      const response = await axiosInstance.post(`/api/incidents/${incidentId}/tasks`, taskData);
      if (response.status === 201 || response.status === 200) {
        // Success response
        //console.log("response", response);
        onTaskAssigned(incidentId, response.data); // Update parent state
        onClose();
        //alert("Task assigned successfully!");
      } else {
        throw new Error("Unexpected response");
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      alert("Failed to assign task");
      setError("Failed to assign task. Please try again."); // Set error message
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null; // Return null if modal is closed

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h3 className="text-xl font-semibold mb-4">Assign Task</h3>
        {error && <div className="mb-4 text-red-500">{error}</div>} {/* Display error message */}
        <form onSubmit={handleAssign}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Task Title:</label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter task title"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Task Description:</label>
            <textarea
              type="text"
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter task description"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Assign To:</label>
            <select
              value={task.assignedTo}
              onChange={(e) => setTask({ ...task, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username} {/* Assuming user has a name property */} - {user.role}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Deadline:</label>
            <input
              type="date"
              value={task.deadline}
              onChange={(e) => setTask({ ...task, deadline: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Access Level:</label>
            <select
              value={task.accessLevel}
              onChange={(e) => setTask({ ...task, accessLevel: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="read-only">Read Only</option>
              <option value="edit">Edit</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading} // Disable button while loading
              className={`px-4 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskAssignmentModal;
