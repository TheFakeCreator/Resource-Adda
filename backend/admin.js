const { Schema, model } = require("mongoose");


const adminSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}
})

const adminDoc = model('Admin', adminSchema)
module.exports = adminDoc