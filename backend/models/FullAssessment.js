// models/FullAssessment.js
const mongoose = require("mongoose");

const fullAssessmentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
    },
    //incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", required: true },
    caseReference: {
      type: String,
      required: true,
    },
    // Basic information
    caseId: String,
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
    
    // Additional fields
    informedOthers: String,
    howReporterLearned: String,
    
    // Criminal act assessment
    reportingRequirements: [{
      question: String,
      answer: Boolean,
      comments: String
    }],
    
    // Allegations table
    allegationTable: [{
      allegation: String,
      immediateActions: String,
      evidenceCollected: String,
      nextSteps: String,
      finding: String
    }],
    
    // Summary and recommendations
    summaryOfFindings: String,
    recommendations: String,
    
    // Assessment information
    misconductAssessment: {
      conductedBy: String,
      date: Date
    }
  },
  {
    timestamps: true,
  }
);

// const FullAssessment = mongoose.model("FullAssessment", fullAssessmentSchema);

// module.exports = FullAssessment;
module.exports = mongoose.model("FullAssessment", fullAssessmentSchema);