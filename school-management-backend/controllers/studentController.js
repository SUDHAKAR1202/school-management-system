const Student = require("../models/Student");

exports.getStudents = async (req, res) => {
    const students = await Student.find();
    res.json(students);
}

exports.addStudent = async (req,res) => {
    const student = new Student(req.body);
    await student.save();
    res.json(student);
}

exports.updateStudent = async (req,res) => {
    const student = await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(student);
}

exports.deleteStudent = async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ msg: "Student deleted"});
}