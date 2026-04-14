const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true},
        description: String,
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
        },
        status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending"
        },
    },
    { timestamps: true}
);

module.exports = mongoose.model("Task", taskSchema);