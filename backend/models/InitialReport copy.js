const mongoose = require("mongoose");

const initialReportSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", required: true },
  caseReference: { type: String, required: true },
  nationalAssociation: String,
  incidentLocation: String,
  allegationsReportedTo: String,
  allegationsReceivedBy: String,
  reporter: String,
  reportingChannel: String,
  reporterContact: String,
  isOngoing: Boolean,
  dateOfIncident: Date,
  dateOfReceivingIncident: Date,
  allegedVictim: String,
  allegedPerpetrator: String,
  monetaryDamage: Number,
  informedOthers: String,
  knowledgeSource: String,
  gcInformed: Boolean,
  allegationTable: [
    {
      allegation: String,
      type: String,
      safeguardingArea: String,
      nextSteps: String,
      handledBy: String,
    },
  ],
  riskAssessment: [
    {
      question: String,
      answer: Boolean,
      actions: String,
    },
  ],
  misconductAssessment: {
    conductedBy: String,
    date: Date,
  },
});

module.exports = mongoose.model("InitialReport", initialReportSchema);
