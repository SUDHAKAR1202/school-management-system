const Task = require("../models/Task");

exports.getTasks = async (req, res) => {
    const Tasks = await Task.find().populate("studentId");
    res.json(tasks);
};


exports.addTask = async (req, res) => {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
};

exports.updateTask = async (req,res) => {
    const task = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(task);
}