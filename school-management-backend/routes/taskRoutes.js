const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const { getTasks, addTask, updateTask} = require("../controllers/taskController");

router.get("/", auth, getTasks);
router.post("/", auth, addTask);
router.put("/:id", auth, updateTask);

module.exports = router;


