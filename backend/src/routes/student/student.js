const express = require("express")
const student = require('../../controllers/students/student')
const router = express.Router();

router.get('/students', student.get_students)

module.exports = router;