const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: {
        type: String,
        //required: true,
        unique: true,
        nullable: true,
        sparse: true, // Allows multiple documents with null values for email
      },
    password: { type: String, required: true },// Ensure passwords are hashed
    role: { type: String, default: "user", enum: ["super_admin", "asset_safeguarding", "child_safeguarding", "youth_adult", "data_breach","user", "Leader", "Assignee"], required: true },
    permissions: { 
        type: Map, 
        of: String, // "read-only" or "edit"
        },
    createdAt: { type: Date, default: Date.now },
    incidents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Incident' }], // Array of linked incidents
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
