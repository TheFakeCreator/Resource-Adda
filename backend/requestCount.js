const mongoose = require("mongoose");

const requestCountSchema = new mongoose.Schema({
    date: { type: Date, required: true, default: Date.now }, // Date for which the count is being stored
    count: { type: Number, required: true }, // Number of requests
});

const RequestCount = mongoose.model("RequestCount", requestCountSchema);
module.exports = RequestCount;
