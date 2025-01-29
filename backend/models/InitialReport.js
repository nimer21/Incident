const mongoose = require("mongoose");

const allegationTableSchema = new mongoose.Schema({
  allegation: { type: String, default: '' },
  type: { type: String, default: '' },
  safeguardingArea: { type: String, default: '' },
  nextSteps: { type: String, default: '' },
  handledBy: { type: String, default: '' }
});

const riskAssessmentSchema = new mongoose.Schema({
  question: { type: String, default: '' },
  answer: { type: Boolean, default: false },
  actions: { type: String, default: '' }
});

const misconductAssessmentSchema = new mongoose.Schema({
  conductedBy: { type: String, default: '' },
  date: { type: Date }
});

const initialReportSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", required: true },
  caseReference: { type: String, required: true },
  nationalAssociation: { type: String, default: '' },
  incidentLocation: { type: String, default: '' },
  allegationsReportedTo: { type: String, default: '' },
  allegationsReceivedBy: { type: String, default: '' },
  reporter: { type: String, default: '' },
  reportingChannel: { type: String, default: '' },
  reporterContact: { type: String, default: '' },
  isOngoing: { type: Boolean, default: false },
  dateOfIncident: { type: Date },
  dateOfReceivingIncident: { type: Date },
  allegedVictim: { type: String, default: '' },
  allegedPerpetrator: { type: String, default: '' },
  monetaryDamage: { type: Number, default: 0 },
  informedOthers: { type: String, default: '' },
  knowledgeSource: { type: String, default: '' },
  gcInformed: { type: Boolean, default: false },
  allegationTable: [allegationTableSchema],
  riskAssessment: [riskAssessmentSchema],
  misconductAssessment: misconductAssessmentSchema
});

module.exports = mongoose.model("InitialReport", initialReportSchema);