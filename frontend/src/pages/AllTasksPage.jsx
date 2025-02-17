import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import TaskUpdateModal from '../components/TaskUpdateModal'; // Modal for updating task details
import Spinner from './../components/Spinner';

const AllTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch all tasks
  const fetchAllTasks = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/all`, {
        withCredentials: true,
      });
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
      setLoading(false);
    }
  };

  // Handle task update
  const handleTaskUpdate = async (updatedTask) => {
    try {
      console.log('Task updated: ', updatedTask);
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/tasks/${updatedTask._id}`,
        updatedTask,
        { withCredentials: true }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === updatedTask._id ? response.data : task))
      );
      //fetchAllTasks();
      toast.success('Task updated successfully!');
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  // Handle search
  const filteredTasks = tasks.filter((task) =>
    task.incidentId?.caseReference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchAllTasks();
  }, [tasks]);

  if (loading) return <Spinner />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">All Assigned Tasks</h2>

      {/* Search Bar */}
      <div className="mb-6 mt-6 flex justify-between">
        <input
          type="text"
          placeholder="Search by Case Reference..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full max-w-md"
        />
        <button 
          onClick={() => navigate('/admin-dashboard')} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Tasks Table */}
      <table className="table-auto w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Case Reference</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Feecdback</th>
            <th className="border p-2">Assigned To</th>
            <th className="border p-2">Deadline</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((task) => (
            <tr key={task._id} className="hover:bg-gray-50 transition duration-150">
              <td className="border p-2">{task.incidentId?.caseReference || 'N/A'}</td>
              <td className="border p-2">{task.title}</td>
              <td className="border p-2">{task.feedback}</td>
              <td className="border p-2">{task.assignedTo?.username || 'Unassigned'}</td>
              <td className="border p-2">
                {new Date(task.deadline).toLocaleDateString()}
              </td>
              <td className="border p-2">{task.status}</td>
              <td className="border p-2">
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setIsUpdateModalOpen(true);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Task Update Modal */}
      {isUpdateModalOpen && selectedTask && (
        <TaskUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          task={selectedTask}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
};

export default AllTasksPage;