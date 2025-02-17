const Task = require("../models/Task");

exports.fetchAllTasks = async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate('assignedTo', 'username')
        .populate('incidentId', 'caseReference');
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };