const mongoose = require("mongoose");

const ContributionSchema = new mongoose.Schema({
    branch: {
        type: String,
        required: true, // Branch is required
        trim: true,
    },
    sem: {
        type: String,
        required: true, // Semester is required
    },
    subject: {
        type: String,
        required: true, // Subject is required
        trim: true,
        uppercase: true, // Automatically converts subject to uppercase before saving
    },
    unit: {
        type: String,
        required: true,
        trim: true,
    },
    filename: {
        type: String,
        required: true, // File name is required
        trim: true,
    },
    fileUrl: {
        type: String,
        required: true, // File URL is required
        trim: true,
    },
    email: {
        type: String,
        required: true, // Email is required
        trim: true,
        match: [/.+@.+\..+/, "Please enter a valid email address"], // Email validation
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"], // Status must be one of these values
        default: "pending",
        required: true, // Status is required
    },
    admin_comments: {
        type: String,
        default: "", // Optional, no required validation
        trim: true,
    },
    submitted_at: {
        type: Date,
        default: Date.now, // Automatically set when document is created
        required: true, // Required to track submission time
    },
    approved_at: {
        type: Date, // Set when admin approves
        default: null, // Not required because it will only be set on approval
    },
});

// Middleware to modify the subject to uppercase and validate the unit and sem
ContributionSchema.pre("save", function (next) {
    const contribution = this;

    // Convert subject to uppercase
    if (contribution.subject) {
        contribution.subject = contribution.subject.toUpperCase();
    }
    if (contribution.unit) {
        contribution.unit = contribution.unit.toUpperCase();
    }
    next();
});

module.exports = mongoose.model("Contribution", ContributionSchema);
