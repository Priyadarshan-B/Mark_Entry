const express = require("express")
const course = require('../../controllers/course/course');
const router = express.Router();

router.get('/course', course.get_course)

module.exports = router