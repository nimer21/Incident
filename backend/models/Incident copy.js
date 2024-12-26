const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    nature: { type: String, required: true },
    involved: {
        victim: { type: String, required: true },
        perpetrator: { type: String, required: true },
    },
    location: { type: String, required: true },
    dateTime: { type: Date, required: true },
    immediateActions: String,
    riskAssessment: {
        immediateDanger: { type: Boolean, default: false },
        interventionRequired: { type: Boolean, default: false },
        severityLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    },
    outcome: {
        acknowledged: { type: Boolean, default: false },
        supportProvided: { type: Boolean, default: false },
        escalatedToSafeguardingTeam: { type: Boolean, default: false },
    }
});

module.exports = mongoose.model('Incident', IncidentSchema);