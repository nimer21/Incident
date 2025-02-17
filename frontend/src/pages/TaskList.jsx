import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import TaskFeedbackModal from '../components/TaskFeedbackModal';
import TaskCard from '../components/TaskCard';
import IncidentDetailsModal from '../components/IncidentDetailsModal';
import { useNavigate } from 'react-router-dom';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null); // Track selected task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null); // To store task details
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // Track the modal state
  const navigate = useNavigate();

  const handleViewTask = async (id) => {
    try {
      const response = await axiosInstance.get(`/api/incidents/get-incident/${id}`);
      setSelectedTask(response.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching incident details:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setIsViewModalOpen(false);
  };

  const handleFeedbackClick = (taskId) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  const handleFeedbackSubmitted = (taskId, updatedTask) => {
    // Update the task in the UI directly
  setTasks((prevTasks) =>
    prevTasks.map((task) =>
      task._id === taskId ? { ...task, ...updatedTask } : task
    )
  );
  setIsModalOpen(false); // Close the modal
  toast.success('Feedback submitted successfully!');
    // Update the task in the UI (if necessary)
    console.log(`Feedback submitted for task ${taskId}:`, updatedTask);
  };
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get('/api/tasks/assigned');
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error(error.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    {/* Header */}
    <div className="mb-6 mt-6 flex justify-between">
    <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
      My Assigned Tasks
    </h2>
    <button 
          onClick={() => navigate('/casemanager-dashboard')} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
        >
          Back to Dashboard
        </button>
        </div>

    {/* Tasks Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          handleFeedbackClick={handleFeedbackClick}
          handleViewTask={handleViewTask} // Pass the function
        />
      ))}
    </div>

    {/* Feedback Modal */}
    {isModalOpen && (
      <TaskFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={selectedTaskId}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
    )}

     {/* Modal for Incident Details */}
  {isViewModalOpen && selectedTask && (
    <IncidentDetailsModal
      selectedIncident={selectedTask}
      setSelectedIncident={setSelectedTask}
      onClose={handleCloseModal}
    />
  )}
  </div>
  );
};

export default TaskList;
