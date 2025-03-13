const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", required: true },
  caseReference: { type: String, required: true },
  action: { type: String, required: true }, // e.g., "Comment Added", "Severity Updated"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Allow null for unregistered users
  performedByRole: { type: String, required: true, default: "Anonymous" },
  timestamp: { type: Date, default: Date.now },
  details: { type: String }, // Additional details of the action
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
