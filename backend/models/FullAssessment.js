const mongoose = require("mongoose");

const fullAssessmentSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", required: true },
  caseReference: { type: String, required: true },
  assessmentDetails: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FullAssessment", fullAssessmentSchema);
