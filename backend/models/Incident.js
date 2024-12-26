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
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
