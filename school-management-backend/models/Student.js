const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true},
    class: { type: String, required: true},
    age: Number,
},
{ timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);