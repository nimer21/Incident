const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assignee
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assignor
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' }, // Reference to the related incident
  status: { type: String, enum: ['Pending', 'In Progress', 'Closed'], default: 'Pending' },
  feedback: { type: String, default: '' },
  deadline: Date,
  accessLevel: { type: String, default: 'read-only' },
  //createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
