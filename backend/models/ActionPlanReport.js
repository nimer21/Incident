// models/ActionPlanReport.js
const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema({
  type: { type: String, required: false },
  amount: { type: Number, required: false },
  responsibleForImplementation: { type: String, required: false },
  timeframe: { type: String, required: false },
  status: { type: String, required: false },
  comments: { type: String, required: false }
});

const actionPlanReportSchema = new mongoose.Schema({
  //caseId: { type: String, required: true },
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Incident",
    required: true,
  },
  caseReference: { type: String, required: true },
  nationalAssociation: { type: String, required: false },
  incidentLocation: { type: String, required: false },
  allegationsReportedTo: { type: String, required: false },
  allegationsReceivedBy: { type: String, required: false },
  supportRecipientName: { type: String, required: false },
  supportRecipientRelation: { type: String, required: false },
  totalSupportAmount: { type: String, required: false },
  misconductAssessment: {
    conductedBy: { type: String, required: false },
    date: { type: Date, required: false }
  },
  investigationConducted: { type: String, required: false },
  durationOfSupport: { type: String, required: false },
  actionItems: [actionItemSchema],
  serviceRecipient: { type: String, required: false },
  recipientDate: { type: Date, required: false },
  recipientSignature: { type: String, required: false },
  writerName: { type: String, required: false },
  writerDate: { type: Date, required: false },
  writerSignature: { type: String, required: false },
  approvedBy: { type: String, required: false },
  approvalSignature: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const ActionPlanReport = mongoose.model('ActionPlanReport', actionPlanReportSchema);

module.exports = ActionPlanReport;