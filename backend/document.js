const { Schema, model } = require("mongoose");

const docSchema = new Schema({
    fileUrl: { type: String, required: true },
    branch: {
        type: String,
        required: true,
        trim: true,
    },
    sem: {
        type: String,
        required: true,
        trim: true,
    },
    fileName: { type: String, required: true },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    uploadedAt: { type: Date, default: Date.now },
    unit: {
        type: String,
        required: true,
        trim: true,
    },
});

// Middleware to modify the branch and subject to uppercase
docSchema.pre("save", function (next) {
    const doc = this;

    // Convert branch and subject to uppercase
    if (doc.subject) {
        doc.subject = doc.subject.toUpperCase();
    }

    if(doc.unit){
        doc.unit = doc.unit.toUpperCase();
    }

    next();
});

const Document = model("Document", docSchema);
module.exports = Document;