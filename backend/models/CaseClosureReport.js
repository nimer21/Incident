const mongoose = require("mongoose");

const caseClosureSchema = new mongoose.Schema({
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Incident",
    required: true,
  },
  caseReference: {
    type: String,
    required: true,
  },
  incidentReportingDate: {
    type: Date,
    required: true,
  },
  incidentRegistrationDate: {
    type: Date,
    required: true,
  },
  incidentClosureDate: {
    type: Date,
    required: true,
  },
  reasonsForClosure: {
    type: String,
    required: true,
  },
  implementedActions: {
    type: String,
    required: true,
  },
  followUpPlans: {
    type: String,
    required: true,
  },
  isReporterAwareOfClosure: {
    type: Boolean,
    required: true,
  },
  incidentManager: {
    name: String,
    function: String,
    date: Date,
  },
  approvedBy: {
    name: String,
    function: String,
    date: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("CaseClosure", caseClosureSchema);