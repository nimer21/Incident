import React from "react";

const TaskCard = ({ task, handleFeedbackClick, handleViewTask }) => {
  const isOverdue = new Date(task.deadline) < new Date();
  const statusClasses =
    task.status === "Completed"
      ? "bg-green-100 text-green-700"
      : task.status === "In Progress"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-bold text-blue-700 mb-2">{task.title}</h3>
      <div className="space-y-2">
        {/* Incident Info */}
        <p className="text-gray-600 whitespace-nowrap text-ellipsis overflow-hidden">
          <strong className="text-gray-800">Incident:</strong> {task.incidentId.caseReference} -{" "}
          {task.incidentId.subject}
        </p>
        
        {/* Assigned By */}
        <p className="text-gray-600">
          <strong className="text-gray-800">Assigned By:</strong> {task.assignedBy.username}
        </p>
        
        {/* Deadline */}
        <p className="text-gray-600">
          <strong className="text-gray-800">Deadline:</strong>{" "}
          <span className={`px-2 py-1 rounded text-sm ${isOverdue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {new Date(task.deadline).toLocaleDateString()}
          </span>
        </p>
        
        {/* Status */}
        <p className="text-gray-600">
          <strong className="text-gray-800">Status:</strong>{" "}
          <span className={`px-2 py-1 rounded text-sm ${statusClasses}`}>
            {task.status}
          </span>
        </p>
        
        {/* Feedback */}
        {task.feedback && (
          <p className="text-gray-600">
            <strong className="text-gray-800">Feedback:</strong> {task.feedback}
          </p>
        )}
      </div>

      {/* Action Button */}
      <div className="flex space-x-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:ring focus:ring-blue-300 transition"
          onClick={() => handleFeedbackClick(task._id)}
        >
          Update Status/Feedback
        </button>
        <button
        onClick={() => handleViewTask(task.incidentId._id)} // Trigger view action
        className="bg-blue-500 text-white px-3 py-1 rounded shadow"
      >
        View
      </button>
      </div>
    </div>
  );
};

export default TaskCard;
