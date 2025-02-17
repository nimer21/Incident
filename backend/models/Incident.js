const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        trim: true,
    },
    caseReference: { type: String, unique: true, required: true },
    firstName: {
        type: String,
        required: false,
        trim: true,
    },
    lastName: {
        type: String,
        required: false,
        trim: true,
    },
    subject: {
        type: String,
        required: false,
        trim: true,
    },
    location: {
        type: String,
        required: false,
        trim: true,
    },
    incidentDescription: {
        type: String,
        required: false,
        trim: true,
    },
    programLocation: {
        type: String,
        trim: true,
    },
    programType: {
        type: String,
        trim: true,
    },
    relationship: {
        type: String,
        required: false,
        trim: true,
    },
    knowledgeSource: {
        type: String,
        trim: true,
    },
    victimInfo: {
        type: String,
        trim: true,
    },
    victimName: {
        type: String,
        trim: true,
    },
    perpetratorInfo: {
        type: String,
        trim: true,
    },
    ongoingIncident: {
        type: String,
        enum: ['Yes', 'No', "I don't know"], // Restricts to valid values
        required: false,
    },
    nameProvided: {
        type: String,
        enum: ['Yes', 'No'], // Restricts to valid values
        required: false,
    },
    informedOthers: {
        type: String,
        enum: ['Yes', 'No'], // Restricts to valid values
        required: false,
    },
    fileAttachment: [
        {
          type: String, // Each string represents a file path or URL
          trim: true,
        },
      ],
    //user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Link to user account
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional link to user
    notifiedManagers: { type: Boolean, default: false }, // New field
    severity: { type: String, enum: ["Low", "Medium", "High"], default: "Low" }, // Severity field
    comments: [
        {
          text: String,
          author: String, // Username or admin/user ID
          timestamp: { type: Date, default: Date.now },
        },
      ],
      hasNewComment: { type: Boolean, default: false },
      riskAssessment: {
        immediateDanger: { type: Boolean, default: false },
        interventionRequired: { type: Boolean, default: false },
        severityLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    },
    outcome: {
        acknowledged: { type: Boolean, default: false },
        supportProvided: { type: Boolean, default: false },
        escalatedToSafeguardingTeam: { type: Boolean, default: false },
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restrictedFields: {
        reporterName: { type: String, select: false }, // Hidden from CaseManager
      },
      escalationStatus: {
        type: String,
        enum: ["Not Escalated", "Safeguarding Team", "Investigation", "CMT Review", "Action Taken"],
        default: "Not Escalated",
      },
    //   tasks: [
    //     {
    //       title: String,
    //       assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //       deadline: Date,
    //       status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
    //       assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //       accessLevel: { type: String, enum: ["read-only", "edit"], default: "read-only" },
    //     },
    //   ],
      accessTracking: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          accessLevel: String, // "read-only" or "edit"
          grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      status: { type: String, enum: ['Pending', 'In Progress', 'Closed'], default: 'Pending' },
      
      isNew: {
        type: Boolean,
        default: true  // All incidents start as new/unread
      },
      viewedBy: [{ //viewedBy → Tracks unread incidents.
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        viewedAt: {
          type: Date,
          default: Date.now
        }
      }],
      commentViewedBy: [ //commentViewedBy → Tracks unread comments separately.
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          viewedAt: Date
        }
      ]  
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
